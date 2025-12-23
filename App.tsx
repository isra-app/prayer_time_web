
import React, { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes, LocationData, Prayer, City, Country, SavedData } from './types';
import { getPrayerTimes } from './services/prayerTimeService';
import { countries, cities } from './data/cities';
import { FajrIcon, DhuhrIcon, AsrIcon, MaghribIcon, IshaIcon, SunriseIcon } from './components/PrayerIcons';
import PrayerTimeCard from './components/PrayerTimeCard';
import LoadingSpinner from './components/LoadingSpinner';

type UIState = 'manual' | 'loading' | 'loaded' | 'error';
const LOCAL_STORAGE_KEY = 'prayer-times-location-v3';
const DEFAULT_CITY_NAME = 'Kozhikode';

const calculationMethodNames: { [key: number]: string } = {
    1: 'Muslim World League',
    2: 'ISNA (North America)',
    3: 'Egyptian General Authority',
    4: 'Umm Al-Qura University, Makkah',
    5: 'University of Islamic Sciences, Karachi',
    8: 'Kuwait',
    10: 'Qatar',
    11: 'Dubai (UAE)',
    12: 'Moonsighting Committee Worldwide',
    13: 'Ministry of Wakfs, Algeria',
    14: 'Ministry of Habous, Morocco',
};

const getMethodForCountry = (countryCode: string): number => {
    switch (countryCode) {
        case 'US':
        case 'CA':
            return 2; // ISNA
        case 'EG':
        case 'JO':
        case 'LB':
        case 'SY':
        case 'IQ':
            return 3; // Egyptian
        case 'SA':
        case 'BH':
        case 'OM':
            return 4; // Umm Al-Qura, Makkah
        case 'PK':
            return 5; // University of Islamic Sciences, Karachi
        case 'KW':
            return 8; // Kuwait
        case 'QA':
            return 10; // Qatar
        case 'AE':
            return 11; // Dubai
        case 'DZ':
        case 'TN':
            return 13;
        case 'MA':
            return 14;
        default:
            return 1; // Muslim World League (default)
    }
};

