import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const ThemeContext = createContext();

const STORAGE_KEYS = {
    THEME: 'medisync_theme',
    ACCENT: 'medisync_accent',
    COMPACT: 'medisync_compact',
    CONTRAST: 'medisync_contrast',
    FONT_SIZE: 'medisync_font_size',
    SOUND: 'medisync_sound',
    NOTIFS: 'medisync_notifications',
    PRIVACY_MASK: 'medisync_privacy_mask',
    EXPIRY: 'medisync_default_expiry',
    AUTOLOCK: 'medisync_autolock',
};

export const ThemeProvider = ({ children }) => {
    // Theme Mode: 'light' | 'dark' | 'system'
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    });

    // Resolved effective theme: 'light' | 'dark'
    const [effectiveTheme, setEffectiveTheme] = useState('light');

    // Accent Color Palette
    const [accentColor, setAccentColorState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.ACCENT) || 'teal';
    });

    // Density / Compact Mode
    const [compactMode, setCompactModeState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.COMPACT) === 'true';
    });

    // High Contrast for Clinical Accessibility
    const [highContrast, setHighContrastState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.CONTRAST) === 'true';
    });

    // Font Scaling: 'normal' | 'medium' | 'large'
    const [fontSize, setFontSizeState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || 'normal';
    });

    // Audio Chimes for Alerts & Actions
    const [soundEnabled, setSoundEnabledState] = useState(() => {
        const val = localStorage.getItem(STORAGE_KEYS.SOUND);
        return val === null ? true : val === 'true';
    });

    // Desktop Push Notifications
    const [desktopNotifications, setDesktopNotificationsState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.NOTIFS) === 'true';
    });

    // Patient Name Privacy Masking (for shared clinical terminals)
    const [patientPrivacyMask, setPatientPrivacyMaskState] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.PRIVACY_MASK) === 'true';
    });

    // Default Prescription Validity Period (days)
    const [defaultExpiryDays, setDefaultExpiryDaysState] = useState(() => {
        const val = localStorage.getItem(STORAGE_KEYS.EXPIRY);
        return val ? parseInt(val, 10) : 30;
    });

    // Auto-Lock Inactivity Timeout (minutes)
    const [autoLockMinutes, setAutoLockMinutesState] = useState(() => {
        const val = localStorage.getItem(STORAGE_KEYS.AUTOLOCK);
        return val ? parseInt(val, 10) : 30;
    });

    // Global Settings Modal state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('appearance');

    // Determine effective theme and apply to document
    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            let resolved = theme;

            if (theme === 'system') {
                const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                resolved = systemPrefersDark ? 'dark' : 'light';
            }

            setEffectiveTheme(resolved);

            if (resolved === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }

            // Accent theme
            root.setAttribute('data-accent', accentColor);
            // Compact mode
            root.setAttribute('data-compact', compactMode ? 'true' : 'false');
            // High contrast
            root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
            // Font size
            root.setAttribute('data-font-size', fontSize);
        };

        applyTheme();

        // Listen for OS system theme changes if mode is 'system'
        if (theme === 'system' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, accentColor, compactMode, highContrast, fontSize]);

    // Setters with persistent storage
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        playChime('click');
    };

    const toggleTheme = () => {
        const next = effectiveTheme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    };

    const setAccentColor = (accent) => {
        setAccentColorState(accent);
        localStorage.setItem(STORAGE_KEYS.ACCENT, accent);
        playChime('click');
    };

    const setCompactMode = (compact) => {
        setCompactModeState(compact);
        localStorage.setItem(STORAGE_KEYS.COMPACT, String(compact));
        playChime('click');
    };

    const setHighContrast = (contrast) => {
        setHighContrastState(contrast);
        localStorage.setItem(STORAGE_KEYS.CONTRAST, String(contrast));
        playChime('click');
    };

    const setFontSize = (size) => {
        setFontSizeState(size);
        localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
        playChime('click');
    };

    const setSoundEnabled = (enabled) => {
        setSoundEnabledState(enabled);
        localStorage.setItem(STORAGE_KEYS.SOUND, String(enabled));
        if (enabled) playChime('success');
    };

    const setDesktopNotifications = async (enabled) => {
        if (enabled && 'Notification' in window) {
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error('Notification permission was denied in your browser');
                    setDesktopNotificationsState(false);
                    localStorage.setItem(STORAGE_KEYS.NOTIFS, 'false');
                    return;
                }
            }
            toast.success('Desktop notifications enabled');
        }
        setDesktopNotificationsState(enabled);
        localStorage.setItem(STORAGE_KEYS.NOTIFS, String(enabled));
        playChime('click');
    };

    const setPatientPrivacyMask = (masked) => {
        setPatientPrivacyMaskState(masked);
        localStorage.setItem(STORAGE_KEYS.PRIVACY_MASK, String(masked));
        playChime('click');
    };

    const setDefaultExpiryDays = (days) => {
        setDefaultExpiryDaysState(days);
        localStorage.setItem(STORAGE_KEYS.EXPIRY, String(days));
        playChime('click');
    };

    const setAutoLockMinutes = (minutes) => {
        setAutoLockMinutesState(minutes);
        localStorage.setItem(STORAGE_KEYS.AUTOLOCK, String(minutes));
        playChime('click');
    };

    const openSettings = (tab = 'appearance') => {
        setActiveSettingsTab(tab);
        setIsSettingsOpen(true);
        playChime('click');
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
    };

    // Clinical Audio Chime Generator using native Web Audio API
    const playChime = (type = 'click') => {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            if (type === 'success') {
                // Two pleasant ascending notes (C5 -> E5)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else if (type === 'alert') {
                // Subtle descending alert (A4 -> F4)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(349.23, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.26);
            } else {
                // Soft UI tap
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.06);
            }
        } catch {
            // Ignore audio context block if user hasn't interacted yet
        }
    };

    // Reset all settings to factory default
    const resetSettings = () => {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
        setThemeState('light');
        setAccentColorState('teal');
        setCompactModeState(false);
        setHighContrastState(false);
        setFontSizeState('normal');
        setSoundEnabledState(true);
        setDesktopNotificationsState(false);
        setPatientPrivacyMaskState(false);
        setDefaultExpiryDaysState(30);
        setAutoLockMinutesState(30);
        playChime('alert');
        toast.success('Settings reset to default configuration');
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                effectiveTheme,
                setTheme,
                toggleTheme,
                accentColor,
                setAccentColor,
                compactMode,
                setCompactMode,
                highContrast,
                setHighContrast,
                fontSize,
                setFontSize,
                soundEnabled,
                setSoundEnabled,
                desktopNotifications,
                setDesktopNotifications,
                patientPrivacyMask,
                setPatientPrivacyMask,
                defaultExpiryDays,
                setDefaultExpiryDays,
                autoLockMinutes,
                setAutoLockMinutes,
                isSettingsOpen,
                activeSettingsTab,
                setActiveSettingsTab,
                openSettings,
                closeSettings,
                resetSettings,
                playChime,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
