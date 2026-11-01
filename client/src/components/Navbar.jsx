import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { LogOut, ShieldCheck, LayoutDashboard, Menu, X, Activity, User, ChevronRight, Sun, Moon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { effectiveTheme, toggleTheme, openSettings } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Hide Navbar if we are in Dashboard (which has DashboardTopBar)
    if (location.pathname.startsWith('/dashboard')) return null;

    return (
        <nav className="sticky top-0 z-[100] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex justify-between h-20 lg:h-24 items-center">
                    {/* Branding */}
                    <div
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 dark:bg-brand flex items-center justify-center rounded-2xl shadow-mega group-hover:scale-110 group-hover:bg-brand transition-all duration-500">
                            <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-white animate-heartbeat" />
                        </div>
                        <div>
                            <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none block">
                                MEDI<span className="text-brand italic">SYNC</span>
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 block">Version 4.2</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105 shadow-sm"
                            aria-label="Toggle Theme"
                        >
                            {effectiveTheme === 'dark' ? (
                                <Sun size={17} className="text-amber-400" />
                            ) : (
                                <Moon size={17} className="text-slate-700" />
                            )}
                        </button>

                        {/* Settings Button */}
                        <button
                            type="button"
                            onClick={() => openSettings('appearance')}
                            title="Settings & Preferences"
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105 shadow-sm"
                            aria-label="Open Settings"
                        >
                            <Settings size={17} />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-6">
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-soft text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3"
                                >
                                    <LayoutDashboard size={14} className="text-brand" />
                                    Dashboard
                                </Button>

                                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{user.role}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white italic tracking-tight">{user.name}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-900 dark:bg-brand text-white rounded-xl flex items-center justify-center font-black group-hover:rotate-6 transition-all shadow-mega">
                                        {user.name.charAt(0)}
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-3 text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Login
                                </button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    className="px-10 h-12 bg-slate-900 dark:bg-brand text-white hover:bg-black dark:hover:bg-brand/90 rounded-2xl shadow-mega text-[11px] font-black uppercase tracking-widest italic flex items-center gap-3 group"
                                >
                                    Join
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            {effectiveTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                        </button>
                        <button
                            className="p-2.5 text-slate-700 dark:text-slate-200"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-100 dark:border-slate-800 px-6 py-6 bg-white dark:bg-slate-900 space-y-4"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setIsMenuOpen(false);
                                openSettings('appearance');
                            }}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                            <span className="flex items-center gap-2.5">
                                <Settings size={16} /> System Settings
                            </span>
                            <span className="text-[10px] text-brand uppercase font-mono">{effectiveTheme}</span>
                        </button>

                        {user ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate('/dashboard');
                                    }}
                                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-brand text-white font-bold text-xs uppercase tracking-wider"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate('/login');
                                    }}
                                    className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate('/register');
                                    }}
                                    className="py-3 rounded-xl bg-slate-900 dark:bg-brand text-white font-bold text-xs uppercase"
                                >
                                    Join
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
