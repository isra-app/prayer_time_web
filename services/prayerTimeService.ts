import type { PrayerTimes, LocationData } from '../types';

interface AladhanDate {
    readable: string;
    hijri: {
        date: string;
        day: string;
        month: {
            number: number;
            en: string;
        };
        year: string;
        designation: {
            abbreviated: string;
        };
    };
}

interface AladhanResponse {
    code: number;
    status: string;
    data: {
        timings: PrayerTimes;
        date: AladhanDate;
    };
}

interface BigDataCloudResponse {
    city: string;
    countryName: string;
}

export async function getPrayerTimes(latitude: number, longitude: number, date: string, method: number): Promise<{ timings: PrayerTimes; locationInfo: LocationData; hijriDate: string }> {
    // Fetch prayer times
    const prayerApiUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const prayerResponse = await fetch(prayerApiUrl);
    if (!prayerResponse.ok) {
        throw new Error('Failed to fetch prayer times');
    }
    const prayerData: AladhanResponse = await prayerResponse.json();

    // Fetch location info
    const locationApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const locationResponse = await fetch(locationApiUrl);
    if (!locationResponse.ok) {
        throw new Error('Failed to fetch location data');
    }
    const locationData: BigDataCloudResponse = await locationResponse.json();

    const hijri = prayerData.data.date.hijri;
    const formattedHijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} ${hijri.designation.abbreviated}`;

    return {
        timings: prayerData.data.timings,
        locationInfo: {
            city: locationData.city || 'Unknown City',
            countryName: locationData.countryName || 'Unknown Country',
        },
        hijriDate: formattedHijriDate,
    };
}