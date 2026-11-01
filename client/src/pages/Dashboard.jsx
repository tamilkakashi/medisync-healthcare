import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import DoctorDashboard from '../components/DoctorDashboard';
import PharmacyDashboard from '../components/PharmacyDashboard';
import PatientDashboard from '../components/PatientDashboard';
import HospitalDashboard from '../components/HospitalDashboard';

import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return null;

    const renderDashboard = () => {
        switch (user.role) {
            case 'doctor': return <DoctorDashboard />;
            case 'pharmacy': return <PharmacyDashboard />;
            case 'patient': return <PatientDashboard />;
            case 'hospital': return <HospitalDashboard />;
            case 'admin': return <AdminDashboard />;
            default: return <div>Unrecognized role. Contact support.</div>;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={user.role}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
            >
                {renderDashboard()}
            </motion.div>
        </AnimatePresence>
    );
};

export default Dashboard;
