
import React, { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes, LocationData, Prayer, City, Country } from './types';
import { getPrayerTimes } from './services/prayerTimeService';
import { countries, cities } from './data/cities';
import { FajrIcon, DhuhrIcon, AsrIcon, MaghribIcon, IshaIcon, SunriseIcon } from './components/PrayerIcons';
import PrayerTimeCard from './components/PrayerTimeCard';
import LoadingSpinner from './components/LoadingSpinner';

type UIState = 'manual' | 'loading' | 'loaded' | 'error';
const LOCAL_STORAGE_KEY = 'prayer-times-location';
const DEFAULT_CITY_NAME = 'Kozhikode';

const App: React.FC = () => {
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentPrayerName, setCurrentPrayerName] = useState<string | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeToNextPrayer, setTimeToNextPrayer] = useState<string | null>(null);
    const [uiState, setUiState] = useState<UIState>('loading');

    // State for manual selection
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    const updatePrayerStatus = useCallback(() => {
        if (!prayerTimes) {
            setCurrentPrayerName(null);
            setNextPrayerName(null);
            return;
        }

        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        const prayersWithMinutes = (Object.entries(prayerTimes) as [string, string][])
            .filter(([name]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name))
            .map(([name, time]) => {
                const [hours, minutes] = time.split(':').map(Number);
                return { name, timeInMinutes: hours * 60 + minutes };
            })
            .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

        let currentPrayer: { name: string; timeInMinutes: number } | null = null;
        let nextPrayer: { name: string; timeInMinutes: number } | null = null;
        
        const passedPrayers = prayersWithMinutes.filter(p => p.timeInMinutes <= currentTimeInMinutes);
        if (passedPrayers.length > 0) {
            currentPrayer = passedPrayers[passedPrayers.length - 1];
        } else {
            // Before Fajr today, so current prayer is Isha from yesterday
            currentPrayer = prayersWithMinutes.find(p => p.name === 'Isha') || prayersWithMinutes[prayersWithMinutes.length - 1];
        }
        
        const upcomingPrayers = prayersWithMinutes.filter(p => p.timeInMinutes > currentTimeInMinutes);
        if (upcomingPrayers.length > 0) {
            nextPrayer = upcomingPrayers[0];
        } else {
            // After Isha, so next prayer is Fajr tomorrow
            nextPrayer = prayersWithMinutes[0];
        }

        setCurrentPrayerName(currentPrayer ? currentPrayer.name : null);
        setNextPrayerName(nextPrayer ? nextPrayer.name : null);

    }, [prayerTimes]);

    useEffect(() => {
        updatePrayerStatus();
        const interval = setInterval(updatePrayerStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [updatePrayerStatus]);
    
    useEffect(() => {
        if (!nextPrayerName || !prayerTimes) {
            setTimeToNextPrayer(null);
            return;
        }

        const timerInterval = setInterval(() => {
            const nextPrayerTimeStr = prayerTimes[nextPrayerName as keyof PrayerTimes];
            if (!nextPrayerTimeStr) return;

            const now = new Date();
            const [hours, minutes] = nextPrayerTimeStr.split(':').map(Number);

            let nextPrayerDate = new Date();
            nextPrayerDate.setHours(hours, minutes, 0, 0);

            // If the prayer time has already passed today, it must be for tomorrow
            if (nextPrayerDate < now) {
                nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
            }

            const diff = nextPrayerDate.getTime() - now.getTime();

            if (diff < 0) {
                setTimeToNextPrayer(null);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            setTimeToNextPrayer(formattedTime);

        }, 1000);

        return () => clearInterval(timerInterval);

    }, [nextPrayerName, prayerTimes]);

    const fetchPrayerData = useCallback(async (latitude: number, longitude: number, cityName?: string) => {
        setUiState('loading');
        setError(null);
        setPrayerTimes(null);
        try {
            const today = new Date();
            const dateString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
            setCurrentDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            
            const { timings, locationInfo } = await getPrayerTimes(latitude, longitude, dateString);
            setPrayerTimes(timings);
            setLocationData({
                city: locationInfo.city !== 'Unknown City' ? locationInfo.city : cityName || 'Selected Location',
                countryName: locationInfo.countryName,
            });
            setUiState('loaded');
        } catch (err) {
            setError('Could not fetch prayer times. Please try again later.');
            setUiState('error');
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const loadDefaultLocation = () => {
            try {
                const savedLocationJson = localStorage.getItem(LOCAL_STORAGE_KEY);
                let locationToLoad: City | undefined;

                if (savedLocationJson) {
                    const savedLocation = JSON.parse(savedLocationJson) as City;
                    // Verify the saved location still exists in our city list
                    locationToLoad = cities.find(c => c.name === savedLocation.name && c.country === savedLocation.country);
                }
                
                if (!locationToLoad) {
                    locationToLoad = cities.find(c => c.name === DEFAULT_CITY_NAME);
                }

                if (locationToLoad) {
                    const countryCode = locationToLoad.country;
                    setSelectedCountry(countryCode);
                    setAvailableCities(cities.filter(c => c.country === countryCode));
                    setSelectedCity(locationToLoad.name);
                    fetchPrayerData(locationToLoad.latitude, locationToLoad.longitude, locationToLoad.name);
                } else {
                    console.error("Default city not found in data.");
                    setError('Default location data is missing. Please select a location manually.');
                    setUiState('manual');
                }
            } catch (e) {
                 console.error('Failed to load saved location:', e);
                 setError('Could not load your saved location. Please select one manually.');
                 setUiState('manual');
            }
        };
        loadDefaultLocation();
    }, [fetchPrayerData]);

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = event.target.value;
        setSelectedCountry(countryCode);
        setSelectedCity(''); // Reset city selection
        setPrayerTimes(null);
        setLocationData(null);
        setAvailableCities(cities.filter(c => c.country === countryCode));
    };

    const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = event.target.value;
        setSelectedCity(cityName);
        const city = cities.find(c => c.name === cityName && c.country === selectedCountry);
        if (city) {
            fetchPrayerData(city.latitude, city.longitude, city.name);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(city));
            } catch (e) {
                console.error("Failed to save location to local storage", e);
            }
        }
    };
    
    const prayerSchedule: Prayer[] = prayerTimes ? [
        { name: 'Fajr', time: prayerTimes.Fajr, icon: <FajrIcon /> },
        { name: 'Sunrise', time: prayerTimes.Sunrise, icon: <SunriseIcon /> },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: <DhuhrIcon /> },
        { name: 'Asr', time: prayerTimes.Asr, icon: <AsrIcon /> },
        { name: 'Maghrib', time: prayerTimes.Maghrib, icon: <MaghribIcon /> },
        { name: 'Isha', time: prayerTimes.Isha, icon: <IshaIcon /> },
    ] : [];

    const renderContent = () => {
        switch (uiState) {
            case 'manual':
                 return (
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Location</h1>
                        <p className="text-gray-600 mb-6">Please select your location to see prayer times.</p>
                        <div className="max-w-md mx-auto space-y-4">
                             <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E] transition-colors"
                                aria-label="Select a country"
                            >
                                <option value="" disabled>Select a Country</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedCity}
                                onChange={handleCityChange}
                                disabled={!selectedCountry}
                                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E] transition-colors disabled:bg-gray-100"
                                aria-label="Select a city"
                            >
                                <option value="" disabled>Select a City</option>
                                {availableCities.map(city => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg text-[#158C6E]">Fetching prayer times...</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8 bg-red-100 rounded-lg">
                        <p className="text-xl text-red-700">{error}</p>

                        <button
                            onClick={() => setUiState('manual')}
                            className="mt-6 px-6 py-2 bg-[#158C6E] text-white hover:bg-[#117a5d] rounded-lg font-semibold transition-colors"
                        >
                            Select Manually
                        </button>
                    </div>
                );
            case 'loaded':
                if (locationData && prayerTimes) {
                    return (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-4xl md:text-5xl font-bold text-[#158C6E] tracking-wider">{locationData.city}</h1>
                                <p className="text-lg text-gray-600">{locationData.countryName}</p>
                                <p className="mt-4 text-md text-gray-700">{currentDate}</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">{currentTime}</p>
                                <button onClick={() => setUiState('manual')} className="mt-4 text-sm text-[#158C6E] hover:underline">
                                    Change Location
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                                {prayerSchedule.map((prayer) => (
                                    <PrayerTimeCard 
                                        key={prayer.name} 
                                        prayer={prayer} 
                                        isCurrent={prayer.name === currentPrayerName}
                                        isNext={prayer.name === nextPrayerName}
                                        countdown={prayer.name === nextPrayerName ? timeToNextPrayer : undefined}
                                     />
                                ))}
                            </div>
                        </>
                    );
                }
                return null;
            default:
                return null;
        }
    };


    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans p-4 md:p-8 flex flex-col items-center justify-center relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(21,140,110,0.1),_transparent_40%)]"></div>
            <main className="w-full max-w-6xl mx-auto z-10">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
