import React from 'react';

interface TimeOfDayVisualProps {
    currentPrayer: string | null;
}

const prayerToGifMap: { [key: string]: string } = {
    Fajr: 'https://media.giphy.com/media/3oFzmhYBKsIsSg3pyU/giphy.gif',
    Sunrise: 'https://media.giphy.com/media/3oFzmhYBKsIsSg3pyU/giphy.gif',
    Dhuhr: 'https://media.giphy.com/media/3o7TKtnFxAhtd4PMaI/giphy.gif',
    Asr: 'https://media.giphy.com/media/1P6T2pL7d66p2/giphy.gif',
    Maghrib: 'https://media.giphy.com/media/3og0IMJcSIa7r5m3gA/giphy.gif',
    Isha: 'https://media.giphy.com/media/3og0IMJcSIa7r5m3gA/giphy.gif',
};

const defaultGif = prayerToGifMap.Dhuhr; // Default to a sunny day GIF

const TimeOfDayVisual: React.FC<TimeOfDayVisualProps> = ({ currentPrayer }) => {
    const gifUrl = currentPrayer ? (prayerToGifMap[currentPrayer] || defaultGif) : defaultGif;

    return (
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4 border-white">
            <img src={gifUrl} alt="Visual representation for the time of day" className="w-full h-full object-cover" />
        </div>
    );
};

export default TimeOfDayVisual;