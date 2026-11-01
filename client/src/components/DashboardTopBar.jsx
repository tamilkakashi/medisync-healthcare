import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Activity, Sun, Moon, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileNavDrawer from './MobileNavDrawer';

const roleColors = {
    admin: { badge: 'bg-rose-500', glow: 'bg-rose-500/10 dark:bg-rose-500/20', label: 'Admin Access' },
    doctor: { badge: 'bg-brand', glow: 'bg-brand/10 dark:bg-brand/20', label: 'Doctor Portal' },
    pharmacy: { badge: 'bg-emerald-600', glow: 'bg-emerald-500/10 dark:bg-emerald-500/20', label: 'Pharmacy Portal' },
    patient: { badge: 'bg-sky-500', glow: 'bg-sky-500/10 dark:bg-sky-500/20', label: 'Patient Portal' },
    hospital: { badge: 'bg-violet-600', glow: 'bg-violet-500/10 dark:bg-violet-500/20', label: 'Hospital Portal' },
};

const DashboardTopBar = () => {
    const { user, logout } = useAuth();
    const { effectiveTheme, toggleTheme, openSettings } = useTheme();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const colors = roleColors[user?.role] || roleColors.patient;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors"
            >
                {/* Left: Brand */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 dark:bg-brand rounded-xl flex items-center justify-center shadow-md">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-heartbeat" />
                    </div>
                    <div>
                        <span className="text-base sm:text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                            MEDI<span className="text-brand italic">SYNC</span>
                        </span>
                    </div>
                    <span className={`hidden sm:inline-block ml-1.5 px-2.5 py-1 ${colors.badge} text-white text-[9px] font-black uppercase tracking-widest rounded-lg`}>
                        {colors.label}
                    </span>
                </div>

                {/* Right: Controls + User + Logout */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Quick Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105 shadow-sm cursor-pointer"
                        aria-label="Toggle Theme"
                    >
                        {effectiveTheme === 'dark' ? (
                            <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
                        ) : (
                            <Moon size={16} className="text-slate-700 hover:-rotate-12 transition-transform" />
                        )}
                    </button>

                    {/* Settings Button */}
                    <button
                        type="button"
                        onClick={() => openSettings('appearance')}
                        title="Settings & Preferences"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105 shadow-sm cursor-pointer"
                        aria-label="Open Settings"
                    >
                        <Settings size={16} className="hover:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Mobile Drawer Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(true)}
                        className="md:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-700/80 cursor-pointer"
                        aria-label="Open Mobile Menu"
                    >
                        <Menu size={18} />
                    </button>

                    {/* Desktop Divider */}
                    <div className="h-7 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

                    {/* Desktop User Info */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className={`w-9 h-9 ${colors.glow} border ${colors.badge.replace('bg-', 'border-')}/30 rounded-xl flex items-center justify-center font-black text-sm ${colors.badge.replace('bg-', 'text-')}`}>
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{user?.role}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                        </div>
                    </div>

                    {/* Desktop Divider */}
                    <div className="hidden md:block h-7 w-px bg-slate-200 dark:bg-slate-800" />

                    {/* Desktop Logout Button */}
                    <button
                        onClick={logout}
                        className="hidden md:flex group items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-200 font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                    >
                        <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.div>

            {/* Mobile Navigation Drawer */}
            <MobileNavDrawer 
                isOpen={mobileDrawerOpen} 
                onClose={() => setMobileDrawerOpen(false)} 
            />
        </>
    );
};

export default DashboardTopBar;
