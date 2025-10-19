import React from 'react';

type NotificationPermission = 'granted' | 'denied' | 'default';

interface NotificationToggleProps {
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
    permission: NotificationPermission;
    requestPermission: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ isEnabled, onToggle, permission, requestPermission }) => {
    const handleToggle = async () => {
        if (!isEnabled) {
            // Trying to enable notifications
            if (permission === 'default') {
                requestPermission(); // App.tsx will handle the permission result and update state
            } else if (permission === 'granted') {
                onToggle(true);
            } else if (permission === 'denied') {
                alert("Notification permission has been denied. Please enable it in your browser settings to receive alerts.");
            }
        } else {
            // Disabling notifications
            onToggle(false);
        }
    };

    const isToggleDisabled = !isEnabled && permission === 'denied';

    return (
        <div className="flex items-center justify-center space-x-2">
            <span className={`text-sm font-medium ${isToggleDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                Prayer Notifications
            </span>
            <button
                onClick={handleToggle}
                disabled={isToggleDisabled}
                role="switch"
                aria-checked={isEnabled}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#158C6E] ${
                    isEnabled ? 'bg-[#158C6E]' : 'bg-gray-300'
                } ${isToggleDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};

export default NotificationToggle;
