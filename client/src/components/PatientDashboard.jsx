import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { History, ClipboardList, BadgeCheck, Stethoscope, ShieldCheck, Clock, FileDown, Pill, User, Calendar, Activity, ChevronRight, Download, Zap, Database, ArrowRight, Bell, MapPin, Building, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import DashboardTopBar from './DashboardTopBar';
import { cn } from '../utils/helpers';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [rxRes, docRes, notifRes] = await Promise.all([
                    api.get('/prescriptions').catch(() => ({ data: { prescriptions: [] } })),
                    api.get('/auth/patient/doctor-details').catch(() => ({ data: null })),
                    api.get('/auth/notifications').catch(() => ({ data: { notifications: [] } }))
                ]);

                setPrescriptions(rxRes.data.prescriptions || []);
                setDoctorDetails(docRes.data);
                setNotifications(notifRes.data.notifications || []);
            } catch (error) {
                console.error('Data synchronization failure:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/auth/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleDownload = (p) => {
        const doc = new jsPDF();
        doc.setFillColor(8, 145, 178); // Primary Teal
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDISYNC', 20, 28);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('PRESCRIPTION RECORD', 20, 36);
        doc.setFontSize(12);
        doc.text(`ISSUED: ${new Date(p.createdAt).toLocaleDateString().toUpperCase()}`, 145, 28);

        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT DETAILS', 20, 65);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${p.patientName}`, 20, 75);
        doc.text(`ID: ${p.patientId}`, 20, 82);
        doc.text(`Age: ${p.patientAge}`, 20, 89);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCTOR DETAILS', 115, 65);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Dr. ${p.doctorId?.name || 'Verified Doctor'}`, 115, 75);
        doc.text(`License: ${p.doctorId?.licenseNumber || 'N/A'}`, 115, 82);

        doc.setDrawColor(241, 245, 249);
        doc.line(20, 100, 190, 100);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('DIAGNOSIS', 20, 115);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(p.diagnosis, 20, 125, { maxWidth: 170 });

        doc.setFillColor(248, 250, 252);
        doc.rect(20, 145, 170, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICINES', 25, 153);
        doc.text('DOSAGE', 105, 153);
        doc.text('FREQ', 140, 153);
        doc.text('LIFE', 175, 153);

        let yPos = 168;
        doc.setFont('helvetica', 'normal');
        p.medicines.forEach((m) => {
            doc.text(m.name, 25, yPos);
            doc.text(`${m.dosage}`, 105, yPos);
            doc.text(m.frequency, 140, yPos);
            doc.text(`${m.duration}D`, 175, yPos);
            doc.setDrawColor(248, 250, 252);
            doc.line(20, yPos + 4, 190, yPos + 4);
            yPos += 12;
        });

        doc.setDrawColor(5, 150, 105);
        doc.setLineWidth(1.5);
        doc.roundedRect(140, yPos + 10, 50, 25, 3, 3);
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('VERIFIED', 152, yPos + 22);
        doc.setFontSize(7);
        doc.text('SECURE NETWORK SEAL', 150, yPos + 29);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text('SECURE ELECTRONIC PRESCRIPTION', 105, 285, { align: 'center' });
        doc.save(`${p.patientName.replace(/\s+/g, '_')}_Rx.pdf`);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6 border border-brand/20"
            >
                <ShieldCheck size={32} />
            </motion.div>
            <span className="text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase">Loading your records...</span>
        </div>
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
                <div className="space-y-8 sm:space-y-16 px-4 sm:px-6 lg:px-12 py-6 sm:py-10 max-w-[1400px] mx-auto">
                    {/* Header Section */}
                    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-slate-100 pb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-brand/5 text-brand rounded-full text-[10px] font-black uppercase tracking-widest border border-brand/10">Patient Account</span>
                            </div>
                            <h1 className="text-slate-900 mb-2">
                                Your <span className="text-brand italic">Dashboard</span>
                            </h1>
                            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 w-fit">
                                <User className="w-5 h-5 text-brand" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hi, <span className="text-slate-900 font-black">{user?.name}</span></span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand/40 transition-all hover:shadow-soft group"
                                >
                                    <Bell size={20} className={cn(unreadCount > 0 && "animate-bounce text-brand")} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <>
                                            {/* Backdrop on mobile for easy dismissal */}
                                            <div 
                                                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs sm:hidden" 
                                                onClick={() => setShowNotifications(false)} 
                                            />

                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="fixed inset-x-4 top-24 sm:top-auto sm:inset-auto sm:right-0 sm:mt-4 sm:absolute sm:w-80 w-auto max-w-sm sm:max-w-none mx-auto sm:mx-0 z-50 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden"
                                            >
                                                {/* Header with Title and Close Button */}
                                                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                                                            <Bell size={14} />
                                                        </div>
                                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                                                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNotifications(false)}
                                                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
                                                        aria-label="Close notifications"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>

                                                {/* Notifications List */}
                                                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto custom-scrollbar">
                                                    {notifications.length > 0 ? (
                                                        notifications.map(n => (
                                                            <div
                                                                key={n._id}
                                                                onClick={() => !n.isRead && markAsRead(n._id)}
                                                                className={cn(
                                                                    "p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                                    !n.isRead && "bg-brand/[0.04] dark:bg-brand/[0.08]"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                                                    <p className={cn(
                                                                        "text-xs leading-relaxed font-bold break-words whitespace-normal",
                                                                        !n.isRead ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                                                    )}>
                                                                        {n.message}
                                                                    </p>
                                                                    {!n.isRead && (
                                                                        <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1" />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                                    <span>
                                                                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                    {!n.isRead && (
                                                                        <span className="text-[9px] font-black uppercase text-brand tracking-wider">New</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center">
                                                            <Bell size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Alerts</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-brand/20 blur-3xl group-hover:bg-brand/40 transition-colors" />
                                <div className="w-12 h-12 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg relative z-10">
                                    <Database size={20} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Your Details</p>
                                    <p className="text-white text-sm font-bold tracking-tight">Are Safe & Secure</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                        {/* Profile Sidebar */}
                        <div className="xl:col-span-3 space-y-6">
                            <Card className="dashboard-card text-center p-10 !rounded-[2.5rem] sticky top-12 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
                                <div className="w-24 h-24 bg-brand/5 rounded-[2rem] mx-auto flex items-center justify-center text-5xl font-black text-brand border border-brand/10 mb-8 shadow-inner">
                                    {user?.name[0]}
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">{user?.name}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{user?.email}</p>

                                <div className="space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900 uppercase">Active</span>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-brand/5 rounded-2xl border border-brand/10 text-left">
                                        <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-2">Account</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900 uppercase">Verified</span>
                                            <BadgeCheck className="w-4 h-4 text-brand" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <Button variant="secondary" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                                        Settings
                                    </Button>
                                </div>
                            </Card>

                            {/* Assigned Doctor Card */}
                            <AnimatePresence>
                                {doctorDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative group"
                                    >
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-emerald-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                                        <Card className="dashboard-card relative p-8 !rounded-[2.5rem] bg-white border-slate-100 overflow-hidden">
                                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                                                <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center border border-brand/10">
                                                    <Stethoscope size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Assigned Doctor</h3>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Care</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Physician Name</p>
                                                    <p className="text-sm font-black text-slate-900 uppercase italic leading-none">Dr. {doctorDetails.doctorName}</p>
                                                </div>

                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Specialty</p>
                                                    <p className="text-sm font-bold text-brand italic leading-none">{doctorDetails.department}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Room</p>
                                                            <p className="text-xs font-black text-slate-900 italic leading-none">{doctorDetails.roomNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                            <Building size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Floor</p>
                                                            <p className="text-xs font-black text-slate-900 italic leading-none">{doctorDetails.floorNumber}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-bold text-emerald-700 leading-relaxed italic">
                                                    "Please visit the doctor for consultation at the mentioned location."
                                                </p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Timeline Content */}
                        <div className="xl:col-span-9 space-y-12">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-brand shadow-sm">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none mb-1">Your Prescriptions</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical History</p>
                                    </div>
                                </div>
                                <Badge status="neutral" className="bg-white border-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {prescriptions.length} Records Found
                                </Badge>
                            </div>

                            <div className="space-y-10 relative">
                                {/* Vertical line for visual storytelling */}
                                <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-brand/20 to-slate-200 hidden lg:block" />

                                <AnimatePresence mode="popLayout">
                                    {prescriptions.length > 0 ? (
                                        prescriptions.map((p, idx) => (
                                            <motion.div
                                                key={p._id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative lg:pl-24"
                                            >
                                                <div className="absolute left-8 top-12 w-4 h-4 bg-white border-2 border-brand rounded-full z-10 hidden lg:block shadow-medical" />

                                                <Card className="dashboard-card hover:shadow-2xl transition-shadow duration-500 !p-0 overflow-hidden border-none shadow-soft">
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                                        {/* Date & Metadata */}
                                                        <div className="lg:col-span-3 p-10 bg-slate-50/50 flex flex-col justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2">{new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-6 italic">{new Date(p.createdAt).getFullYear()}</p>

                                                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                                                                            <Stethoscope size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Provider</p>
                                                                            <p className="text-xs font-bold text-slate-800 uppercase italic">Dr. {p.doctorId?.name || 'Staff'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge status={p.status === 'dispensed' ? 'verified' : 'pending'}>
                                                                        {p.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Diagnosis & Medicines */}
                                                        <div className="lg:col-span-9 p-10 space-y-10 bg-white">
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Diagnosis</p>
                                                                <p className="text-xl font-bold text-slate-700 leading-relaxed italic border-l-4 border-brand/20 pl-8 py-2 bg-slate-50/30 rounded-r-2xl">
                                                                    "{p.diagnosis}"
                                                                </p>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Prescribed Medicines</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {(p.medicines || []).map((m, i) => (
                                                                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group-hover:border-brand/20 transition-colors shadow-sm">
                                                                            <div>
                                                                                <p className="text-lg font-black text-slate-900 tracking-tight uppercase italic leading-none mb-2">{m.name}</p>
                                                                                <div className="flex gap-4">
                                                                                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest"><Clock size={12} className="text-brand/40" /> {m.frequency}</span>
                                                                                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest"><Calendar size={12} className="text-brand/40" /> {m.duration}D</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-brand">
                                                                                {m.dosage}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="pt-8 border-t border-slate-100 flex justify-end">
                                                                <Button
                                                                    className="h-16 px-10 bg-slate-950 hover:bg-black rounded-2xl shadow-medical shadow-slate-900/10 gap-4 group/btn"
                                                                    onClick={() => handleDownload(p)}
                                                                >
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Download Prescription Record</span>
                                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover/btn:bg-brand transition-colors">
                                                                        <Download size={16} className="text-white" />
                                                                    </div>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-48 border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/40 backdrop-blur-sm">
                                            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                                                <ClipboardList className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Records</h3>
                                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">You don't have any prescriptions yet</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

