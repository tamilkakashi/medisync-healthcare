import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsModal from './components/SettingsModal';
import MobileBottomNav from './components/MobileBottomNav';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';

const Home = () => <Navigate to="/dashboard" replace />;

function App() {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider>
                    <div className="min-h-screen bg-medical-bg dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
                        {/* Constrained Container with Mobile Safe Area Support */}
                        <div className="w-full max-w-[2000px] mx-auto min-h-screen flex flex-col relative shadow-2xl bg-white/40 dark:bg-slate-900/40 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    className: 'font-medium tracking-tight rounded-xl shadow-lg border border-slate-100 dark:border-slate-800',
                                    style: {
                                        backdropFilter: 'blur(8px)',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        color: '#0f172a'
                                    }
                                }}
                            />
                            {/* Global Settings Modal */}
                            <SettingsModal />

                            {/* Top Navbar (for unauthenticated or non-dashboard pages) */}
                            <Navbar />

                            {/* Main Scrollable Content */}
                            <main className="flex-1 w-full flex flex-col overflow-x-hidden min-h-0 pb-20 md:pb-0">
                                <ErrorBoundary>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/settings" element={<SettingsPage />} />

                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/dashboard" element={<Dashboard />} />
                                        </Route>
                                    </Routes>
                                </ErrorBoundary>
                            </main>

                            {/* Native-style Mobile Bottom Navigation Bar (< 768px viewports) */}
                            <MobileBottomNav />
                        </div>
                    </div>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
