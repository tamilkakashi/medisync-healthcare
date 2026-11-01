import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, Moon, Laptop, Palette, Bell, Volume2, VolumeX, Shield,
    Clock, Eye, EyeOff, RotateCcw, X, Check, Sparkles, Monitor,
    Sliders, Zap, Lock, Key, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const ACCENTS = [
    { id: 'teal', name: 'Clinical Teal', primary: '#0f766e', brand: '#059669', bg: 'bg-emerald-500' },
    { id: 'blue', name: 'Trust Navy', primary: '#1e40af', brand: '#2563eb', bg: 'bg-blue-600' },
    { id: 'purple', name: 'Cyber Violet', primary: '#6d28d9', brand: '#8b5cf6', bg: 'bg-purple-600' },
    { id: 'amber', name: 'Vital Amber', primary: '#b45309', brand: '#f59e0b', bg: 'bg-amber-500' },
    { id: 'rose', name: 'Emergency Rose', primary: '#be123c', brand: '#f43f5e', bg: 'bg-rose-500' }
];

const TABS = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications & Sound', icon: Bell },
    { id: 'clinical', label: 'Clinical Workflow', icon: Sliders },
    { id: 'security', label: 'Security & Session', icon: Shield },
];

const SettingsModal = () => {
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
        isSettingsOpen,
        activeSettingsTab,
        setActiveSettingsTab,
        closeSettings,
        resetSettings,
        playChime
    } = useTheme();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSettingsOpen) {
                closeSettings();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSettingsOpen]);

    if (!isSettingsOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                >
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shadow-sm">
                                <Sliders size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">
                                        System <span className="text-brand">Settings</span>
                                    </h2>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-brand/5 text-brand border-brand/20">
                                        Preferences
                                    </Badge>
                                </div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-1">
                                    Customize your theme, workspace density, notifications, and clinical defaults.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeSettings}
                            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Modal Body: Sidebar Tabs + Content Area */}
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 shrink-0 space-y-1.5 flex md:flex-col overflow-x-auto">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeSettingsTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveSettingsTab(tab.id);
                                            playChime('click');
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'bg-slate-900 text-white dark:bg-brand dark:text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon size={16} className={isActive ? 'text-brand dark:text-white' : 'text-slate-400'} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}

                            <div className="hidden md:block pt-8 mt-auto border-t border-slate-100 dark:border-slate-800">
                                <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                    <p className="font-bold text-slate-700 dark:text-slate-300">MediSync Cloud v4.2</p>
                                    <p className="text-[10px]">Active User: <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Practitioner'}</span></p>
                                    <p className="text-[10px] uppercase font-mono tracking-wider text-brand">{user?.role || 'Clinician'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
                            {/* TAB 1: APPEARANCE & THEMES */}
                            {activeSettingsTab === 'appearance' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Color Mode Selection */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                    Color Theme
                                                </h3>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Switch between clean clinical daylight and high-comfort dark mode.
                                                </p>
                                            </div>
                                            <span className="text-[11px] font-mono font-bold text-brand uppercase">
                                                Active: {theme} ({effectiveTheme})
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                            {/* Light Mode Card */}
                                            <button
                                                type="button"
                                                onClick={() => setTheme('light')}
                                                className={`group p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                                                    theme === 'light'
                                                        ? 'border-brand ring-2 ring-brand/40 bg-teal-50/20 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                                        <Sun size={18} />
                                                    </div>
                                                    {theme === 'light' && (
                                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                                            <Check size={12} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">Light Mode</p>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Standard medical daylight palette</p>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full flex gap-1 overflow-hidden">
                                                    <div className="h-full w-1/3 bg-slate-200" />
                                                    <div className="h-full w-1/3 bg-brand" />
                                                </div>
                                            </button>

                                            {/* Dark Mode Card */}
                                            <button
                                                type="button"
                                                onClick={() => setTheme('dark')}
                                                className={`group p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                                                    theme === 'dark'
                                                        ? 'border-brand ring-2 ring-brand/40 bg-slate-900 text-white shadow-md'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-900 text-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
                                                        <Moon size={18} />
                                                    </div>
                                                    {theme === 'dark' && (
                                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                                            <Check size={12} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">Dark Mode</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Deep slate for night shifts & low-light</p>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full flex gap-1 overflow-hidden">
                                                    <div className="h-full w-1/3 bg-slate-700" />
                                                    <div className="h-full w-1/3 bg-brand" />
                                                </div>
                                            </button>

                                            {/* System Sync Card */}
                                            <button
                                                type="button"
                                                onClick={() => setTheme('system')}
                                                className={`group p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                                                    theme === 'system'
                                                        ? 'border-brand ring-2 ring-brand/40 bg-teal-50/20 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                                        <Laptop size={18} />
                                                    </div>
                                                    {theme === 'system' && (
                                                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                                                            <Check size={12} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">System Sync</p>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Automatically match OS schedule</p>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full flex gap-1 overflow-hidden">
                                                    <div className="h-full w-1/2 bg-amber-400" />
                                                    <div className="h-full w-1/2 bg-indigo-600" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Accent Color Palette */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                Accent Brand Color
                                            </h3>
                                            <p className="text-xs font-medium text-slate-400">
                                                Choose the primary highlight color for buttons, badges, and active indicators.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3 pt-1">
                                            {ACCENTS.map((item) => {
                                                const isSelected = accentColor === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setAccentColor(item.id)}
                                                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? 'border-slate-900 dark:border-white shadow-sm ring-2 ring-slate-900/10 dark:ring-white/10'
                                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <span className={`w-3.5 h-3.5 rounded-full ${item.bg} flex items-center justify-center text-white`}>
                                                            {isSelected && <Check size={10} strokeWidth={3} />}
                                                        </span>
                                                        <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Display Density & Accessibility */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Workspace Density & Scaling
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Compact Mode Toggle */}
                                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Compact Table Density</p>
                                                    <p className="text-[10px] text-slate-500">Tighter rows to see more patients per screen</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCompactMode(!compactMode)}
                                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                                        compactMode ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <motion.div
                                                        animate={{ x: compactMode ? 22 : 0 }}
                                                        className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                                                    />
                                                </button>
                                            </div>

                                            {/* High Contrast Mode */}
                                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">High Contrast Text</p>
                                                    <p className="text-[10px] text-slate-500">Enhanced visual borders for clinical clarity</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setHighContrast(!highContrast)}
                                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                                        highContrast ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <motion.div
                                                        animate={{ x: highContrast ? 22 : 0 }}
                                                        className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Font Scaling */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div>
                                                <p className="font-bold text-xs text-slate-900 dark:text-white">Typography Scaling</p>
                                                <p className="text-[10px] text-slate-500">Adjust overall interface reading size</p>
                                            </div>
                                            <div className="inline-flex items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold">
                                                {[
                                                    { id: 'normal', label: '100%' },
                                                    { id: 'medium', label: '110%' },
                                                    { id: 'large', label: '120%' }
                                                ].map((s) => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => setFontSize(s.id)}
                                                        className={`px-3 py-1 rounded-lg transition-all ${
                                                            fontSize === s.id
                                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 2: NOTIFICATIONS & SOUNDS */}
                            {activeSettingsTab === 'notifications' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Alerts & Auditory Feedback
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400">
                                            Configure how the platform notifies you of urgent clinical updates.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Audio Chimes */}
                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                                                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Clinical Sound Effects</p>
                                                    <p className="text-[10px] text-slate-500">Chimes on prescription creation, verification, and critical alerts</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => playChime('success')}
                                                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    Test Sound
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                                        soundEnabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <motion.div
                                                        animate={{ x: soundEnabled ? 22 : 0 }}
                                                        className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Desktop Push Notifications */}
                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                    <Bell size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Desktop System Notifications</p>
                                                    <p className="text-[10px] text-slate-500">Receive background OS notifications for dispensed prescriptions</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDesktopNotifications(!desktopNotifications)}
                                                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                                    desktopNotifications ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                                }`}
                                            >
                                                <motion.div
                                                    animate={{ x: desktopNotifications ? 22 : 0 }}
                                                    className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                                                />
                                            </button>
                                        </div>

                                        {/* Email Digest summary note */}
                                        <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                            <span>Real-time prescription security audits are permanently logged to the tamper-proof ledger.</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 3: CLINICAL WORKFLOW */}
                            {activeSettingsTab === 'clinical' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Clinical Workflow Defaults
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400">
                                            Standardize default parameters when drafting new electronic prescriptions.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Default Expiration Period */}
                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Default Prescription Validity</p>
                                                    <p className="text-[10px] text-slate-500">Pre-populates expiry date upon prescription creation</p>
                                                </div>
                                                <span className="text-xs font-black text-brand">{defaultExpiryDays} Days</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[7, 14, 30, 90].map((days) => (
                                                    <button
                                                        key={days}
                                                        type="button"
                                                        onClick={() => setDefaultExpiryDays(days)}
                                                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                                            defaultExpiryDays === days
                                                                ? 'bg-slate-900 text-white dark:bg-brand border-transparent shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {days} Days
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Patient Privacy Screen Mode */}
                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                                    {patientPrivacyMask ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white">Privacy Screen Protection</p>
                                                    <p className="text-[10px] text-slate-500">HIPAA compliant masking of patient details on shared wards</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPatientPrivacyMask(!patientPrivacyMask)}
                                                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                                                    patientPrivacyMask ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                                }`}
                                            >
                                                <motion.div
                                                    animate={{ x: patientPrivacyMask ? 22 : 0 }}
                                                    className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 4: SECURITY & SESSION */}
                            {activeSettingsTab === 'security' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Security & Cryptography
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400">
                                            Hospital grade PKI digital signature keys & terminal auto-lock safeguards.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Auto-Lock Inactivity */}
                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs text-slate-900 dark:text-white">Terminal Auto-Lock</p>
                                                        <p className="text-[10px] text-slate-500">Protects clinical data when practitioner steps away</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-brand">
                                                    {autoLockMinutes === 0 ? 'Disabled' : `${autoLockMinutes} mins`}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { val: 15, label: '15m' },
                                                    { val: 30, label: '30m' },
                                                    { val: 60, label: '1h' },
                                                    { val: 0, label: 'Never' }
                                                ].map((t) => (
                                                    <button
                                                        key={t.val}
                                                        type="button"
                                                        onClick={() => setAutoLockMinutes(t.val)}
                                                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                                            autoLockMinutes === t.val
                                                                ? 'bg-slate-900 text-white dark:bg-brand border-transparent shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* PKI Status Info */}
                                        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold flex items-center gap-2 text-brand">
                                                    <Lock size={14} /> PKI Digital Signature Standard
                                                </span>
                                                <Badge variant="outline" className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border-emerald-800">
                                                    RSA-2048 / SHA-256
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                All prescriptions issued under this account are cryptographically signed with the doctor's private key before being sent to pharmacies.
                                            </p>
                                        </div>

                                        {/* Reset to Default Button */}
                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={resetSettings}
                                                className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <RotateCcw size={14} /> Reset All Preferences
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                            Changes take effect immediately across all sessions.
                        </span>
                        <Button
                            type="button"
                            onClick={closeSettings}
                            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black dark:bg-brand dark:hover:bg-brand/90 text-white text-xs font-black uppercase tracking-wider"
                        >
                            Done
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SettingsModal;
