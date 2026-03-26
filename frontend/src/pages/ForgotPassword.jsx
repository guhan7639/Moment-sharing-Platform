import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, User as UserIcon, Mail, ChevronRight, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Verifying credentials...' });

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/reset-password', formData);
            setStatus({ type: 'success', message: data.message });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to reset password. Please check your details.'
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="glass p-12 w-full max-w-md relative z-10 border-none shadow-3xl rounded-[3rem]">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-3xl p-5 shadow-2xl rotate-3">
                        <Activity size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">Recover Access</h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Reset your vault key</p>
                    </div>
                </div>

                {status.message && (
                    <div className={`p-4 rounded-2xl mb-8 text-sm font-medium animate-in zoom-in duration-300 flex items-start gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
                            status.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                                'bg-sky-500/10 border-sky-500/20 text-sky-200'
                        }`}>
                        {status.type === 'success' && <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
                        {status.type === 'error' && <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <UserIcon size={14} /> Registered Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="e.g. admin_mark"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail size={14} /> Registered Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Lock size={14} /> New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.type === 'loading' || status.type === 'success'}
                        className="btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-lg font-black tracking-tight group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status.type === 'loading' ? 'Verifying...' : 'Reset Password'}
                        {!status.type && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-slate-500 font-bold text-sm">
                        Remembered your key?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Return to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
