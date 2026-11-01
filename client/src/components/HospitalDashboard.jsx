import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import {
    Building2, Users, Stethoscope, Plus, Activity, ShieldCheck, Mail, Key,
    FileText, X, CheckCircle, Trash2, Search, Filter, MoreVertical, Globe,
    Zap, ArrowRight, ShieldAlert, LayoutDashboard, UserPlus, Pill, ClipboardList, Lock,
    ChevronRight, Save, UserCheck, AlertCircle, RefreshCw, Eye, Edit
} from 'lucide-react';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DashboardTopBar from './DashboardTopBar';
import { cn } from '../utils/helpers';

const HospitalDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Data states
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [securityLogs, setSecurityLogs] = useState([]);
    const [monitoringStats, setMonitoringStats] = useState(null);

    // UI states
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
    const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Linking filters
    const [doctorSearch, setDoctorSearch] = useState('');
    const [doctorCategory, setDoctorCategory] = useState('All');

    // Form states
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', department: '', licenseNumber: '', roomNumber: '', floorNumber: ''
    });
    const [editDoctorForm, setEditDoctorForm] = useState({
        name: '', department: '', licenseNumber: '', status: '', roomNumber: '', floorNumber: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab !== 'overview') {
            fetchTabData(activeTab);
        }
    }, [activeTab]);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/auth/stats');
            setStats(res.data);
            setMonitoringStats(res.data); // Initial stats
        } catch (error) {
            console.error('Initial fetch failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTabData = async (tab) => {
        setLoading(true);
        try {
            switch (tab) {
                case 'doctors':
                    const drRes = await api.get('/hospital/doctors');
                    setDoctors(drRes.data.doctors);
                    break;
                case 'patients':
                    const pRes = await api.get('/hospital/patients');
                    setPatients(pRes.data.patients);
                    const docListRes = await api.get('/hospital/doctors'); // Need doctors for linking
                    setDoctors(docListRes.data.doctors);
                    break;
                case 'pharmacies':
                    const phRes = await api.get('/hospital/pharmacies');
                    setPharmacies(phRes.data.pharmacies);
                    break;
                case 'logs':
                    const logRes = await api.get('/hospital/security-logs');
                    setSecurityLogs(logRes.data.logs);
                    break;
                case 'prescriptions':
                    const pStatsRes = await api.get('/auth/stats');
                    setMonitoringStats(pStatsRes.data);
                    const allPres = await api.get('/prescriptions?limit=50');
                    setPrescriptions(allPres.data.prescriptions || []);
                    break;
                default:
                    break;
            }
        } catch (error) {
            toast.error(`Failed to load ${tab} data`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hospital/create-doctor', newDoctor);
            toast.success('Doctor account created successfully');
            setShowAddDoctorModal(false);
            setNewDoctor({ name: '', email: '', password: '', department: '', licenseNumber: '', roomNumber: '', floorNumber: '' });
            fetchTabData('doctors');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create doctor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setEditDoctorForm({
            name: doctor.name || '',
            department: doctor.department || '',
            licenseNumber: doctor.licenseNumber || '',
            status: doctor.status || 'approved',
            roomNumber: doctor.roomNumber || '',
            floorNumber: doctor.floorNumber || ''
        });
        setShowEditDoctorModal(true);
    };

    const handleEditDoctorSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/hospital/update-doctor/${selectedDoctor._id}`, editDoctorForm);
            toast.success('Doctor updated successfully');
            setShowEditDoctorModal(false);
            fetchTabData('doctors');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update doctor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDoctorClick = (id) => {
        setDoctorToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteDoctor = async () => {
        if (!doctorToDelete) return;
        setSubmitting(true);
        try {
            await api.delete(`/hospital/delete-doctor/${doctorToDelete}`);
            toast.success("Doctor deleted successfully");
            setShowDeleteConfirmModal(false);
            fetchTabData('doctors');
        } catch (error) {
            toast.error("Failed to delete doctor");
        } finally {
            setSubmitting(false);
            setDoctorToDelete(null);
        }
    };

    const handleUpdatePharmacyStatus = async (id, status) => {
        try {
            await api.put(`/hospital/pharmacy-status/${id}`, { status });
            toast.success(`Pharmacy ${status} successfully`);
            fetchTabData('pharmacies');
        } catch (error) {
            toast.error('Failed to update pharmacy status');
        }
    };

    const handleLinkPatient = async (pId, dId) => {
        if (!dId) return toast.error('Please select a doctor');
        setSubmitting(true);
        try {
            await api.put('/hospital/link-patient-doctor', { patientId: pId, doctorId: dId });
            toast.success('Patient linked to doctor');
            setShowLinkModal(false);
            fetchTabData('patients');
        } catch (error) {
            toast.error('Failed to link patient');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadReport = () => {
        if (!prescriptions.length) {
            toast.error('No prescriptions available to export');
            return;
        }

        const headers = ['Date Issued', 'Patient Name', 'Patient ID', 'Doctor Name', 'Doctor License', 'Diagnosis', 'Status'];
        const csvRows = prescriptions.map(pr => {
            return [
                new Date(pr.createdAt).toLocaleString().replace(/,/g, ''),
                `"${pr.patientName}"`,
                pr.patientId,
                `"${pr.doctorId?.name || 'Unknown'}"`,
                pr.doctorId?.licenseNumber || 'N/A',
                `"${pr.diagnosis}"`,
                pr.status
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `medisync_aggregate_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Aggregate report downloaded successfully');
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'doctors', label: 'Doctor Management', icon: Stethoscope },
        { id: 'patients', label: 'Patient Records', icon: Users },
        { id: 'pharmacies', label: 'Pharmacy Approval', icon: Pill },
        { id: 'prescriptions', label: 'Prescription Monitoring', icon: ClipboardList },
        { id: 'logs', label: 'Security Logs', icon: Lock },
    ];

    const departments = ['All', ...new Set(doctors.map(d => d.department || 'General Medicine'))];
    const filteredDoctorsForLinking = doctors.filter(dr => {
        const matchesSearch = dr.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            dr.email.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            (dr.licenseNumber && dr.licenseNumber.toLowerCase().includes(doctorSearch.toLowerCase()));
        const matchesCategory = doctorCategory === 'All' || (dr.department || 'General Medicine') === doctorCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen flex flex-col dashboard-container relative">
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
            <div className="relative z-10 flex flex-col w-full h-full min-h-screen">
                <DashboardTopBar />

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-80 bg-white border-r border-slate-100 hidden xl:flex flex-col p-8 space-y-12">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Hospital Menu</p>
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group",
                                            activeTab === item.id
                                                ? "bg-brand text-white shadow-lg shadow-brand/20"
                                                : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-brand"} />
                                        <span className="text-sm tracking-tight">{item.label}</span>
                                        {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/20 blur-2xl group-hover:bg-brand/30 transition-all" />
                            <h4 className="text-sm font-black uppercase tracking-tighter italic mb-2">Secure <span className="text-brand">Protocol</span></h4>
                            <p className="text-[10px] text-white/50 font-bold leading-relaxed">System operating under institutional administrative encryption.</p>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-7xl mx-auto space-y-12"
                            >
                                {/* Section Header */}
                                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                    <div>
                                        <Badge variant="outline" className="mb-6 px-4 py-2 bg-brand/5 text-brand rounded-xl border-brand/10 text-[10px] font-black uppercase tracking-widest italic">
                                            Hospital Management
                                        </Badge>
                                        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                            {activeTab.replace('-', ' ')} <span className="text-brand">Module</span>
                                        </h2>
                                    </div>
                                    {activeTab === 'doctors' && (
                                        <Button onClick={() => setShowAddDoctorModal(true)} className="h-16 px-8 rounded-2xl shadow-mega">
                                            <Plus className="mr-3" size={20} />
                                            Register New Doctor
                                        </Button>
                                    )}
                                </header>

                                {/* Module Views */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: "Institutional Doctors", value: stats?.totalDoctors || 0, icon: Stethoscope, color: "text-brand", bg: "bg-brand/5" },
                                                { label: "Active Patients", value: stats?.totalPatients || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
                                                { label: "Prescriptions Issued", value: stats?.totalPrescriptions || 0, icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50" },
                                                { label: "Network Activity", value: "99.9%", icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
                                            ].map((s, i) => (
                                                <Card key={i} className="p-8 !rounded-3xl border-none shadow-soft group hover:shadow-hover transition-all">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm", s.bg)}>
                                                        <s.icon className={s.color} size={20} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                                                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">{s.value}</h3>
                                                </Card>
                                            ))}
                                        </div>

                                        <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft p-12 bg-slate-900 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[100px] -mr-48 -mt-48" />
                                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                                <div>
                                                    <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-tight mb-6">
                                                        Hospital <span className="text-brand">Connectivity</span> Status
                                                    </h3>
                                                    <p className="text-white/60 font-medium leading-relaxed mb-8">
                                                        Your clinical infrastructure is fully synced with the MediSync central node.
                                                        Administrative verification is active for all connected pharmacies.
                                                    </p>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Active Link</span>
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Node: MS-Institutional-04</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        { label: 'Blockchain Sync', val: 'Verified', color: 'text-emerald-400' },
                                                        { label: 'Cloud Buffer', val: 'Optimal', color: 'text-brand' },
                                                        { label: 'API Latency', val: '12ms', color: 'text-blue-400' },
                                                        { label: 'Security Patch', val: 'V.2.4', color: 'text-slate-400' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                                                            <p className={cn("text-xs font-black uppercase tracking-tighter italic", item.color)}>{item.val}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'doctors' && (
                                    <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                                    <Stethoscope size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Physician <span className="text-brand">Directory</span></h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Clinical Staff</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100">
                                                <Search className="text-slate-300" size={16} />
                                                <input placeholder="Filter by name..." className="bg-transparent border-none text-xs font-bold focus:outline-none w-48" />
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <th className="px-8 py-6 text-left">Physician</th>
                                                        <th className="px-8 py-6 text-left">Department</th>
                                                        <th className="px-8 py-6 text-left">Credentials</th>
                                                        <th className="px-8 py-6 text-left">Status</th>
                                                        <th className="px-8 py-6 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {doctors.map((dr) => (
                                                        <tr key={dr._id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase italic">
                                                                        {dr.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic leading-none mb-1">{dr.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400">{dr.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 bg-white">
                                                                    {dr.department || 'General Medicine'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-xs font-black text-slate-600 uppercase tracking-tighter italic">{dr.licenseNumber || 'LC-NODE-X'}</p>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dr.status === 'suspended' ? "bg-rose-500" : "bg-emerald-500")} />
                                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", dr.status === 'suspended' ? "text-rose-500" : "text-emerald-500")}>
                                                                        {dr.status || 'Active'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button onClick={() => handleEditDoctorClick(dr)} className="p-2 hover:bg-brand/10 hover:text-brand text-slate-300 rounded-lg transition-colors">
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteDoctorClick(dr._id)} className="p-2 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-lg transition-colors">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {doctors.length === 0 && (
                                                <div className="py-24 flex flex-col items-center justify-center grayscale opacity-30">
                                                    <Stethoscope size={48} className="text-slate-300 mb-6" />
                                                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Authorized Doctors Found</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {activeTab === 'patients' && (
                                    <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Patient <span className="text-brand">Records</span></h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Institutional Database</p>
                                        </div>
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {patients.map(patient => (
                                                <Card key={patient._id} className="p-6 !rounded-2xl border-slate-100 hover:border-brand/30 transition-all hover:shadow-soft group">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-brand group-hover:text-white transition-colors">
                                                            {patient.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{patient.name}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400">{patient.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4 mb-6 pt-4 border-t border-slate-50">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-slate-400">Assigned MD</span>
                                                            {patient.doctorId ? (
                                                                <span className="text-brand italic">Linked</span>
                                                            ) : (
                                                                <span className="text-amber-500 italic">Unassigned</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                        onClick={() => {
                                                            setSelectedPatient(patient);
                                                            setShowLinkModal(true);
                                                        }}
                                                    >
                                                        <UserPlus size={14} className="mr-2" />
                                                        Manage Linkage
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {activeTab === 'pharmacies' && (
                                    <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Pharmacy <span className="text-brand">Verification</span></h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Partner Management</p>
                                        </div>
                                        <div className="p-8 space-y-4">
                                            {pharmacies.map(pharmacy => (
                                                <div key={pharmacy._id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-brand/20">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                            <Pill size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">{pharmacy.name}</h4>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] font-bold text-slate-400">{pharmacy.email}</span>
                                                                <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2">{pharmacy.registrationNumber || 'Partner'}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right mr-4">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                            <Badge className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none",
                                                                pharmacy.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                                    pharmacy.status === 'suspended' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                                            )}>
                                                                {pharmacy.status || 'Pending'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {pharmacy.status !== 'approved' && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="rounded-xl h-12 px-6"
                                                                    onClick={() => handleUpdatePharmacyStatus(pharmacy._id, 'approved')}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            {pharmacy.status !== 'suspended' && (
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="rounded-xl h-12 px-6"
                                                                    onClick={() => handleUpdatePharmacyStatus(pharmacy._id, 'suspended')}
                                                                >
                                                                    Suspend
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: "Total Prescriptions", val: monitoringStats?.totalPrescriptions || 0, color: 'text-slate-900', icon: FileText },
                                                { label: "Pending Verification", val: monitoringStats?.pendingVerification || 0, color: 'text-amber-500', icon: AlertCircle },
                                                { label: "Verified & Dispensed", val: monitoringStats?.verifiedPrescriptions || 0, color: 'text-emerald-500', icon: CheckCircle },
                                                { label: "Expired/Void", val: monitoringStats?.expiredPrescriptions || 0, color: 'text-rose-500', icon: X },
                                            ].map((item, i) => (
                                                <Card key={i} className="p-8 !rounded-3xl border-none shadow-soft">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                            <item.icon size={18} />
                                                        </div>
                                                        <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</Badge>
                                                    </div>
                                                    <h4 className={cn("text-4xl font-black italic tracking-tighter", item.color)}>{item.val}</h4>
                                                </Card>
                                            ))}
                                        </div>

                                        <Card className="dashboard-card p-12 !rounded-[3rem] border-none shadow-soft flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-10">
                                                <Activity size={40} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Real-Time Sync <span className="text-emerald-500">Active</span></h3>
                                            <p className="text-slate-400 font-bold max-w-xl mb-10 leading-relaxed italic">
                                                Institutional oversight is operational. All verified prescriptions are cryptographically signed by authorized medical personnel and tracked via audit logs.
                                            </p>
                                            <Button variant="secondary" onClick={handleDownloadReport} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest">
                                                Download Aggregate Report
                                            </Button>
                                        </Card>

                                        <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft overflow-hidden">
                                            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                                        <ClipboardList size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 uppercase italic">Active <span className="text-brand">Prescriptions</span></h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network-wide clinical orders</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <th className="px-8 py-6 text-left">Patient</th>
                                                            <th className="px-8 py-6 text-left">Physician</th>
                                                            <th className="px-8 py-6 text-left">Condition</th>
                                                            <th className="px-8 py-6 text-left">Status</th>
                                                            <th className="px-8 py-6 text-right">Date Issued</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {prescriptions.map((pr) => (
                                                            <tr key={pr._id} className="group hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase italic">
                                                                            {pr.patientName.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic leading-none mb-1">{pr.patientName}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400">ID: {pr.patientId}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-black text-slate-700 uppercase italic">{pr.doctorId?.name || 'Unknown'}</span>
                                                                        <span className="text-[9px] font-mono text-slate-400">{pr.doctorId?.licenseNumber || 'N/A'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <p className="text-xs font-bold text-slate-500 italic max-w-xs truncate">{pr.diagnosis}</p>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <Badge status={pr.status === 'dispensed' ? 'verified' : 'pending'} className="text-[9px] font-black uppercase tracking-widest">
                                                                        {pr.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <p className="text-[10px] font-bold text-slate-500 mb-1">{new Date(pr.createdAt).toLocaleDateString()}</p>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(pr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {prescriptions.length === 0 && (
                                                    <div className="py-24 flex flex-col items-center justify-center grayscale opacity-30">
                                                        <ClipboardList size={48} className="text-slate-300 mb-6" />
                                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Prescriptions Found in Network</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'logs' && (
                                    <Card className="dashboard-card !rounded-[3rem] border-none shadow-soft overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Security <span className="text-brand">Audit Trail</span></h3>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/10 rounded-xl">
                                                <ShieldCheck className="text-brand" size={14} />
                                                <span className="text-[9px] font-black text-brand uppercase tracking-widest">Administrative Eye Active</span>
                                            </div>
                                        </div>
                                        <div className="p-8 overflow-x-auto">
                                            <div className="space-y-4">
                                                {securityLogs.map((log, i) => (
                                                    <div key={log._id} className="p-6 bg-white border border-slate-50 rounded-2xl flex items-center justify-between gap-6 group hover:border-brand/20 transition-all">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[8px] font-black text-slate-300 group-hover:bg-brand group-hover:text-white transition-colors">
                                                                <Activity size={16} className="mb-1" />
                                                                LOG
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                                                        {log.actorRole}
                                                                    </Badge>
                                                                    <span className="text-[10px] font-black uppercase text-slate-400 italic">{log.action}</span>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-700 tracking-tight leading-relaxed">{log.details}</p>

                                                                {/* Enhanced Target Data View */}
                                                                {log.targetData && (
                                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                                        {log.targetType === 'User' && (
                                                                            <>
                                                                                <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-100 font-bold text-slate-500">
                                                                                    Target: {log.targetData.name} ({log.targetData.role})
                                                                                </Badge>
                                                                                {log.targetData.department && (
                                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-100 font-bold text-slate-500">
                                                                                        Dept: {log.targetData.department}
                                                                                    </Badge>
                                                                                )}
                                                                                {log.targetData.licenseNumber && (
                                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-100 font-bold text-slate-500">
                                                                                        License: {log.targetData.licenseNumber}
                                                                                    </Badge>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {log.targetType === 'Prescription' && (
                                                                            <>
                                                                                <Badge variant="outline" className="text-[9px] bg-emerald-50 border-emerald-100 font-bold text-emerald-600">
                                                                                    Patient: {log.targetData.patientName}
                                                                                </Badge>
                                                                                <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-100 font-bold text-slate-500">
                                                                                    Diagnosis: {log.targetData.diagnosis}
                                                                                </Badge>
                                                                                <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-100 font-bold text-slate-500 uppercase">
                                                                                    Status: {log.targetData.status}
                                                                                </Badge>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Enhanced Actor Context */}
                                                                {log.actorId && log.actorId.name && (
                                                                    <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                                        Initiated by: <span className="text-brand">{log.actorId.name}</span>
                                                                        {log.actorId.licenseNumber && ` (${log.actorId.licenseNumber})`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold text-slate-400 mb-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic leading-none">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {securityLogs.length === 0 && (
                                                    <div className="py-24 text-center grayscale opacity-30">
                                                        <Lock size={48} className="text-slate-300 mx-auto mb-6" />
                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Security Clearance Required / No Activity Detected</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showAddDoctorModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className="w-full max-w-xl bg-white rounded-[4rem] shadow-mega p-16 relative"
                            >
                                <button onClick={() => setShowAddDoctorModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"><X size={24} /></button>
                                <div className="mb-10">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Add <span className="text-brand">Physician</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">authorized clinical registration</p>
                                </div>
                                <form onSubmit={handleCreateDoctor} className="space-y-6">
                                    <Input label="Full Medical Name" placeholder="Dr. Kumar" value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Department" placeholder="Cardiology" value={newDoctor.department} onChange={e => setNewDoctor({ ...newDoctor, department: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                        <Input label="License ID" placeholder="MD-2026-X" value={newDoctor.licenseNumber} onChange={e => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Room Number" placeholder="204" value={newDoctor.roomNumber} onChange={e => setNewDoctor({ ...newDoctor, roomNumber: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                        <Input label="Floor Number" placeholder="2" value={newDoctor.floorNumber} onChange={e => setNewDoctor({ ...newDoctor, floorNumber: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    </div>
                                    <Input label="Institutional Email" type="email" placeholder="kumar@hospital.com" value={newDoctor.email} onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    <Input label="Temporary Password" type="password" placeholder="••••••••••••" value={newDoctor.password} onChange={e => setNewDoctor({ ...newDoctor, password: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    <Button type="submit" disabled={submitting} className="w-full h-16 rounded-2xl shadow-mega mt-4 font-black uppercase tracking-widest">
                                        {submitting ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {showEditDoctorModal && selectedDoctor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className="w-full max-w-xl bg-white rounded-[4rem] shadow-mega p-16 relative"
                            >
                                <button onClick={() => setShowEditDoctorModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"><X size={24} /></button>
                                <div className="mb-10">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Edit <span className="text-brand">Physician</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">update clinical staff details</p>
                                </div>
                                <form onSubmit={handleEditDoctorSubmit} className="space-y-6">
                                    <Input label="Full Medical Name" placeholder="Dr. Kumar" value={editDoctorForm.name} onChange={e => setEditDoctorForm({ ...editDoctorForm, name: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Department" placeholder="Cardiology" value={editDoctorForm.department} onChange={e => setEditDoctorForm({ ...editDoctorForm, department: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                        <Input label="License ID" placeholder="MD-2026-X" value={editDoctorForm.licenseNumber} onChange={e => setEditDoctorForm({ ...editDoctorForm, licenseNumber: e.target.value })} required className="bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Room Number" placeholder="204" value={editDoctorForm.roomNumber} onChange={e => setEditDoctorForm({ ...editDoctorForm, roomNumber: e.target.value })} className="bg-slate-50 border-slate-100" />
                                        <Input label="Floor Number" placeholder="2" value={editDoctorForm.floorNumber} onChange={e => setEditDoctorForm({ ...editDoctorForm, floorNumber: e.target.value })} className="bg-slate-50 border-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 ml-1">Account Status</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-brand/40 transition-all cursor-pointer"
                                            value={editDoctorForm.status}
                                            onChange={e => setEditDoctorForm({ ...editDoctorForm, status: e.target.value })}
                                            required
                                        >
                                            <option value="approved">Active</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <Button type="submit" disabled={submitting} className="w-full h-16 rounded-2xl shadow-mega mt-4 font-black uppercase tracking-widest">
                                        {submitting ? 'UPDATING...' : 'SAVE CHANGES'}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {showDeleteConfirmModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-mega border border-rose-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500" />
                                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 border-[8px] border-white shadow-sm">
                                    <ShieldAlert size={40} className="text-rose-500" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Confirm <span className="text-rose-500">Deletion</span></h3>
                                <p className="text-sm font-bold text-slate-500 mb-10 leading-relaxed">
                                    Are you sure you want to permanently remove this doctor from the hospital network? This action cannot be undone and will revoke all access.
                                </p>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400 border-slate-200 hover:bg-slate-50">Cancel</Button>
                                    <Button onClick={confirmDeleteDoctor} disabled={submitting} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-white">
                                        {submitting ? 'Deleting...' : 'Delete Doctor'}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showLinkModal && selectedPatient && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className="w-full max-w-2xl bg-white rounded-[3rem] shadow-mega p-12 relative overflow-hidden"
                            >
                                <button onClick={() => setShowLinkModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 z-10"><X size={20} /></button>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Link <span className="text-brand">Patient</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Assign physician to {selectedPatient.name}</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Search and Filter Controls */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                placeholder="Search name, email, or license..."
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand/40 transition-all"
                                                value={doctorSearch}
                                                onChange={e => setDoctorSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <select
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand/40 appearance-none transition-all cursor-pointer"
                                                value={doctorCategory}
                                                onChange={e => setDoctorCategory(e.target.value)}
                                            >
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {filteredDoctorsForLinking.map(dr => (
                                            <button
                                                key={dr._id}
                                                onClick={() => handleLinkPatient(selectedPatient._id, dr._id)}
                                                className="w-full group p-5 rounded-[2rem] border border-slate-50 hover:border-brand/40 hover:bg-slate-50 transition-all text-left relative overflow-hidden flex items-center gap-5 shadow-sm hover:shadow-md"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black italic uppercase group-hover:bg-brand transition-colors">
                                                    {dr.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none">{dr.name}</p>
                                                        <Badge className="bg-brand/5 text-brand text-[8px] border-none px-2 py-0.5">{dr.department || 'General Medicine'}</Badge>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mb-2 leading-none">{dr.email}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                            <ShieldCheck size={10} className="text-emerald-500" />
                                                            <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-tighter">{dr.licenseNumber || 'LC-NODE-X'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={cn("w-1 h-1 rounded-full", dr.status === 'suspended' ? "bg-rose-500" : "bg-emerald-500")} />
                                                            <span className={cn("text-[9px] font-black uppercase tracking-widest italic", dr.status === 'suspended' ? "text-rose-500" : "text-emerald-500")}>
                                                                {dr.status || 'Verified'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-brand opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                                                    <UserCheck size={20} />
                                                </div>
                                            </button>
                                        ))}
                                        {filteredDoctorsForLinking.length === 0 && (
                                            <div className="py-12 flex flex-col items-center justify-center grayscale opacity-30 text-center">
                                                <Search size={32} className="text-slate-300 mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Physicains found matching filters</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="secondary" onClick={() => setShowLinkModal(false)} className="w-full h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase mt-4">
                                        Exit Link Portal
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HospitalDashboard;
