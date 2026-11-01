import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    X, 
    LogOut, 
    Sun, 
    Moon, 
    Monitor, 
    Settings, 
    ShieldCheck, 
    Activity, 
    User, 
    ChevronRight, 
    Stethoscope, 
    Pill, 
    Building2, 
    Users, 
    FileText, 
    Lock,
    ExternalLink
} from 'lucide-react';
import { Badge } from './ui/Badge';

const roleMeta = {
    doctor: { label: 'Doctor Portal', badge: 'bg-brand text-white', icon: Stethoscope },
    pharmacy: { label: 'Pharmacy Portal', badge: 'bg-emerald-600 text-white', icon: Pill },
    hospital: { label: 'Hospital Portal', badge: 'bg-violet-600 text-white', icon: Building2 },
    patient: { label: 'Patient Portal', badge: 'bg-sky-500 text-white', icon: User },
    admin: { label: 'Admin Access', badge: 'bg-rose-500 text-white', icon: ShieldCheck },
};

export default function MobileNavDrawer({ isOpen, onClose, onSelectAction }) {
    const { user, logout } = useAuth();
    const { theme, effectiveTheme, setTheme, openSettings } = useTheme();

    if (!isOpen) return null;

    const currentRole = roleMeta[user?.role] || roleMeta.patient;
    const RoleIcon = currentRole.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] md:hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                />

                {/* Bottom Sheet Drawer */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                >
                    {/* Pull Bar */}
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3.5 mb-2" />

                    {/* Drawer Header */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-900 dark:bg-brand text-white rounded-2xl flex items-center justify-center font-black shadow-md">
                                {user ? user.name?.charAt(0) : <Activity size={20} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                                        {user?.name || 'Guest User'}
                                    </h3>
                                    {user && (
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${currentRole.badge}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                                    {user?.email || 'Medical Cryptographic System'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                        {/* Theme Mode Quick Selector */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-1">
                                Interface Theme
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'light', label: 'Light', icon: Sun },
                                    { id: 'dark', label: 'Dark', icon: Moon },
                                    { id: 'system', label: 'Auto', icon: Monitor },
                                ].map((t) => {
                                    const Icon = t.icon;
                                    const isSelected = theme === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTheme(t.id)}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                isSelected
                                                    ? 'bg-brand text-white border-brand shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <Icon size={14} />
                                            <span>{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions List */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-1">
                                Quick Navigation
                            </p>
                            <div className="space-y-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        openSettings('appearance');
                                    }}
                                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings size={16} className="text-brand" />
                                        <span className="text-xs font-bold">Preferences & Theme</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-400" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        openSettings('clinical');
                                    }}
                                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity size={16} className="text-brand" />
                                        <span className="text-xs font-bold">Clinical Safeguards</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* System Status Banner */}
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 leading-tight">
                                        Client Engine Active
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                        Offline & Live Synced
                                    </p>
                                </div>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                RSA-2048
                            </span>
                        </div>
                    </div>

                    {/* Drawer Footer with Logout */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        {user ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    logout();
                                }}
                                className="w-full py-3.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <LogOut size={16} />
                                <span>Sign Out ({user.name?.split(' ')[0]})</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="#/login"
                                    onClick={onClose}
                                    className="py-3 text-center rounded-xl bg-slate-900 dark:bg-brand text-white font-bold text-xs uppercase"
                                >
                                    Login
                                </a>
                                <a
                                    href="#/register"
                                    onClick={onClose}
                                    className="py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase"
                                >
                                    Register
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
