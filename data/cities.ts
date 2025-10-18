import type { City, Country } from '../types';

export const countries: Country[] = [
    { name: 'India', code: 'IN' },
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'South Africa', code: 'ZA' },
];

export const cities: City[] = [
    // India
    { name: 'Kozhikode', country: 'IN', latitude: 11.2588, longitude: 75.7804 },
    { name: 'Kochi', country: 'IN', latitude: 9.9312, longitude: 76.2673 },
    { name: 'Delhi', country: 'IN', latitude: 28.7041, longitude: 77.1025 },
    { name: 'Mumbai', country: 'IN', latitude: 19.0760, longitude: 72.8777 },
    { name: 'Bengaluru', country: 'IN', latitude: 12.9716, longitude: 77.5946 },
    { name: 'Chennai', country: 'IN', latitude: 13.0827, longitude: 80.2707 },
    { name: 'Hyderabad', country: 'IN', latitude: 17.3850, longitude: 78.4867 },
    { name: 'Kolkata', country: 'IN', latitude: 22.5726, longitude: 88.3639 },
    // Kerala Districts
    { name: 'Thiruvananthapuram', country: 'IN', latitude: 8.5241, longitude: 76.9366 },
    { name: 'Kollam', country: 'IN', latitude: 8.8932, longitude: 76.6141 },
    { name: 'Pathanamthitta', country: 'IN', latitude: 9.2648, longitude: 76.7870 },
    { name: 'Alappuzha', country: 'IN', latitude: 9.4981, longitude: 76.3388 },
    { name: 'Kottayam', country: 'IN', latitude: 9.5914, longitude: 76.5222 },
    { name: 'Idukki', country: 'IN', latitude: 9.8459, longitude: 76.9742 },
    { name: 'Ernakulam', country: 'IN', latitude: 9.9816, longitude: 76.2996 },
    { name: 'Thrissur', country: 'IN', latitude: 10.5276, longitude: 76.2144 },
    { name: 'Palakkad', country: 'IN', latitude: 10.7867, longitude: 76.6548 },
    { name: 'Malappuram', country: 'IN', latitude: 11.0736, longitude: 76.0741 },
    { name: 'Wayanad', country: 'IN', latitude: 11.6854, longitude: 76.1320 },
    { name: 'Kannur', country: 'IN', latitude: 11.8745, longitude: 75.3704 },
    { name: 'Kasaragod', country: 'IN', latitude: 12.5089, longitude: 74.9877 },

    // United States
    { name: 'New York', country: 'US', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Los Angeles', country: 'US', latitude: 34.0522, longitude: -118.2437 },
    { name: 'Chicago', country: 'US', latitude: 41.8781, longitude: -87.6298 },
    { name: 'Houston', country: 'US', latitude: 29.7604, longitude: -95.3698 },
    { name: 'Dearborn', country: 'US', latitude: 42.3223, longitude: -83.1763 },

    // United Kingdom
    { name: 'London', country: 'GB', latitude: 51.5074, longitude: -0.1278 },
    { name: 'Manchester', country: 'GB', latitude: 53.4808, longitude: -2.2426 },
    { name: 'Birmingham', country: 'GB', latitude: 52.4862, longitude: -1.8904 },
    { name: 'Bradford', country: 'GB', latitude: 53.7997, longitude: -1.7533 },

    // Canada
    { name: 'Toronto', country: 'CA', latitude: 43.6532, longitude: -79.3832 },
    { name: 'Montreal', country: 'CA', latitude: 45.5017, longitude: -73.5673 },
    { name: 'Vancouver', country: 'CA', latitude: 49.2827, longitude: -123.1207 },
    
    // Australia
    { name: 'Sydney', country: 'AU', latitude: -33.8688, longitude: 151.2093 },
    { name: 'Melbourne', country: 'AU', latitude: -37.8136, longitude: 144.9631 },

    // Saudi Arabia
    { name: 'Riyadh', country: 'SA', latitude: 24.7136, longitude: 46.6753 },
    { name: 'Jeddah', country: 'SA', latitude: 21.4858, longitude: 39.1925 },
    { name: 'Mecca', country: 'SA', latitude: 21.3891, longitude: 39.8579 },
    { name: 'Medina', country: 'SA', latitude: 24.4686, longitude: 39.6142 },

    // United Arab Emirates
    { name: 'Dubai', country: 'AE', latitude: 25.276987, longitude: 55.296249 },
    { name: 'Abu Dhabi', country: 'AE', latitude: 24.4539, longitude: 54.3773 },
    { name: 'Sharjah', country: 'AE', latitude: 25.3463, longitude: 55.4209 },

    // Pakistan
    { name: 'Karachi', country: 'PK', latitude: 24.8607, longitude: 67.0011 },
    { name: 'Lahore', country: 'PK', latitude: 31.5204, longitude: 74.3587 },
    { name: 'Islamabad', country: 'PK', latitude: 33.6844, longitude: 73.0479 },
    
    // Indonesia
    { name: 'Jakarta', country: 'ID', latitude: -6.2088, longitude: 106.8456 },
    { name: 'Surabaya', country: 'ID', latitude: -7.2575, longitude: 112.7521 },

    // Malaysia
    { name: 'Kuala Lumpur', country: 'MY', latitude: 3.1390, longitude: 101.6869 },
    { name: 'Johor Bahru', country: 'MY', latitude: 1.4927, longitude: 103.7414 },

    // Turkey
    { name: 'Istanbul', country: 'TR', latitude: 41.0082, longitude: 28.9784 },
    { name: 'Ankara', country: 'TR', latitude: 39.9334, longitude: 32.8597 },

    // Egypt
    { name: 'Cairo', country: 'EG', latitude: 30.0444, longitude: 31.2357 },
    { name: 'Alexandria', country: 'EG', latitude: 31.2001, longitude: 29.9187 },

    // Nigeria
    { name: 'Lagos', country: 'NG', latitude: 6.5244, longitude: 3.3792 },
    { name: 'Kano', country: 'NG', latitude: 12.0022, longitude: 8.5920 },

    // Bangladesh
    { name: 'Dhaka', country: 'BD', latitude: 23.8103, longitude: 90.4125 },
    { name: 'Chittagong', country: 'BD', latitude: 22.3569, longitude: 91.7832 },

    // Germany
    { name: 'Berlin', country: 'DE', latitude: 52.5200, longitude: 13.4050 },
    { name: 'Frankfurt', country: 'DE', latitude: 50.1109, longitude: 8.6821 },
    
    // France
    { name: 'Paris', country: 'FR', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Marseille', country: 'FR', latitude: 43.2965, longitude: 5.3698 },

    // South Africa
    { name: 'Cape Town', country: 'ZA', latitude: -33.9249, longitude: 18.4241 },
    { name: 'Johannesburg', country: 'ZA', latitude: -26.2041, longitude: 28.0473 },
];
