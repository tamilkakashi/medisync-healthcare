import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, Activity, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            // Error managed by AuthContext
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center py-24 px-6">
            {/* Enterprise Geometric Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-hospital-cross pointer-events-none" />
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-brand/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/5 rounded-full blur-[160px]" />
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[540px]"
            >
                {/* Visual Continuity Shield */}
                <div className="flex justify-center mb-12">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-mega border border-white/10 relative group"
                    >
                        <ShieldCheck className="w-12 h-12 text-brand group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand rounded-2xl flex items-center justify-center text-white shadow-glow">
                            <Activity size={18} className="animate-heartbeat" />
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-12 md:p-16 shadow-soft border border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand via-emerald-400 to-brand" />

                    <header className="mb-12 text-center">
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-brand/5 text-brand border-brand/10 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl italic">
                            Login to your account
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
                            Welcome <span className="text-brand">Back</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-base tracking-tight italic">Enter your details to access your account</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                            autoComplete="off"
                            className="bg-slate-50 border-slate-100 h-16 text-base font-bold"
                            icon={<Mail size={18} className="text-slate-300" />}
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
                            className="bg-slate-50 border-slate-100 h-16 tracking-widest text-base font-bold"
                            icon={<Lock size={18} className="text-slate-300" />}
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-24 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] shadow-mega flex items-center justify-center gap-8 transition-all group"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-6">
                                        <Activity className="animate-spin text-brand" size={24} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Logging in...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-6">
                                        <span className="text-lg font-black uppercase italic tracking-[0.1em]">Login</span>
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-brand group-hover:translate-x-2 transition-all duration-300">
                                            <ArrowRight size={20} />
                                        </div>
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <footer className="mt-12 pt-10 border-t border-slate-100 text-center">
                        <p className="text-sm font-bold text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand hover:text-emerald-600 font-black uppercase text-[11px] tracking-widest ml-3 transition-colors">
                                Register
                            </Link>
                        </p>
                    </footer>
                </div>

                {/* Footer Badges */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                    {[
                        { icon: Cpu, label: 'Secure' },
                        { icon: ShieldAlert, label: 'Verified' },
                        { icon: Activity, label: 'Synced' }
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <badge.icon size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
