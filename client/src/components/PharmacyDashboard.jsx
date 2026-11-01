import React, { useEffect, useState } from 'react';
import { cn } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Package, Clock, Search, CheckCircle, AlertCircle, X, ShieldAlert, ArrowRight, ShieldCheck, Activity, Database, Zap, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardTopBar from './DashboardTopBar';

const PharmacyDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('idle');
    const [isVerificationValid, setIsVerificationValid] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, presRes] = await Promise.all([
                api.get('/auth/stats').catch(() => ({ data: {} })),
                api.get('/prescriptions').catch(() => ({ data: { prescriptions: [] } }))
            ]);
            setStats(statsRes.data);
            setPrescriptions(presRes.data.prescriptions || []);
        } catch (error) {
            console.error('System synchronization failure:', error);
            toast.error('Network synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (p) => {
        setVerifyingId(p._id);
        setVerificationStatus('checking_keys');

        await new Promise(r => setTimeout(r, 800));
        setVerificationStatus('validating_integrity');
        await new Promise(r => setTimeout(r, 1200));

        try {
            const res = await api.get(`/prescriptions/verify/${p._id}`);
            setIsVerificationValid(res.data.isValid);
            setVerificationStatus('complete');

            if (res.data.isValid) {
                toast.success('Prescription verified');
            } else {
                toast.error('Verification failed');
            }
        } catch (error) {
            setVerificationStatus('idle');
            setVerifyingId(null);
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    const handleDispense = async (id) => {
        try {
            await api.post(`/prescriptions/dispense/${id}`);
            toast.success('Medication dispensed successfully');
            setSelectedPrescription(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Dispensing failed');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20"
            >
                <Database size={32} />
            </motion.div>
            <span className="text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase">Loading...</span>
        </div>
    );

    const filteredPrescriptions = prescriptions.filter(p =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full relative min-h-screen dashboard-container">
            <style>{`
                .dashboard-container {
                    background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 40%, #e6f7f5 100%);
                }
                .dashboard-pattern {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(20,184,166,0.08), transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(37,99,235,0.08), transparent 40%);
                    animation: gradientMove 10s ease infinite;
                    z-index: 0;
                }
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .dashboard-card {
                    border-radius: 16px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06) !important;
                    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                }
                .dashboard-card:hover {
                    transform: translateY(-4px) !important;
                }
            `}</style>
            <div className="dashboard-pattern" />
            <div className="relative z-10 w-full">
                <DashboardTopBar />
                <div className="space-y-12 px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
                    {/* Header / Search */}
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1.5 bg-emerald-500/5 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">Pharmacy Portal</span>
                            </div>
                            <h1 className="text-slate-900 mb-2">
                                Pharmacy <span className="text-emerald-500 italic">Dashboard</span>
                            </h1>
                            <p className="max-w-xl">
                                Verify prescriptions and manage medication dispensing.
                            </p>
                        </div>

                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Search Prescriptions..."
                                className="w-full pl-14 pr-6 h-16 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stats Ecosystem */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Pending Prescriptions", value: stats?.pendingQueue || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-100", suffix: "Pending" },
                            { label: "Dispensed Prescriptions", value: stats?.dispensedByMe || 0, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-100", suffix: "Completed" },
                            { label: "System Status", value: "Online", icon: Activity, color: "text-brand", bg: "bg-brand/10", suffix: "" },
                        ].map((stat, i) => (
                            <Card key={i} className="group overflow-hidden">
                                <div className="flex items-center gap-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                                        <stat.icon className={cn("w-7 h-7", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.suffix}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Dispatch Queue */}
                    <Card className="dashboard-card !p-0 overflow-hidden" glass={false}>
                        <CardHeader className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Prescription Queue</CardTitle>
                                <CardDescription>Prescriptions waiting to be dispensed</CardDescription>
                            </div>
                            <Button variant="secondary" onClick={fetchData} className="rounded-xl h-12 px-6 text-xs transform hover:rotate-180 transition-transform duration-500">
                                <Zap size={14} className="mr-2 text-emerald-500" />
                                Refresh Data
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <AnimatePresence mode="popLayout text-slate-800">
                                {filteredPrescriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y divide-slate-100">
                                        {filteredPrescriptions.map((p, idx) => (
                                            <motion.div
                                                key={p._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-8 hover:bg-slate-50/50 transition-all group relative border-inline"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                                                        {p.patientName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge status={p.status === 'dispensed' ? 'verified' : 'pending'}>
                                                            {p.status}
                                                        </Badge>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Clock size={10} className="text-emerald-500" />
                                                            {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    <h3 className="text-2xl font-black tracking-tight group-hover:text-emerald-600 transition-colors uppercase italic">{p.patientName}</h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-500 uppercase">Age: {p.patientAge}</span>
                                                        <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 rounded-lg text-emerald-600 uppercase italic">{p.medicines.length} Medicines</span>
                                                    </div>
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribed By</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs font-bold text-slate-700">{p.doctorId?.name || 'Unknown Doctor'}</p>
                                                            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{p.doctorId?.licenseNumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] font-mono text-slate-300 truncate opacity-60">ID: {p._id}</p>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button
                                                        variant="secondary"
                                                        className="flex-1 text-[10px] uppercase font-black"
                                                        onClick={() => setSelectedPrescription(p)}
                                                    >
                                                        View
                                                    </Button>
                                                    {p.status !== 'dispensed' && (
                                                        <Button
                                                            className="flex-[2] text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                                                            onClick={() => handleVerify(p)}
                                                        >
                                                            {verifyingId === p._id ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                            <span className="ml-2">{verifyingId === p._id ? 'Verifying...' : 'Verify'}</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-32 text-center">
                                        <Package className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Prescriptions Found</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Audit Modal (Condensed) */}
                    <AnimatePresence>
                        {selectedPrescription && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-slate-800">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setSelectedPrescription(null)} />
                                <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/50">
                                    <div className="p-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <Database size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Prescription <span className="text-emerald-600">Details</span></h2>
                                                    <div className="flex gap-4 mt-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Patient: <span className="text-slate-900 font-black">{selectedPrescription.patientName}</span></p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-l border-slate-200 pl-4">Doctor: <span className="text-slate-900 font-black">{selectedPrescription.doctorId?.name || 'Unknown'}</span></p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-l border-slate-200 pl-4">Assigned: <span className="text-slate-900 font-black">{new Date(selectedPrescription.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedPrescription(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar my-8">
                                            {selectedPrescription.medicines.map((m, i) => (
                                                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                                    <div>
                                                        <p className="text-lg font-black text-slate-900 uppercase italic leading-none mb-2">{m.name}</p>
                                                        <div className="flex gap-4">
                                                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Clock size={16} className="text-emerald-500" /> {m.frequency}</span>
                                                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar size={16} className="text-emerald-500" /> {m.duration} Days</span>
                                                        </div>
                                                    </div>
                                                    <Badge status="neutral" className="bg-emerald-50 text-emerald-600 px-6 py-3 text-lg font-black border-emerald-100 shadow-sm">
                                                        {m.dosage}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-8 flex gap-4">
                                            <Button variant="secondary" className="flex-1 h-16 uppercase font-black tracking-widest text-xs" onClick={() => setSelectedPrescription(null)}>Cancel</Button>
                                            {selectedPrescription.status !== 'dispensed' && (
                                                <Button className="flex-[2] h-16 bg-emerald-600 uppercase font-black tracking-widest text-xs shadow-glow" onClick={() => handleDispense(selectedPrescription._id)}>
                                                    Confirm Dispensing
                                                    <ArrowRight size={18} className="ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Verification Animation Modal */}
                    <AnimatePresence>
                        {verifyingId && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-slate-800">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" />
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl text-center relative z-10">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-glow shadow-emerald-500/50">
                                        <ShieldAlert size={48} />
                                    </motion.div>
                                    <h3 className="text-3xl font-black uppercase italic mb-8">Verifying <span className="text-emerald-500">Prescription...</span></h3>

                                    <div className="space-y-6 text-left max-w-[280px] mx-auto mb-16">
                                        {[
                                            { step: 'checking_keys', label: 'CHECKING DETAILS' },
                                            { step: 'validating_integrity', label: 'VALIDATING PRESCRIPTION' },
                                            { step: 'complete', label: 'VERIFICATION COMPLETE' },
                                        ].map((s, i) => {
                                            const isActive = verificationStatus === s.step;
                                            const isDone = (i === 0 && (verificationStatus === 'validating_integrity' || verificationStatus === 'complete')) ||
                                                (i === 1 && verificationStatus === 'complete') ||
                                                (i === 2 && verificationStatus === 'complete');

                                            return (
                                                <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${isDone ? 'opacity-100' : isActive ? 'opacity-100 scale-105' : 'opacity-20 translate-x-4'}`}>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-100'}`}>
                                                        {isDone ? <CheckCircle size={18} /> : <span>{i + 1}</span>}
                                                    </div>
                                                    <span className={`text-[10px] font-black tracking-[0.2em] ${isActive ? 'text-slate-900 underline underline-offset-4 decoration-emerald-500 decoration-2' : 'text-slate-400'}`}>{s.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {verificationStatus === 'complete' && (
                                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                            <div className={cn("text-lg font-black uppercase italic mb-8 flex items-center justify-center gap-2", isVerificationValid ? "text-emerald-500" : "text-rose-500")}>
                                                {isVerificationValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                                {isVerificationValid ? "Verified" : "Verification Failed"}
                                            </div>
                                            <Button className="w-full h-16 rounded-2xl font-black text-xs uppercase bg-slate-900 hover:bg-black text-white" onClick={() => setVerifyingId(null)}>Continue</Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
