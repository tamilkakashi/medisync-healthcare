import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, Pill, Building2, BadgeCheck, Mail, Lock, ShieldCheck, FileText, ChevronRight, Activity, ArrowRight, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from "../utils/helpers";

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'patient',
        licenseNumber: '', address: '', experience: '', specialization: '',
        hospitalName: '', registrationNumber: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoaded(true);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (error) {
            // Error managed by AuthContext
        } finally {
            setIsSubmitting(false);
        }
    };

    const roles = [
        { id: 'patient', label: 'Patient', icon: User, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-accent-light', bg: 'bg-accent-light/10', border: 'border-accent-light/20' },
        { id: 'hospital', label: 'Hospital', icon: Building2, color: 'text-primary-dark', bg: 'bg-primary-dark/5', border: 'border-primary-dark/10' }
    ];

    return (
        <div className="min-h-screen w-full bg-secondary relative overflow-x-hidden flex flex-col items-center justify-center py-10 sm:py-20 px-4 sm:px-6 font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-medical-pattern pointer-events-none" />
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-accent/5 rounded-full blur-[160px]" />
            </div>

            <AnimatePresence mode="wait">
                {!pageLoaded ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-12"
                    >
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border-8 border-primary/10 border-t-primary rounded-[2.5rem] mb-12 shadow-soft"
                        />
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Loading <span className="text-primary">Registration</span></h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Please wait...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-5xl"
                    >
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-16 shadow-mega border border-white/80 dark:border-slate-800 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />

                            <header className="mb-16 flex flex-col items-center text-center">
                                <Badge variant="outline" className="mb-8 px-6 py-2 bg-primary/5 text-primary border-primary/10 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl italic">
                                    Create an Account
                                </Badge>
                                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
                                    Join <span className="text-primary">MediSync</span>
                                </h1>
                                <p className="text-slate-500 font-bold text-lg max-w-xl italic">Create an account to join the MediSync platform.</p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-16" autoComplete="off">
                                {/* Role Selection */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Cpu size={14} className="text-primary" />
                                            Choose your Role
                                        </h3>
                                        <span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-lg">Required</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {roles.map((role) => (
                                            <motion.button
                                                key={role.id}
                                                type="button"
                                                whileHover={{ y: -4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={cn(
                                                    "p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-6 relative overflow-hidden group",
                                                    formData.role === role.id
                                                        ? `${role.border} bg-white shadow-soft ring-4 ring-primary/5`
                                                        : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-100"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500",
                                                    formData.role === role.id ? `${role.bg} ${role.color} scale-110 shadow-inner` : "bg-white text-slate-300 group-hover:text-slate-600"
                                                )}>
                                                    <role.icon size={32} />
                                                </div>
                                                <span className={cn(
                                                    "font-black uppercase tracking-widest text-[11px]",
                                                    formData.role === role.id ? "text-slate-900" : "text-slate-400"
                                                )}>
                                                    {role.label}
                                                </span>
                                                {formData.role === role.id && (
                                                    <motion.div layoutId="active-role" className="absolute top-4 right-4">
                                                        <BadgeCheck className={role.color} size={24} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                    {/* Primary Credentials */}
                                    <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-10">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-4">
                                            <ShieldCheck size={14} className="text-primary" />
                                            Basic Details
                                        </h3>

                                        <Input
                                            label="Full Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Dr. Jordan Vance"
                                            required
                                            className="bg-white border-slate-50 h-16 text-base font-bold shadow-sm"
                                        />

                                        <Input
                                            label="Email Address"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="vance@medisync.health"
                                            required
                                            autoComplete="off"
                                            className="bg-white border-slate-50 h-16 text-base font-bold shadow-sm"
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
                                            className="bg-white border-slate-50 h-16 tracking-widest text-base font-bold shadow-sm"
                                        />
                                    </div>

                                    {/* Role Specific Verification */}
                                    <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-10">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-4">
                                            <Zap size={14} className="text-primary" />
                                            Additional Details
                                        </h3>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={formData.role}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-10"
                                            >
                                                {formData.role === 'doctor' && (
                                                    <div className="space-y-10">
                                                        <Input label="Medical License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="MD-2026-X9" required className="bg-white border-slate-50 shadow-sm" />
                                                        <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Neurological Oncology" required className="bg-white border-slate-50 shadow-sm" />
                                                    </div>
                                                )}

                                                {(formData.role === 'pharmacy' || formData.role === 'hospital') && (
                                                    <div className="space-y-10">
                                                        <Input label="Institution Name" name={formData.role === 'pharmacy' ? 'name' : 'hospitalName'} value={formData.role === 'pharmacy' ? formData.name : formData.hospitalName} onChange={handleChange} placeholder="Institution Name" required className="bg-white border-slate-50 shadow-sm" />
                                                        <Input label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="REG-NODE-124" required className="bg-white border-slate-50 shadow-sm" />
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Address</label>
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="Your complete address"
                                                        required
                                                        rows={3}
                                                        className="w-full bg-white border border-slate-50 rounded-2xl p-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 ring-primary/5 shadow-sm resize-none"
                                                    />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-12 pt-8">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full max-w-md h-24 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] shadow-mega flex items-center justify-center gap-8 transition-all group"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-6">
                                                <Activity className="animate-spin text-primary-light" size={24} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Registering...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-6">
                                                <span className="text-lg font-black uppercase italic tracking-[0.1em]">Complete Registration</span>
                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </span>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-400">
                                            Already have an account?{' '}
                                            <Link to="/login" className="text-primary hover:text-accent font-black uppercase text-[11px] tracking-widest ml-3 transition-colors">
                                                Login
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
