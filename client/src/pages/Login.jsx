import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    ShieldCheck, 
    Activity, 
    ArrowRight, 
    ShieldAlert, 
    Cpu, 
    Stethoscope, 
    Pill, 
    Building2, 
    UserCheck, 
    Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const DEMO_ACCOUNTS = [
    {
        role: 'Doctor',
        email: 'testsurgeon@lumina.sys',
        name: 'Dr. Marcus Vance',
        desc: 'Cardiology Specialist',
        icon: Stethoscope,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    },
    {
        role: 'Pharmacy',
        email: 'testpharmacy@lumina.sys',
        name: 'Apex Pharmaceuticals',
        desc: 'Verify & Dispense Rx',
        icon: Pill,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
    },
    {
        role: 'Hospital',
        email: 'testhospital@lumina.sys',
        name: 'Metro Health Central',
        desc: 'Clinical Operations',
        icon: Building2,
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
    },
    {
        role: 'Patient',
        email: 'testpatient@lumina.sys',
        name: 'Eleanor Rigby',
        desc: 'Prescriptions & Care',
        icon: UserCheck,
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    },
    {
        role: 'Admin',
        email: 'admin@medisync.com',
        name: 'System Admin',
        desc: 'Full Audit & Governance',
        icon: ShieldCheck,
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
    }
];

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            // Handled by AuthContext toast
        } finally {
            setIsSubmitting(false);
            setActiveRoleLoggingIn(null);
        }
    };

    const handleQuickLogin = async (account) => {
        setFormData({ email: account.email, password: '123456' });
        setActiveRoleLoggingIn(account.role);
        setIsSubmitting(true);
        try {
            await login(account.email, '123456');
            navigate('/dashboard');
        } catch (error) {
            // Handled by AuthContext toast
        } finally {
            setIsSubmitting(false);
            setActiveRoleLoggingIn(null);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center py-16 px-4 md:px-6 transition-colors">
            {/* Enterprise Geometric Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-hospital-cross pointer-events-none opacity-40 dark:opacity-10" />
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-brand/5 dark:bg-brand/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[160px]" />
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[620px]"
            >
                {/* Visual Continuity Shield */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-mega border border-white/10 relative group"
                    >
                        <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-brand group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 md:w-10 md:h-10 bg-brand rounded-2xl flex items-center justify-center text-white shadow-glow">
                            <Activity size={18} className="animate-heartbeat" />
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-soft border border-white/80 dark:border-slate-800 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand via-emerald-400 to-brand" />

                    <header className="mb-8 text-center">
                        <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-brand/5 dark:bg-brand/10 text-brand border-brand/20 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl italic">
                            Medical Cryptographic Gateway
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-3">
                            Welcome <span className="text-brand">Back</span>
                        </h1>
                        <p className="text-slate-400 dark:text-slate-400 font-bold text-sm md:text-base tracking-tight italic">
                            Enter credentials or choose 1-click Demo Quick Access
                        </p>
                    </header>

                    {/* Quick Demo Login Grid */}
                    <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-brand" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    1-Click Demo Profiles
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                Password: 123456
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {DEMO_ACCOUNTS.map((acc) => {
                                const IconComponent = acc.icon;
                                const isLoggingInThis = isSubmitting && activeRoleLoggingIn === acc.role;
                                return (
                                    <button
                                        key={acc.role}
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => handleQuickLogin(acc)}
                                        className={`group text-left p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                                            acc.badgeBg
                                        } hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-md ${
                                            acc.role === 'Admin' ? 'col-span-2 sm:col-span-1' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-900/70 flex items-center justify-center shadow-xs">
                                                {isLoggingInThis ? (
                                                    <Activity size={14} className="animate-spin text-brand" />
                                                ) : (
                                                    <IconComponent size={14} />
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                                                {acc.role}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 dark:text-white truncate text-[11px]">
                                                {acc.name}
                                            </div>
                                            <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                                                {acc.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Or Manual Login
                        </span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                            autoComplete="off"
                            className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-14 md:h-16 text-base font-bold text-slate-900 dark:text-white"
                            icon={<Mail size={18} className="text-slate-400" />}
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                            required
                            autoComplete="new-password"
                            className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-14 md:h-16 tracking-widest text-base font-bold text-slate-900 dark:text-white"
                            icon={<Lock size={18} className="text-slate-400" />}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 md:h-20 bg-slate-900 hover:bg-black dark:bg-brand dark:hover:bg-emerald-600 text-white rounded-[2rem] shadow-mega flex items-center justify-center gap-6 transition-all group"
                            >
                                {isSubmitting && !activeRoleLoggingIn ? (
                                    <div className="flex items-center gap-4">
                                        <Activity className="animate-spin text-brand dark:text-white" size={22} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Authenticating...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-4">
                                        <span className="text-base md:text-lg font-black uppercase italic tracking-[0.1em]">Sign In</span>
                                        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-brand group-hover:translate-x-1.5 transition-all duration-300">
                                            <ArrowRight size={18} />
                                        </div>
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand hover:text-emerald-600 font-black uppercase text-[11px] tracking-widest ml-3 transition-colors">
                                Register
                            </Link>
                        </p>
                    </footer>
                </div>

                {/* Footer Badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                    {[
                        { icon: Cpu, label: 'Client Mock Engine' },
                        { icon: ShieldAlert, label: 'RSA-2048 Cryptography' },
                        { icon: Activity, label: 'Real-time Sync' }
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <badge.icon size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
