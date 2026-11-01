import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Trash2, Stethoscope, Pill, ChevronRight, Search, User, Calendar, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePrescription = ({ onComplete, onCancel }) => {
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        patientAge: '',
        diagnosis: '',
        expiryDate: '',
        medicines: [{ name: '', dosage: '', frequency: 'AM', duration: '' }]
    });
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/auth/patients');
                setPatients(res.data.patients || []);
            } catch (error) {
                console.error('Failed to load patients:', error);
            }
        };
        fetchPatients();
    }, []);

    const selectedPatient = (p) => {
        setFormData({
            ...formData,
            patientId: p.email,
            patientName: p.name
        });
        setSearchTerm(p.name);
        setIsSearching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/prescriptions/create', formData);
            toast.success('Prescription created successfully');
            if (onComplete) onComplete();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[1200px] mx-auto pb-20"
        >
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onCancel}
                        className="p-3 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <div className="uppercase tracking-[0.3em] text-[10px] font-black text-primary mb-1">New Prescription</div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create <span className="text-primary italic">Prescription</span></h2>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-600">System Status: <span className="text-slate-900">SECURE</span></span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Patient & Context */}
                <div className="xl:col-span-4 space-y-8">
                    <Card className="glass-card !rounded-[2.5rem] border-none shadow-soft p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <User className="w-5 h-5 text-primary" />
                                Patient Details
                            </h3>
                            <div className="space-y-6">
                                <div className="relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Search Patient</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            placeholder="Name or Email..."
                                            value={searchTerm}
                                            onFocus={() => setIsSearching(true)}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setFormData({ ...formData, patientName: e.target.value });
                                            }}
                                            required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/40 transition-all"
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {isSearching && searchTerm && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-hover border border-slate-100 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                                            >
                                                {patients.filter(p =>
                                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    p.email.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map(p => (
                                                    <button
                                                        key={p.email}
                                                        type="button"
                                                        onClick={() => selectedPatient(p)}
                                                        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.email}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                ))}
                                                {patients.filter(p =>
                                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    p.email.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No patients found</div>
                                                    )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="Patient Email"
                                        placeholder="email@example.com"
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        required
                                        className="bg-slate-50/50 border-slate-100"
                                    />
                                    <Input
                                        label="Patient Age"
                                        type="number"
                                        placeholder="Age in years"
                                        value={formData.patientAge}
                                        onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                                        required
                                        className="bg-slate-50/50 border-slate-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                Prescription Timeline
                            </h3>
                            <Input
                                label="Valid Until (Expiry Date)"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                required
                                className="bg-slate-50/50 border-slate-100"
                            />
                        </div>
                    </Card>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-5 px-8 rounded-2xl border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-600 transition-all hover:shadow-soft"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] btn-medical-primary h-[68px] rounded-2xl shadow-medical shadow-primary/20 flex items-center justify-center gap-4 text-sm font-black italic tracking-tighter disabled:opacity-50"
                        >
                            {loading ? "SAVING..." : (
                                <>
                                    CREATE PRESCRIPTION
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: Protocols & Diagnosis */}
                <div className="xl:col-span-8 space-y-8">
                    <Card className="glass-card !rounded-[2.5rem] border-none shadow-soft p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                                <Stethoscope className="w-7 h-7 text-primary" />
                                Medical Details
                            </h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnosis</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Enter diagnosis details..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all placeholder:text-slate-300 resize-none italic"
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Pill className="w-5 h-5 text-primary" />
                                        Medicines
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, medicines: [...formData.medicines, { name: '', dosage: '', frequency: 'AM', duration: '' }] })}
                                        className="group p-3 px-6 bg-primary/5 hover:bg-primary rounded-xl border border-primary/10 text-primary hover:text-white transition-all duration-300 flex items-center gap-3 font-black text-[10px] tracking-widest shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                        ADD ITEM
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <AnimatePresence initial={false}>
                                        {formData.medicines.map((med, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-soft hover:border-primary/20 transition-all group"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                                    <div className="md:col-span-4">
                                                        <Input
                                                            label="Medicine Name"
                                                            placeholder="e.g. Lisinopril"
                                                            value={med.name}
                                                            onChange={(e) => {
                                                                const newMeds = [...formData.medicines];
                                                                newMeds[idx].name = e.target.value;
                                                                setFormData({ ...formData, medicines: newMeds });
                                                            }}
                                                            required
                                                            className="bg-slate-50/50 border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Input
                                                            label="Dosage"
                                                            placeholder="500mg"
                                                            value={med.dosage}
                                                            onChange={(e) => {
                                                                const newMeds = [...formData.medicines];
                                                                newMeds[idx].dosage = e.target.value;
                                                                setFormData({ ...formData, medicines: newMeds });
                                                            }}
                                                            required
                                                            className="bg-slate-50/50 border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Frequency</label>
                                                        <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                                            {['AM', 'PM', 'BOTH'].map((time) => (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newMeds = [...formData.medicines];
                                                                        newMeds[idx].frequency = time;
                                                                        setFormData({ ...formData, medicines: newMeds });
                                                                    }}
                                                                    className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all ${med.frequency === time
                                                                        ? 'bg-white text-primary shadow-sm border border-slate-100'
                                                                        : 'text-slate-400 hover:text-slate-600'
                                                                        }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Input
                                                            label="Duration (Days)"
                                                            placeholder="7"
                                                            value={med.duration}
                                                            onChange={(e) => {
                                                                const newMeds = [...formData.medicines];
                                                                newMeds[idx].duration = e.target.value;
                                                                setFormData({ ...formData, medicines: newMeds });
                                                            }}
                                                            required
                                                            className="bg-slate-50/50 border-slate-100"
                                                        />
                                                    </div>
                                                </div>

                                                {formData.medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newMeds = formData.medicines.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, medicines: newMeds });
                                                        }}
                                                        className="absolute -right-3 -top-3 p-2.5 bg-white rounded-full shadow-hover border border-slate-100 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </motion.div>
    );
};

export default CreatePrescription;

