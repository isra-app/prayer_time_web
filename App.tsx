
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

    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [activeMethodName, setActiveMethodName] = useState<string>('');

    const [manualLat, setManualLat] = useState<string>('');
    const [manualLong, setManualLong] = useState<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const updatePrayerStatus = useCallback(() => {
        if (!prayerTimes) return;
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        const prayersWithMinutes = (Object.entries(prayerTimes) as [string, string][])
            .filter(([name]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name))
            .map(([name, time]) => {
                const [hours, minutes] = time.split(':').map(Number);
                return { name, timeInMinutes: hours * 60 + minutes };
            })
            .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

        let currentPrayer = prayersWithMinutes[prayersWithMinutes.length - 1];
        let nextPrayer = prayersWithMinutes[0];

        for (let i = 0; i < prayersWithMinutes.length; i++) {
            if (currentTimeInMinutes >= prayersWithMinutes[i].timeInMinutes) {
                currentPrayer = prayersWithMinutes[i];
                nextPrayer = prayersWithMinutes[(i + 1) % prayersWithMinutes.length];
            }
        }

        setCurrentPrayerName(currentPrayer.name);
        setNextPrayerName(nextPrayer.name);
    }, [prayerTimes]);

    useEffect(() => {
        updatePrayerStatus();
        const interval = setInterval(updatePrayerStatus, 60000);
        return () => clearInterval(interval);
    }, [updatePrayerStatus]);

    useEffect(() => {
        if (!nextPrayerName || !prayerTimes) return;
        const timerInterval = setInterval(() => {
            const nextPrayerTimeStr = prayerTimes[nextPrayerName as keyof PrayerTimes];
            if (!nextPrayerTimeStr) return;
            const now = new Date();
            const [hours, minutes] = nextPrayerTimeStr.split(':').map(Number);
            let nextDate = new Date();
            nextDate.setHours(hours, minutes, 0, 0);
            if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1);
            const diff = nextDate.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeToNextPrayer(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timerInterval);
    }, [nextPrayerName, prayerTimes]);

    const fetchPrayerData = useCallback(async (latitude: number, longitude: number, method: number, cityName?: string) => {
        setUiState('loading');
        setError(null);
        try {
            const today = new Date();
            const dateString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
            const { timings, locationInfo, hijriDate } = await getPrayerTimes(latitude, longitude, dateString, method);
            setPrayerTimes(timings);
            setLocationData({
                city: cityName || (locationInfo.city !== 'Unknown City' ? locationInfo.city : 'Custom Location'),
                countryName: locationInfo.countryName,
            });
            setHijriDate(hijriDate);
            setActiveMethodName(calculationMethodNames[method] || 'Standard');
            setCurrentDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            setUiState('loaded');
        } catch (err) {
            setError('Could not fetch data. Please try again.');
            setUiState('error');
        }
    }, []);

    useEffect(() => {
        const loadInitial = () => {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            let city = cities.find(c => c.name === DEFAULT_CITY_NAME);
            if (saved) {
                const parsed = JSON.parse(saved) as SavedData;
                city = cities.find(c => c.name === parsed.city.name) || city;
            }
            if (city) {
                fetchPrayerData(city.latitude, city.longitude, getMethodForCountry(city.country), city.name);
            } else {
                setUiState('manual');
            }
        };
        loadInitial();
    }, [fetchPrayerData]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedCountry(code);
        setAvailableCities(cities.filter(c => c.country === code));
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.value;
        const city = cities.find(c => c.name === name && c.country === selectedCountry);
        if (city) {
            fetchPrayerData(city.latitude, city.longitude, getMethodForCountry(city.country), city.name);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ city }));
        }
    };

    const handleManual = (e: React.FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLong);
        if (!isNaN(lat) && !isNaN(lon)) fetchPrayerData(lat, lon, 1);
    };

    const renderContent = () => {
        if (uiState === 'loading') return (
            <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner />
                <p className="mt-4 text-[#158C6E] font-medium">Updating timings...</p>
            </div>
        );

        if (uiState === 'error') return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => setUiState('manual')} className="px-6 py-2 bg-[#158C6E] text-white rounded-lg">Try Again</button>
            </div>
        );

        if (uiState === 'manual') return (
            <div className="max-w-md mx-auto w-full px-4 animate-fade-in text-center flex flex-col justify-center h-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Select Location</h1>
                <div className="space-y-4 mb-8">
                    <select value={selectedCountry} onChange={handleCountryChange} className="w-full p-3 border rounded-xl outline-none">
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <select value={selectedCity} onChange={(e) => {setSelectedCity(e.target.value); handleCityChange(e);}} disabled={!selectedCountry} className="w-full p-3 border rounded-xl outline-none disabled:bg-gray-50">
                        <option value="">Select City</option>
                        {availableCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div className="relative flex items-center mb-8">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or Coordinates</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <form onSubmit={handleManual} className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Lat" value={manualLat} onChange={e => setManualLat(e.target.value)} className="p-3 border rounded-xl" />
                    <input type="text" placeholder="Long" value={manualLong} onChange={e => setManualLong(e.target.value)} className="p-3 border rounded-xl" />
                    <button type="submit" className="col-span-2 py-3 bg-[#158C6E] text-white rounded-xl font-bold">Show Times</button>
                </form>
            </div>
        );

        if (uiState === 'loaded' && locationData && prayerTimes) {
            const prayers: Prayer[] = [
                { name: 'Fajr', time: prayerTimes.Fajr, icon: <FajrIcon /> },
                { name: 'Sunrise', time: prayerTimes.Sunrise, icon: <SunriseIcon /> },
                { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: <DhuhrIcon /> },
                { name: 'Asr', time: prayerTimes.Asr, icon: <AsrIcon /> },
                { name: 'Maghrib', time: prayerTimes.Maghrib, icon: <MaghribIcon /> },
                { name: 'Isha', time: prayerTimes.Isha, icon: <IshaIcon /> },
            ];

            return (
                <div className="w-full flex flex-col h-full pt-8 md:pt-16 pb-8 animate-fade-in overflow-hidden">
                    <header className="text-center mb-6 md:mb-10 flex-shrink-0">
                        <h1 className="text-4xl md:text-7xl font-extrabold text-[#158C6E] tracking-tighter mb-1 font-sans">
                            {locationData.city}
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 font-medium">{locationData.countryName}</p>
                        <div className="mt-4 md:mt-6 flex flex-col items-center">
                            <p className="text-gray-400 text-xs md:text-sm">{currentDate}</p>
                            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{hijriDate}</p>
                        </div>
                    </header>

                    <section className="flex-grow flex flex-col items-center justify-center min-h-0">
                        <div className="text-center mb-6 md:mb-12">
                            <div className="text-5xl md:text-8xl font-black text-gray-900 tabular-nums tracking-tighter leading-none mb-4 md:mb-6">
                                {currentTime}
                            </div>
                            {nextPrayerName && timeToNextPrayer && (
                                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 md:px-6 md:py-3 rounded-2xl shadow-sm">
                                    <span className="text-[10px] md:text-xs font-bold text-emerald-800 uppercase tracking-widest">{nextPrayerName} in</span>
                                    <span className="text-xl md:text-3xl font-black text-[#158C6E] tabular-nums leading-none">{timeToNextPrayer}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5 w-full max-w-5xl px-4">
                            {prayers.map(p => (
                                <PrayerTimeCard 
                                    key={p.name} 
                                    prayer={p} 
                                    isCurrent={p.name === currentPrayerName} 
                                    isNext={p.name === nextPrayerName} 
                                />
                            ))}
                        </div>
                    </section>

                    <footer className="text-center mt-6 md:mt-12 flex-shrink-0 pb-2">
                        <button 
                            onClick={() => setUiState('manual')}
                            className="text-[11px] md:text-xs font-bold text-[#158C6E] uppercase tracking-widest hover:bg-emerald-50 px-6 py-3 rounded-full transition-all flex items-center gap-2 mx-auto"
                        >
                            <i className="fa-solid fa-map-location-dot"></i>
                            Change Location
                        </button>
                        <p className="mt-4 text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">Method: {activeMethodName}</p>
                    </footer>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-screen w-screen bg-white text-gray-800 flex flex-col items-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(21,140,110,0.06),_transparent_60%)] pointer-events-none -z-10"></div>
            <main className="w-full h-full max-w-7xl mx-auto flex flex-col">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
