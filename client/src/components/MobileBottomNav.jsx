import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    LayoutDashboard, 
    Sun, 
    Moon, 
    Settings, 
    Menu, 
    User,
    LogIn,
    Shield
} from 'lucide-react';
import MobileNavDrawer from './MobileNavDrawer';

export default function MobileBottomNav() {
    const { user } = useAuth();
    const { effectiveTheme, toggleTheme, openSettings } = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname.startsWith('/dashboard');

    return (
        <>
            {/* Slide-out Drawer */}
            <MobileNavDrawer 
                isOpen={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
            />

            {/* Fixed Mobile Navigation Bar */}
            <nav 
                aria-label="Mobile Navigation"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-colors safe-bottom"
            >
                <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
                    {/* 1. Dashboard / Home */}
                    <button
                        type="button"
                        onClick={() => {
                            if (user) {
                                navigate('/dashboard');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                navigate('/login');
                            }
                        }}
                        className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                            isDashboard 
                                ? 'text-brand font-black' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <div className={`p-1 rounded-lg ${isDashboard ? 'bg-brand/10 dark:bg-brand/20' : ''}`}>
                            <LayoutDashboard size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
                            {user ? 'Portal' : 'Home'}
                        </span>
                    </button>

                    {/* 2. Theme Toggle (Instant 1-Click) */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                        className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                        <div className="p-1 rounded-lg">
                            {effectiveTheme === 'dark' ? (
                                <Sun size={20} className="text-amber-400" />
                            ) : (
                                <Moon size={20} className="text-slate-700" />
                            )}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
                            {effectiveTheme === 'dark' ? 'Light' : 'Dark'}
                        </span>
                    </button>

                    {/* 3. Settings Modal */}
                    <button
                        type="button"
                        onClick={() => openSettings('appearance')}
                        title="Settings"
                        className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                        <div className="p-1 rounded-lg">
                            <Settings size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
                            Settings
                        </span>
                    </button>

                    {/* 4. Menu / Profile Drawer */}
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        title="Account & Menu"
                        className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                        <div className="p-1 rounded-lg relative">
                            {user ? (
                                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black">
                                    {user.name?.charAt(0)}
                                </div>
                            ) : (
                                <Menu size={20} />
                            )}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
                            {user ? 'Account' : 'Menu'}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
}
