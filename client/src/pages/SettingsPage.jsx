import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Sun, Moon, Laptop, Palette, Bell, Volume2, VolumeX, Shield,
    Clock, Eye, EyeOff, RotateCcw, Check, Sliders, Lock, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import DashboardTopBar from '../components/DashboardTopBar';

const ACCENTS = [
    { id: 'teal', name: 'Clinical Teal', primary: '#0f766e', brand: '#059669', bg: 'bg-emerald-500' },
    { id: 'blue', name: 'Trust Navy', primary: '#1e40af', brand: '#2563eb', bg: 'bg-blue-600' },
    { id: 'purple', name: 'Cyber Violet', primary: '#6d28d9', brand: '#8b5cf6', bg: 'bg-purple-600' },
    { id: 'amber', name: 'Vital Amber', primary: '#b45309', brand: '#f59e0b', bg: 'bg-amber-500' },
    { id: 'rose', name: 'Emergency Rose', primary: '#be123c', brand: '#f43f5e', bg: 'bg-rose-500' }
];

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        theme,
        effectiveTheme,
        setTheme,
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
        resetSettings,
        playChime
    } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {user && <DashboardTopBar />}
            
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* Back button and page title */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Workspace
                    </button>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-brand/10 text-brand border-brand/20">
                        Preferences
                    </Badge>
                </div>

                <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic text-slate-900 dark:text-white">
                        Settings & <span className="text-brand">Preferences</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Configure clinical appearance, theme mode, audio chimes, notifications, and security defaults.
                    </p>
                </header>

                <div className="space-y-8">
                    {/* 1. THEME MODE */}
                    <Card className="p-6 sm:p-8 !rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <Palette size={18} className="text-brand" />
                                    Color Theme Mode
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Choose your preferred lighting condition.</p>
                            </div>
                            <span className="text-xs font-bold text-brand uppercase font-mono">
                                Active: {theme}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Light Mode */}
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-36 ${
                                    theme === 'light'
                                        ? 'border-brand ring-2 ring-brand/40 bg-teal-50/30 dark:bg-teal-950/20 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <Sun size={20} />
                                    </div>
                                    {theme === 'light' && (
                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                            <Check size={12} />
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">Light Mode</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">High-clarity daylight palette</p>
                                </div>
                            </button>

                            {/* Dark Mode */}
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-36 ${
                                    theme === 'dark'
                                        ? 'border-brand ring-2 ring-brand/40 bg-slate-900 text-white shadow-sm'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-900 text-white'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
                                        <Moon size={20} />
                                    </div>
                                    {theme === 'dark' && (
                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                            <Check size={12} />
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm">Dark Mode</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Deep slate for night shifts</p>
                                </div>
                            </button>

                            {/* System Mode */}
                            <button
                                type="button"
                                onClick={() => setTheme('system')}
                                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-36 ${
                                    theme === 'system'
                                        ? 'border-brand ring-2 ring-brand/40 bg-teal-50/30 dark:bg-teal-950/20 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                        <Laptop size={20} />
                                    </div>
                                    {theme === 'system' && (
                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                            <Check size={12} />
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">System Sync</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Follow device OS schedule</p>
                                </div>
                            </button>
                        </div>

                        {/* Accent Colors */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Accent Brand Highlight
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {ACCENTS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setAccentColor(item.id)}
                                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                                            accentColor === item.id
                                                ? 'border-slate-900 dark:border-white shadow-sm ring-2 ring-slate-900/10 dark:ring-white/10'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className={`w-3.5 h-3.5 rounded-full ${item.bg}`} />
                                        <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* 2. DENSITY & ACCESSIBILITY */}
                    <Card className="p-6 sm:p-8 !rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
                            <Sliders size={18} className="text-brand" />
                            Layout Density & Accessibility
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Compact Table Density</p>
                                    <p className="text-[10px] text-slate-400">Fits more prescription rows per screen</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCompactMode(!compactMode)}
                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                        compactMode ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                    <span className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${compactMode ? 'translate-x-5.5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-white">High Contrast Text</p>
                                    <p className="text-[10px] text-slate-400">Boosts element edges & typography</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHighContrast(!highContrast)}
                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                        highContrast ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                    <span className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${highContrast ? 'translate-x-5.5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* 3. NOTIFICATIONS & AUDIO */}
                    <Card className="p-6 sm:p-8 !rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
                            <Bell size={18} className="text-brand" />
                            Notifications & Auditory Alerts
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Clinical Audio Chimes</p>
                                    <p className="text-[10px] text-slate-400">Auditory feedback on actions</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => playChime('success')}
                                        className="text-[10px] font-bold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300"
                                    >
                                        Test
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                            soundEnabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${soundEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Desktop Notifications</p>
                                    <p className="text-[10px] text-slate-400">System alerts for prescription status</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDesktopNotifications(!desktopNotifications)}
                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                        desktopNotifications ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                    <span className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${desktopNotifications ? 'translate-x-5.5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Reset Button */}
                    <div className="pt-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                            Saved locally in your browser storage.
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetSettings}
                            className="text-xs font-bold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            <RotateCcw size={14} className="mr-1.5" />
                            Reset All Preferences
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
