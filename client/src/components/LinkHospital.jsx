import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Building2, CheckCircle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LinkHospital = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const res = await api.get('/auth/hospitals');
            setHospitals(res.data);
        } catch (err) {
            console.error('Failed to fetch hospitals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async (hospitalId) => {
        try {
            await api.put('/auth/update-hospital', { hospitalId });
            toast.success('Successfully linked to hospital.');
            fetchHospitals();
        } catch (err) {
            toast.error('Failed to link hospital.');
        }
    };

    return (
        <Card className="!rounded-[2rem] border-none shadow-soft overflow-hidden bg-secondary">
            <div className="p-8 border-b border-accent/20 flex items-center justify-between">
                <div>
                    <h5 className="text-xl font-black text-primary uppercase italic flex items-center gap-3">
                        <Building2 className="text-accent" size={20} />
                        Link <span className="text-accent">Hospital</span>
                    </h5>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select your primary hospital</p>
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent border-none text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    Registry
                </Badge>
            </div>

            <CardContent className="p-8">
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    <AnimatePresence>
                        {hospitals.map((h, idx) => (
                            <motion.div
                                key={h._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 hover:shadow-soft transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black text-base group-hover:bg-accent transition-colors shadow-sm">
                                        {h.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-primary uppercase italic text-sm tracking-tight">{h.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node ID: {h._id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleLink(h._id)}
                                    className="h-10 px-6 bg-accent hover:bg-accent-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center gap-2"
                                >
                                    Link Hospital
                                    <ArrowRight size={14} />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {!loading && hospitals.length === 0 && (
                        <div className="py-12 text-center">
                            <Activity size={32} className="text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed"> No hospitals <br /> found.</p>
                        </div>
                    )}
                </div>
            </CardContent>

            <div className="p-6 bg-secondary border-t border-accent/20 flex items-center gap-3">
                <ShieldCheck size={14} className="text-accent" />
                <span className="text-[9px] font-black text-accent-dark uppercase tracking-widest">Secure Hospital Link</span>
            </div>
        </Card>
    );
};

export default LinkHospital;
