// Fix: Import ReactElement to resolve "Cannot find namespace 'JSX'" error in a .ts file.
import type { ReactElement } from 'react';

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export interface LocationData {
    city: string;
    countryName: string;
}

export interface Prayer {
    name: string;
    time: string;
    icon: ReactElement;
}

export interface City {
    name: string;
    country: string; // Country code
    latitude: number;
    longitude: number;
}

export interface Country {
    name: string;
    code: string;
}

export interface SavedData {
    city: City;
}
