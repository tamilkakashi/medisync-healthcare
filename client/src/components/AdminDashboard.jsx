import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ShieldAlert, Users, Activity, Search, ShieldCheck, Database, Trash2, Edit3, X, RefreshCw, Globe, Cpu, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DashboardTopBar from './DashboardTopBar';

const ROLE_COLORS = {
    admin: 'bg-rose-500 text-white',
    doctor: 'bg-brand text-white',
    pharmacy: 'bg-emerald-600 text-white',
    patient: 'bg-sky-500 text-white',
    hospital: 'bg-violet-600 text-white',
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [auditLogs, setAuditLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', isApproved: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, statsRes, usersRes] = await Promise.all([
                api.get('/auth/audit-logs').catch(() => ({ data: { logs: [] } })),
                api.get('/auth/stats').catch(() => ({ data: {} })),
                api.get('/auth/users').catch(() => ({ data: { users: [] } }))
            ]);
            setAuditLogs(logsRes.data?.logs || (Array.isArray(logsRes.data) ? logsRes.data : []));
            setStats(statsRes.data || {});
            setUsers(usersRes.data?.users || (Array.isArray(usersRes.data) ? usersRes.data : []));
        } catch (error) {
            toast.error('System synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/auth/approve/${userId}`);
            toast.success('User account approved');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/auth/users/${userToDelete._id}`);
            toast.success('User deleted successfully');
            setUserToDelete(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deletion failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditInitiate = (u) => {
        setEditingUser(u);
        setEditForm({ name: u.name, email: u.email, role: u.role, isApproved: u.isApproved });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${editingUser._id}`, editForm);
            toast.success('User updated successfully');
            setEditingUser(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    // Filtered + searched users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = roleFilter === 'all' || u.role === roleFilter;
            const matchStatus = statusFilter === 'all' ||
                (statusFilter === 'approved' && u.isApproved) ||
                (statusFilter === 'pending' && !u.isApproved);
            return matchSearch && matchRole && matchStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const pendingCount = users.filter(u => !u.isApproved && u.role !== 'patient').length;

    if (loading) return (
        <div className="w-full">
            <DashboardTopBar />
            <div className="min-h-[80vh] flex items-center justify-center">
                <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-24 h-24 bg-brand/10 rounded-[2.5rem] flex items-center justify-center border border-brand/20 shadow-soft text-brand">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="text-center">
                        <p className="text-slate-400 font-black tracking-[0.4em] text-[10px] uppercase mb-2">Loading System</p>
                        <p className="text-slate-900 font-bold text-sm">Fetching Admin Data...</p>
                    </div>
                </motion.div>
            </div>
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
                .admin-card {
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .admin-card:hover {
                    transform: translateY(-4px);
                }
            `}</style>
            <div className="dashboard-pattern" />
            <div className="relative z-10 w-full">
                <DashboardTopBar />
                <div className="w-full max-w-[1400px] mx-auto pb-24 px-6 lg:px-12">

                    {/* ── Header ── */}
                    <motion.header
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-b border-slate-100 pb-16 mb-16 pt-12"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic">
                                    Admin Access
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Online</span>
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                Admin <span className="text-brand">Dashboard</span>
                            </h1>
                            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-soft border border-slate-100 w-fit">
                                <Cpu size={16} className="text-brand" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                    Logged in as: <span className="text-slate-900">{user?.name}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={fetchData}
                                className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand hover:border-brand/40 transition-all hover:shadow-soft group"
                            >
                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                            </button>

                            {/* Tab Switcher */}
                            <div className="flex bg-slate-100/70 p-2 rounded-[1.75rem] shadow-inner-soft border border-slate-100 gap-2">
                                {[
                                    { id: 'overview', label: 'Overview', icon: Globe },
                                    { id: 'users', label: 'Users', icon: Users, badge: pendingCount > 0 ? pendingCount : null },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                            ? 'bg-white text-brand shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                        {tab.badge && (
                                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.header>

                    {/* ── Overview Tab ── */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', header: 'bg-blue-600' },
                                    { label: 'Prescriptions', value: stats?.totalPrescriptions || 0, icon: Database, color: 'text-brand', bg: 'bg-brand/5', border: 'border-brand/10', header: 'bg-brand' },
                                    { label: 'Audit Events', value: auditLogs.length, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', header: 'bg-rose-500' },
                                    { label: 'System Uptime', value: '99.99%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', header: 'bg-emerald-500' },
                                ].map((s, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="admin-card bg-white overflow-hidden border border-slate-100 group"
                                    >
                                        <div className={`${s.header} px-8 py-5 flex items-center justify-between`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{s.label}</p>
                                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                                <s.icon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="px-8 py-6">
                                            <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic">{s.value}</h4>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Data</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pending Approvals Alert */}
                            {pendingCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="admin-card bg-amber-50 border border-amber-200 p-8 flex items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600">
                                            <AlertCircle size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Action Required</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                <span className="text-amber-600 font-black">{pendingCount}</span> user{pendingCount > 1 ? 's' : ''} waiting for approval
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setActiveTab('users')}
                                        className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-soft"
                                    >
                                        Review Now
                                    </Button>
                                </motion.div>
                            )}

                            {/* Audit Log Table */}
                            <div className="admin-card bg-white overflow-hidden border border-slate-100">
                                <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                                <Lock size={18} />
                                            </div>
                                            System <span className="text-brand">Logs</span>
                                        </h3>
                                        <p className="text-slate-400 font-bold text-sm">Recent activities across the platform</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Search className="text-slate-300 w-4 h-4 ml-2" />
                                        <input
                                            placeholder="Search logs..."
                                            className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 w-44"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/70 text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] border-b border-slate-100">
                                            <tr>
                                                <th className="px-10 py-6">Action</th>
                                                <th className="px-10 py-6">User</th>
                                                <th className="px-10 py-6">Description</th>
                                                <th className="px-10 py-6 text-right">Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            <AnimatePresence>
                                                {auditLogs.slice(0, 15).map((log, i) => (
                                                    <motion.tr
                                                        key={log._id || i}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.02 }}
                                                        className="group hover:bg-slate-50/30 transition-colors"
                                                    >
                                                        <td className="px-10 py-6">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${log.action?.includes('LOGIN') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                log.action?.includes('PRESCRIPTION') ? 'bg-brand/5 text-brand border-brand/10' :
                                                                    log.action?.includes('APPROVE') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                        log.action?.includes('DELETE') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                                }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm">
                                                                    {log.userId?.name?.[0] || 'S'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{log.userId?.name || 'System'}</p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.userId?.role || 'SYSTEM'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 max-w-xs">
                                                            <p className="text-sm text-slate-600 font-bold italic truncate">"{log.details || 'Action completed'}"</p>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <p className="text-xs font-black text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                    {auditLogs.length === 0 && (
                                        <div className="py-24 text-center">
                                            <Database size={40} className="text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No Logs Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── User Management Tab ── */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">

                            {/* Search + Filters */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                {/* Search */}
                                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-soft w-full max-w-md">
                                    <Search className="text-slate-300 w-5 h-5 shrink-0" />
                                    <input
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 w-full"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="text-slate-300 hover:text-slate-600 transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Role Filter */}
                                    <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                                        {['all', 'admin', 'doctor', 'patient', 'pharmacy', 'hospital'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRoleFilter(r)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Status Filter */}
                                    <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                                        {['all', 'approved', 'pending'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setStatusFilter(s)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                        {filteredUsers.length}/{users.length} shown
                                    </span>
                                </div>
                            </div>

                            {/* User Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map((u, i) => (
                                        <motion.div
                                            key={u._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="admin-card bg-white border border-slate-100 overflow-hidden group"
                                        >
                                            {/* Top colored strip */}
                                            <div className={`h-1.5 ${ROLE_COLORS[u.role]?.split(' ')[0] || 'bg-slate-400'}`} />

                                            <div className="p-8">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 ${ROLE_COLORS[u.role] || 'bg-slate-400 text-white'} rounded-2xl flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 uppercase italic tracking-tight text-base leading-none mb-1">{u.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[160px]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${ROLE_COLORS[u.role] || 'bg-slate-400 text-white'}`}>
                                                            {u.role}
                                                        </span>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isApproved
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${u.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                            {u.isApproved ? 'Approved' : 'Pending'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                                    {!u.isApproved && u.role !== 'patient' && (
                                                        <Button
                                                            onClick={() => handleApprove(u._id)}
                                                            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={13} />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditInitiate(u)}
                                                        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-400 hover:text-brand hover:bg-brand/5 border border-slate-100 hover:border-brand/20 transition-all text-[9px] font-black uppercase tracking-widest"
                                                    >
                                                        <Edit3 size={13} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToDelete(u)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-slate-100 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="admin-card py-32 text-center bg-white border border-slate-100">
                                    <Users size={48} className="text-slate-100 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Users Found</h3>
                                    <p className="text-slate-400 font-bold text-sm">Try changing your search or filter criteria</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* ── Edit User Modal ── */}
                <AnimatePresence>
                    {editingUser && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl"
                                onClick={() => setEditingUser(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                                className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-mega overflow-hidden"
                            >
                                {/* Colored top strip based on role */}
                                <div className={`h-2 ${ROLE_COLORS[editForm.role]?.split(' ')[0] || 'bg-slate-400'}`} />

                                <div className="p-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <span className={`inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 ${ROLE_COLORS[editForm.role] || 'bg-slate-400 text-white'}`}>
                                                Editing: {editingUser.role}
                                            </span>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Update <span className="text-brand">Details</span></h2>
                                        </div>
                                        <button
                                            onClick={() => setEditingUser(null)}
                                            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Full Name"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                required
                                            />
                                            <Input
                                                label="Email Address"
                                                type="email"
                                                value={editForm.email}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Role Selector */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Role</p>
                                            <div className="flex flex-wrap gap-3">
                                                {['patient', 'doctor', 'pharmacy', 'hospital', 'admin'].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setEditForm({ ...editForm, role: r })}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${editForm.role === r
                                                            ? `${ROLE_COLORS[r]} border-transparent shadow-md`
                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Approval Toggle */}
                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Account Approval</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">Grant or revoke system access for this user</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, isApproved: !editForm.isApproved })}
                                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${editForm.isApproved ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${editForm.isApproved ? 'translate-x-8' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4">
                                            <Button
                                                type="button"
                                                onClick={() => setEditingUser(null)}
                                                className="h-14 px-8 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-mega transition-all"
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Delete Confirmation Modal ── */}
                <AnimatePresence>
                    {userToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className="w-full max-w-md bg-white rounded-[3rem] shadow-mega p-12 relative text-center"
                            >
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-100">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Confirm <span className="text-rose-500">Deletion</span></h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-10">
                                    You are about to permanently remove <span className="text-slate-900 font-black">"{userToDelete.name}"</span> from the database. This action cannot be undone.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-soft transition-all"
                                    >
                                        {isDeleting ? 'Removing User...' : 'Yes, Permanently Delete'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setUserToDelete(null)}
                                        disabled={isDeleting}
                                        className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400"
                                    >
                                        Cancel
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

export default AdminDashboard;
