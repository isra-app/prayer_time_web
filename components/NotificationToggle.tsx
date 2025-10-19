import React from 'react';

type NotificationPermission = 'granted' | 'denied' | 'default';

interface NotificationToggleProps {
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
    permission: NotificationPermission;
    requestPermission: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ isEnabled, onToggle, permission, requestPermission }) => {
    const handleToggle = () => {
        // If notifications are currently enabled, the user is trying to disable them.
        if (isEnabled) {
            onToggle(false);
            return;
        }

        // If notifications are disabled, the user is trying to enable them.
        // We need to check the current permission status.
        if (permission === 'granted') {
            // Permission is already granted, so just enable the feature.
            onToggle(true);
        } else if (permission === 'default') {
            // We need to ask the user for permission.
            // The parent component will handle the outcome of this request.
            requestPermission();
        } else if (permission === 'denied') {
            // Permission has been explicitly denied by the user.
            // We cannot re-prompt. Inform the user how to fix this.
            alert("To enable notifications, you need to change the permission in your browser's site settings.");
        }
    };

    const isToggleDisabled = !isEnabled && permission === 'denied';

    return (
        <div className="flex flex-col items-center justify-center space-y-1">
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
                    aria-label="Toggle prayer notifications"
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            {permission === 'denied' && (
                <p className="text-xs text-red-600 max-w-xs text-center">
                    Notifications blocked. Please enable them in your browser settings.
                </p>
            )}
        </div>
    );
};

export default NotificationToggle;
