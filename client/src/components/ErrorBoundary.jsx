import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-soft max-w-2xl mx-auto my-12">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-8">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tight">Protocol Alert</h2>
                    <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                        An unexpected exception occurred during component render. The integrity of this view has been compromised.
                    </p>
                    <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg">
                        REBOOT INTERFACE
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
