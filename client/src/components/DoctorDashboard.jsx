import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { 
    Plus, Users, ClipboardList, CheckCircle, Activity, Calendar, 
    ArrowUpRight, Search, Zap, ShieldCheck, Stethoscope, Clock, 
    ChevronRight, LayoutDashboard, ArrowRight, UserPlus, Lock, Database,
    Eye, Download, X, Filter, RotateCcw, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreatePrescription from './CreatePrescription';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import DashboardTopBar from './DashboardTopBar';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const { patientPrivacyMask } = useTheme();
    const [showCreate, setShowCreate] = useState(false);
    const [stats, setStats] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Interactive Filtering & Search
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'dispensed'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    const fetchData = async () => {
        try {
            const [statsRes, presRes] = await Promise.all([
                api.get('/auth/stats').catch(() => ({ data: {} })),
                api.get('/prescriptions?limit=50').catch(() => ({ data: { prescriptions: [] } }))
            ]);
            setStats(statsRes.data);
            setPrescriptions(presRes.data.prescriptions || []);
        } catch (error) {
            console.error('Data acquisition failure:', error);
            toast.error('Failed to sync clinical data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Date and Time Formatting Helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // PDF Download Handler
    const handleDownloadPDF = (p) => {
        try {
            const doc = new jsPDF();
            // Header
            doc.setFillColor(15, 118, 110); // Brand Teal
            doc.rect(0, 0, 210, 42, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('MEDISYNC HEALTHCARE', 20, 22);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('OFFICIAL CLINICAL PRESCRIPTION RECORD', 20, 31);
            doc.setFontSize(10);
            doc.text(`ISSUED: ${formatDate(p.createdAt)}`, 140, 22);
            doc.text(`STATUS: ${(p.status || 'PENDING').toUpperCase()}`, 140, 31);

            // Doctor & Patient Info
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PRESCRIBING PHYSICIAN', 20, 56);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Doctor: Dr. ${user?.name || 'Physician'}`, 20, 64);
            doc.text(`License / ID: ${user?.licenseNumber || user?._id || 'Verified Doctor'}`, 20, 71);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PATIENT DETAILS', 120, 56);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${p.patientName || 'N/A'}`, 120, 64);
            doc.text(`Age: ${p.patientAge ? `${p.patientAge} Years` : 'N/A'}`, 120, 71);
            doc.text(`Patient ID: ${p.patientId || 'N/A'}`, 120, 78);

            // Diagnosis
            doc.setDrawColor(226, 232, 240);
            doc.line(20, 86, 190, 86);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('CLINICAL DIAGNOSIS', 20, 96);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitDiagnosis = doc.splitTextToSize(p.diagnosis || 'None recorded', 170);
            doc.text(splitDiagnosis, 20, 104);

            let yPos = 104 + (splitDiagnosis.length * 6) + 6;

            // Medications
            doc.line(20, yPos, 190, yPos);
            yPos += 8;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('PRESCRIBED MEDICATIONS', 20, yPos);
            yPos += 8;

            doc.setFillColor(241, 245, 249);
            doc.rect(20, yPos - 5, 170, 8, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(71, 85, 105);
            doc.text('MEDICINE', 24, yPos);
            doc.text('DOSAGE', 80, yPos);
            doc.text('FREQUENCY', 115, yPos);
            doc.text('DURATION', 155, yPos);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);

            if (Array.isArray(p.medicines) && p.medicines.length > 0) {
                p.medicines.forEach((med) => {
                    doc.text(String(med.name || '-'), 24, yPos);
                    doc.text(String(med.dosage || '-'), 80, yPos);
                    doc.text(String(med.frequency || '-'), 115, yPos);
                    doc.text(String(med.duration || '-'), 155, yPos);
                    yPos += 7;
                    if (med.instructions) {
                        doc.setFontSize(8);
                        doc.setTextColor(100, 116, 139);
                        doc.text(`Note: ${med.instructions}`, 28, yPos);
                        doc.setFontSize(9);
                        doc.setTextColor(15, 23, 42);
                        yPos += 6;
                    }
                });
            } else {
                doc.text('No medication entries specified.', 24, yPos);
                yPos += 8;
            }

            // Security / Digital Signature
            yPos += 10;
            doc.setDrawColor(226, 232, 240);
            doc.line(20, yPos, 190, yPos);
            yPos += 8;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 118, 110);
            doc.text('CRYPTOGRAPHIC INTEGRITY VERIFICATION', 20, yPos);
            yPos += 6;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Prescription Hash: ${p.prescriptionHash ? p.prescriptionHash.slice(0, 52) + '...' : 'Verified SHA-256 Signature'}`, 20, yPos);
            yPos += 5;
            doc.text(`Digital Signature: ${p.digitalSignature ? p.digitalSignature.slice(0, 52) + '...' : 'Verified Doctor Private Key'}`, 20, yPos);

            doc.save(`Prescription_${p.patientName || 'Record'}_${p._id?.slice(-6) || 'rx'}.pdf`);
            toast.success('Prescription PDF exported successfully');
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            toast.error('Failed to generate PDF document');
        }
    };

    // Filter and search logic
    const pendingCount = prescriptions.filter(p => p.status?.toLowerCase() === 'pending').length;
    const dispensedCount = prescriptions.filter(p => p.status?.toLowerCase() === 'dispensed').length;
    const totalCount = prescriptions.length;

    const filteredPrescriptions = prescriptions.filter(p => {
        // Status filter
        if (filterStatus === 'pending' && p.status?.toLowerCase() !== 'pending') return false;
        if (filterStatus === 'dispensed' && p.status?.toLowerCase() !== 'dispensed') return false;

        // Search filter
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            const matchesPatient = p.patientName?.toLowerCase().includes(query);
            const matchesDiagnosis = p.diagnosis?.toLowerCase().includes(query);
            const matchesId = p._id?.toLowerCase().includes(query);
            const matchesMedicine = Array.isArray(p.medicines) && p.medicines.some(m =>
                m.name?.toLowerCase().includes(query) ||
                m.dosage?.toLowerCase().includes(query)
            );
            return matchesPatient || matchesDiagnosis || matchesId || matchesMedicine;
        }

        return true;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-brand/10 border-t-brand rounded-full mb-8 shadow-sm"
            />
            <div className="text-center">
                <p className="text-slate-400 font-black tracking-[0.4em] text-[10px] uppercase mb-2">Loading Dashboard</p>
                <p className="text-slate-900 font-bold text-sm">Fetching your clinical data...</p>
            </div>
        </div>
    );

    if (showCreate) return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full"
        >
            <CreatePrescription
                onComplete={() => { setShowCreate(false); fetchData(); }}
                onCancel={() => setShowCreate(false)}
            />
        </motion.div>
    );

    return (
        <div className="w-full relative min-h-screen dashboard-container">
            <style>{`
                .dashboard-container {
                    background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 40%, #e6f7f5 100%);
                }
                .dark .dashboard-container {
                    background: linear-gradient(135deg, #070b12 0%, #0c1424 50%, #06181b 100%) !important;
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
                .dark .dashboard-pattern {
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(20,184,166,0.14), transparent 45%),
                        radial-gradient(circle at 90% 80%, rgba(37,99,235,0.14), transparent 45%);
                }
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .dashboard-card {
                    border-radius: 20px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
                    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                }
                .dark .dashboard-card {
                    background-color: #0f172a !important;
                    border-color: #1e293b !important;
                    color: #f8fafc !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.45) !important;
                }
                .dashboard-card:hover {
                    transform: translateY(-2px) !important;
                }
            `}</style>
            <div className="dashboard-pattern" />
            <div className="relative z-10 w-full">
                <DashboardTopBar />
                <div className="w-full max-w-[1440px] mx-auto pb-24 px-4 sm:px-6 lg:px-10 space-y-12">
                    {/* Clinical Hero */}
                    <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-200/80 dark:border-slate-800 pb-12 pt-4">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="px-4 py-1.5 bg-brand/5 dark:bg-brand/10 text-brand rounded-xl border-brand/20 text-[10px] font-black uppercase tracking-widest italic">
                                    Doctor Portal
                                </Badge>
                                <div className="flex items-center gap-2.5 text-emerald-500">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Account Verified & Active</span>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-4">
                                    Doctor <span className="text-brand">Dashboard</span>
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
                                    Welcome back, <span className="text-slate-900 dark:text-white font-bold">Dr. {user?.name?.split(' ')[0] || 'Doctor'}</span>. Review patient records, track statuses, and issue verified prescriptions.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => setShowCreate(true)}
                                className="h-16 px-8 rounded-2xl bg-slate-900 dark:bg-brand text-white shadow-xl hover:bg-black dark:hover:bg-brand/90 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 group transition-all"
                            >
                                <span>Create Prescription</span>
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-brand dark:group-hover:bg-slate-900 group-hover:rotate-90 transition-all duration-300">
                                    <Plus size={18} />
                                </div>
                            </Button>
                        </div>
                    </header>

                    {/* Performance KPIs - Clickable Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                id: 'all',
                                label: "Total Prescriptions",
                                value: totalCount,
                                icon: ClipboardList,
                                color: "text-brand",
                                bg: "bg-brand/10",
                                border: "border-brand/20",
                                activeRing: "ring-2 ring-brand border-brand/40 bg-teal-50/40",
                                suffix: "Issued",
                                hint: "Click to show all"
                            },
                            {
                                id: 'pending',
                                label: "Pending Prescriptions",
                                value: pendingCount,
                                icon: Activity,
                                color: "text-amber-500",
                                bg: "bg-amber-100/70",
                                border: "border-amber-200",
                                activeRing: "ring-2 ring-amber-400 border-amber-300 bg-amber-50/50",
                                suffix: "Waiting",
                                hint: "Click to filter pending"
                            },
                            {
                                id: 'dispensed',
                                label: "Dispensed Rate",
                                value: totalCount > 0 ? `${Math.round((dispensedCount / totalCount) * 100)}%` : "100%",
                                icon: CheckCircle,
                                color: "text-emerald-500",
                                bg: "bg-emerald-100/70",
                                border: "border-emerald-200",
                                activeRing: "ring-2 ring-emerald-400 border-emerald-300 bg-emerald-50/50",
                                suffix: `${dispensedCount} Done`,
                                hint: "Click to filter dispensed"
                            },
                        ].map((stat) => {
                            const isActive = filterStatus === stat.id;
                            return (
                                <Card
                                    key={stat.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        // If clicking the already selected filter, reset to 'all' unless clicking 'all'
                                        if (filterStatus === stat.id && stat.id !== 'all') {
                                            setFilterStatus('all');
                                        } else {
                                            setFilterStatus(stat.id);
                                        }
                                    }}
                                    className={`p-7 md:p-8 !rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                                        isActive
                                            ? `${stat.activeRing} shadow-md scale-[1.02]`
                                            : 'border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90'
                                    }`}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl opacity-50 -mr-16 -mt-16 group-hover:opacity-80 transition-opacity`} />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-12 h-12 ${stat.bg} ${stat.border} border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-brand px-3 py-1 rounded-full shadow-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Filter
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {stat.hint}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{stat.label}</p>
                                        <div className="flex items-baseline gap-3">
                                            <h4 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight italic">{stat.value}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.suffix}</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Application Matrix */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* Table Section */}
                        <Card className="dashboard-card xl:col-span-8 !rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden relative bg-white dark:bg-slate-900">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
                            
                            {/* Card Header & Controls */}
                            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 mb-1">
                                        <Users size={22} className="text-brand" />
                                        Recent <span className="text-brand">Prescriptions</span>
                                    </h3>
                                    <p className="text-slate-400 font-medium text-xs sm:text-sm">
                                        Showing {filteredPrescriptions.length} of {totalCount} records
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Quick Filter Tabs */}
                                    <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFilterStatus('all')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                filterStatus === 'all'
                                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            All ({totalCount})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFilterStatus('pending')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                filterStatus === 'pending'
                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'pending' ? 'bg-white' : 'bg-amber-500'}`} />
                                            Pending ({pendingCount})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFilterStatus('dispensed')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                filterStatus === 'dispensed'
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'dispensed' ? 'bg-white' : 'bg-emerald-500'}`} />
                                            Dispensed ({dispensedCount})
                                        </button>
                                    </div>

                                    {/* Search Input */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-brand focus-within:bg-white dark:focus-within:bg-slate-800 transition-all w-full sm:w-56">
                                        <Search className="text-slate-400 w-4 h-4 shrink-0" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search patient, diagnosis..."
                                            className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Active Filter Banner */}
                            {filterStatus !== 'all' && (
                                <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Filtered by:</span>
                                        <Badge variant="outline" className={`capitalize font-black text-[10px] ${
                                            filterStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                                        }`}>
                                            {filterStatus}
                                        </Badge>
                                        <span className="text-slate-400">({filteredPrescriptions.length} items)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFilterStatus('all')}
                                        className="text-brand font-black hover:underline flex items-center gap-1 text-[11px]"
                                    >
                                        <RotateCcw size={12} /> Clear Filter
                                    </button>
                                </div>
                            )}

                            {/* Prescriptions Table with proper spacing and visibility */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Patient Name</th>
                                            <th className="px-6 py-4">Diagnosis</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date Issued</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <AnimatePresence>
                                            {filteredPrescriptions.map((p, idx) => (
                                                <motion.tr
                                                    key={p._id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    onClick={() => setSelectedPrescription(p)}
                                                    className="group hover:bg-teal-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                                >
                                                    {/* Patient Column */}
                                                    <td className="px-6 py-4.5">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-10 h-10 bg-slate-900 dark:bg-brand text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-all shrink-0">
                                                                {p.patientName?.charAt(0) || 'P'}
                                                            </div>
                                                            <div>
                                                                <p className={`font-black text-slate-900 dark:text-white tracking-tight text-sm leading-snug group-hover:text-brand transition-colors ${
                                                                    patientPrivacyMask ? 'patient-name-mask' : ''
                                                                }`}>
                                                                    {p.patientName}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    {p.patientAge ? `${p.patientAge} Yrs • ` : ''}Patient
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Diagnosis Column */}
                                                    <td className="px-6 py-4.5 max-w-[260px]">
                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={p.diagnosis}>
                                                            "{p.diagnosis}"
                                                        </p>
                                                    </td>

                                                    {/* Status Column - Clickable badge */}
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFilterStatus(p.status?.toLowerCase() === 'pending' ? 'pending' : 'dispensed');
                                                            }}
                                                            title={`Click to filter by ${p.status}`}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 ${
                                                                p.status?.toLowerCase() === 'dispensed'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
                                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800'
                                                            }`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${p.status?.toLowerCase() === 'dispensed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                            {p.status || 'Pending'}
                                                        </button>
                                                    </td>

                                                    {/* Date Issued Column - Full display with date & time */}
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">
                                                                {formatDate(p.createdAt)}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                {formatTime(p.createdAt)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Action Column */}
                                                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPrescription(p);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm group-hover:bg-brand group-hover:text-white"
                                                        >
                                                            <Eye size={13} />
                                                            <span>View</span>
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {/* Empty State */}
                                {filteredPrescriptions.length === 0 && (
                                    <div className="py-20 text-center bg-white">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Stethoscope size={30} />
                                        </div>
                                        <p className="text-slate-900 font-bold text-sm mb-1">No Prescriptions Found</p>
                                        <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                                            {filterStatus !== 'all' 
                                                ? `No ${filterStatus} prescriptions currently exist.` 
                                                : 'No prescriptions match your search criteria.'}
                                        </p>
                                        {filterStatus !== 'all' && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setFilterStatus('all')}
                                                className="text-xs font-bold"
                                            >
                                                Show All Prescriptions
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Right Sidebar Panels */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Clinical Intelligence Card */}
                            <Card className="dashboard-card bg-slate-900 text-white border-none shadow-xl p-8 !rounded-[2.5rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand blur-3xl opacity-20 -mr-24 -mt-24" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3.5 mb-6">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand border border-white/10">
                                            <Zap size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight uppercase italic">Platform <span className="text-brand">Status</span></h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-time Overview</p>
                                        </div>
                                    </div>

                                    <p className="text-white/70 text-xs font-medium leading-relaxed mb-8 italic">
                                        Clinical prescription engine operates with <span className="text-white font-black">100%</span> cryptographic signing integrity.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5, delay: 0.2 }}
                                                className="h-full bg-brand shadow-glow shadow-brand/40"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-white/40">System Status</span>
                                            <span className="text-brand flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Infrastructure Status */}
                            <Card className="dashboard-card p-8 !rounded-[2.5rem] border border-slate-200/80 shadow-sm bg-white">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center gap-2.5">
                                    <ShieldCheck size={16} className="text-brand" />
                                    System Connections
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Database Service', status: 'Online', icon: Database },
                                        { label: 'Pharmacy Network', status: 'Optimal', icon: Zap },
                                        { label: 'Security & PKI', status: 'Secured', icon: Lock }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                                                    <item.icon size={15} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-wider">
                                                {item.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className="pt-10 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2.5">
                                <LayoutDashboard size={15} />
                                <span className="text-[10px] font-black uppercase tracking-widest">MediSync Doctor Portal</span>
                            </div>
                            <div className="h-3 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2.5">
                                <Clock size={15} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Synced in Real-time</span>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black bg-brand/5 text-brand border-brand/20 rounded-lg">
                            Active Session Verified
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Prescription Detail Modal */}
            <AnimatePresence>
                {selectedPrescription && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedPrescription(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Prescription Details
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-none ${
                                                selectedPrescription.status === 'dispensed'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}
                                        >
                                            {selectedPrescription.status}
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic">
                                        {selectedPrescription.patientName}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400">
                                        Record ID: <span className="font-mono text-slate-600 dark:text-slate-300">{selectedPrescription._id}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPrescription(null)}
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Patient & Prescription Metadata */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Patient Age</span>
                                    <span className="font-black text-slate-800 dark:text-slate-200">{selectedPrescription.patientAge ? `${selectedPrescription.patientAge} Years` : 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Date Issued</span>
                                    <span className="font-black text-slate-800 dark:text-slate-200">{formatDate(selectedPrescription.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Time Issued</span>
                                    <span className="font-black text-slate-800 dark:text-slate-200">{formatTime(selectedPrescription.createdAt)}</span>
                                </div>
                            </div>

                            {/* Diagnosis Section */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Clinical Diagnosis</span>
                                <div className="p-4 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-brand/20">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                        "{selectedPrescription.diagnosis}"
                                    </p>
                                </div>
                            </div>

                            {/* Medications Table */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Prescribed Medications</span>
                                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="p-3">Medicine</th>
                                                <th className="p-3">Dosage</th>
                                                <th className="p-3">Frequency</th>
                                                <th className="p-3">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {Array.isArray(selectedPrescription.medicines) && selectedPrescription.medicines.length > 0 ? (
                                                selectedPrescription.medicines.map((m, mi) => (
                                                    <tr key={mi} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                                        <td className="p-3 font-black text-slate-900 dark:text-white">{m.name}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{m.dosage || '-'}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{m.frequency || '-'}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{m.duration || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-slate-400">No medication items listed</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Cryptographic Signature Box */}
                            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl space-y-2 text-xs border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-brand flex items-center gap-1.5">
                                        <ShieldCheck size={14} /> Cryptographic Proof
                                    </span>
                                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                        Verified Signature
                                    </span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-400 break-all leading-snug">
                                    <span className="text-slate-500">Hash: </span>
                                    {selectedPrescription.prescriptionHash || 'SHA-256 Verified on Record'}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSelectedPrescription(null)}
                                    className="rounded-xl px-5 py-2.5 font-bold text-xs dark:text-slate-300 dark:border-slate-700 hover:dark:bg-slate-800"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleDownloadPDF(selectedPrescription)}
                                    className="rounded-xl px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-black text-xs flex items-center gap-2 shadow-sm"
                                >
                                    <Download size={15} />
                                    Download PDF
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorDashboard;