const App: React.FC = () => {
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [hijriDate, setHijriDate] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentPrayerName, setCurrentPrayerName] = useState<string | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeToNextPrayer, setTimeToNextPrayer] = useState<string | null>(null);
    const [uiState, setUiState] = useState('loading' as UIState);

    // State for manual selection
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [activeMethodName, setActiveMethodName] = useState<string>('');

    // State for custom coordinates
    const [manualLat, setManualLat] = useState<string>('');
    const [manualLong, setManualLong] = useState<string>('');

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
            currentPrayer = prayersWithMinutes.find(p => p.name === 'Isha') || prayersWithMinutes[prayersWithMinutes.length - 1];
        }
        
        const upcomingPrayers = prayersWithMinutes.filter(p => p.timeInMinutes > currentTimeInMinutes);
        if (upcomingPrayers.length > 0) {
            nextPrayer = upcomingPrayers[0];
        } else {
            nextPrayer = prayersWithMinutes[0];
        }

        setCurrentPrayerName(currentPrayer ? currentPrayer.name : null);
        setNextPrayerName(nextPrayer ? nextPrayer.name : null);

    }, [prayerTimes]);

    useEffect(() => {
        updatePrayerStatus();
        const interval = setInterval(updatePrayerStatus, 60000);
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

    const fetchPrayerData = useCallback(async (latitude: number, longitude: number, method: number, cityName?: string) => {
        setUiState('loading');
        setError(null);
        try {
            const today = new Date();
            const dateString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
            setCurrentDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            
            const { timings, locationInfo, hijriDate } = await getPrayerTimes(latitude, longitude, dateString, method);
            setPrayerTimes(timings);
            setLocationData({
                city: cityName || (locationInfo.city !== 'Unknown City' ? locationInfo.city : 'Selected Location'),
                countryName: locationInfo.countryName,
            });
            setHijriDate(hijriDate);
            setActiveMethodName(calculationMethodNames[method] || 'Default Method');
            setUiState('loaded');
        } catch (err) {
            setError('Could not fetch prayer times. Please try again later.');
            setUiState('error');
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const loadSavedOrDefaultLocation = () => {
            try {
                const savedDataJson = localStorage.getItem(LOCAL_STORAGE_KEY);
                let locationToLoad: City | undefined;

                if (savedDataJson) {
                    const savedData = JSON.parse(savedDataJson) as SavedData;
                    locationToLoad = cities.find(c => c.name === savedData.city.name && c.country === savedData.city.country);
                }
                
                if (!locationToLoad) {
                    locationToLoad = cities.find(c => c.name === DEFAULT_CITY_NAME);
                }

                if (locationToLoad) {
                    const countryCode = locationToLoad.country;
                    const method = getMethodForCountry(countryCode);
                    setSelectedCountry(countryCode);
                    setAvailableCities(cities.filter(c => c.country === countryCode));
                    setSelectedCity(locationToLoad.name);
                    fetchPrayerData(locationToLoad.latitude, locationToLoad.longitude, method, locationToLoad.name);
                } else {
                    setUiState('manual');
                }
            } catch (e) {
                 setUiState('manual');
            }
        };
        loadSavedOrDefaultLocation();
    }, [fetchPrayerData]);

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = event.target.value;
        setSelectedCountry(countryCode);
        setSelectedCity('');
        setAvailableCities(cities.filter(c => c.country === countryCode));
    };

    const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = event.target.value;
        setSelectedCity(cityName);
        const city = cities.find(c => c.name === cityName && c.country === selectedCountry);
        if (city) {
            const method = getMethodForCountry(city.country);
            fetchPrayerData(city.latitude, city.longitude, method, city.name);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ city }));
        }
    };

    const handleManualCoordinates = (e: React.FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(manualLat);
        const long = parseFloat(manualLong);
        if (isNaN(lat) || isNaN(long)) {
            setError("Please enter valid numeric coordinates.");
            return;
        }
        // Using method 1 (Muslim World League) as default for custom coordinates
        fetchPrayerData(lat, long, 1);
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
                    <div className="text-center w-full max-w-md mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Your Location</h1>
                        <p className="text-gray-600 mb-8">Choose a city or enter custom coordinates.</p>
                        <div className="space-y-4 mb-10">
                             <div className="relative">
                                <select
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E] transition-colors"
                                >
                                    <option value="" disabled>Select a Country</option>
                                    {countries.map(country => (
                                        <option key={country.code} value={country.code}>{country.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <i className="fa-solid fa-chevron-down text-sm"></i>
                                </div>
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCity}
                                    onChange={handleCityChange}
                                    disabled={!selectedCountry}
                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E] transition-colors disabled:bg-gray-100"
                                >
                                    <option value="" disabled>Select a City</option>
                                    {availableCities.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <i className="fa-solid fa-chevron-down text-sm"></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Or enter coordinates</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <form onSubmit={handleManualCoordinates} className="grid grid-cols-2 gap-4">
                            <input 
                                type="text" 
                                placeholder="Latitude" 
                                value={manualLat} 
                                onChange={(e) => setManualLat(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E]"
                            />
                            <input 
                                type="text" 
                                placeholder="Longitude" 
                                value={manualLong} 
                                onChange={(e) => setManualLong(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158C6E]"
                            />
                            <button 
                                type="submit" 
                                className="col-span-2 py-2.5 bg-[#158C6E] text-white rounded-lg font-semibold hover:bg-[#117a5d] transition-colors"
                            >
                                Use Coordinates
                            </button>
                        </form>
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
                    <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
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
                            <div className="text-center mb-10 animate-fade-in">
                                <h1 className="text-5xl md:text-7xl font-extrabold text-[#158C6E] tracking-tight mb-1">
                                    {locationData.city}
                                </h1>
                                <p className="text-lg text-gray-600 font-medium">{locationData.countryName}</p>
                                <div className="mt-6 space-y-1">
                                    <p className="text-gray-500 font-medium">{currentDate}</p>
                                    {hijriDate && <p className="text-gray-400">{hijriDate}</p>}
                                </div>
                                <p className="mt-4 text-4xl font-black text-gray-900 tabular-nums">{currentTime}</p>
                                {nextPrayerName && timeToNextPrayer && (
                                    <div className="mt-4 text-2xl text-[#158C6E] font-semibold" aria-live="polite">
                                        {nextPrayerName} in <span className="tabular-nums">{timeToNextPrayer}</span>
                                    </div>
                                )}
                                <div className="mt-8">
                                    <button 
                                        onClick={() => setUiState('manual')} 
                                        className="text-sm font-bold text-[#158C6E] hover:bg-emerald-50 px-4 py-2 rounded-full transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <i className="fa-solid fa-map-location-dot"></i>
                                        Change Location
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                                {prayerSchedule.map((prayer) => (
                                    <PrayerTimeCard 
                                        key={prayer.name} 
                                        prayer={prayer} 
                                        isCurrent={prayer.name === currentPrayerName}
                                        isNext={prayer.name === nextPrayerName}
                                     />
                                ))}
                            </div>
                            <div className="mt-12 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Calculation Method</p>
                                <p className="text-sm text-gray-500">{activeMethodName}</p>
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
        <div className="min-h-screen bg-white text-gray-800 font-sans p-6 md:p-12 flex flex-col items-center justify-center relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(21,140,110,0.08),_transparent_50%)] pointer-events-none"></div>
            <main className="w-full max-w-6xl mx-auto z-10">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
