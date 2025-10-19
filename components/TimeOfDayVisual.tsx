import React from 'react';

interface TimeOfDayVisualProps {
    currentPrayer: string | null;
}

const prayerToImageMap: { [key: string]: string } = {
    Fajr: 'https://static.vecteezy.com/system/resources/previews/021/458/598/original/cute-sun-cartoon-icon-illustration-vector.jpg',
    Sunrise: 'https://static.vecteezy.com/system/resources/previews/021/458/598/original/cute-sun-cartoon-icon-illustration-vector.jpg',
    Dhuhr: 'https://img.freepik.com/free-vector/flat-sun-illustration_23-2148890288.jpg',
    Asr: 'https://static.vecteezy.com/system/resources/previews/022/806/335/original/cute-sunset-illustration-on-transparent-background-free-png.png',
    Maghrib: 'https://static.vecteezy.com/system/resources/previews/009/302/831/original/cute-moon-and-stars-kawaii-character-sticker-free-vector.jpg',
    Isha: 'https://static.vecteezy.com/system/resources/previews/009/302/831/original/cute-moon-and-stars-kawaii-character-sticker-free-vector.jpg',
};

const defaultImage = prayerToImageMap.Dhuhr; // Default to a sunny day image

const TimeOfDayVisual: React.FC<TimeOfDayVisualProps> = ({ currentPrayer }) => {
    const imageUrl = currentPrayer ? (prayerToImageMap[currentPrayer] || defaultImage) : defaultImage;

    return (
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4 border-white">
            <img src={imageUrl} alt="Cute visual for the time of day" className="w-full h-full object-cover" />
        </div>
    );
};

export default TimeOfDayVisual;
