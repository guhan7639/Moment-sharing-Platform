import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon, LogIn, ChevronRight, Layout } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(username, password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-4">
            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="glass p-12 w-full max-w-md relative z-10 border-none shadow-3xl rounded-[3rem]">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-rose-500 to-violet-500 rounded-3xl p-5 shadow-2xl rotate-3">
                        <Layout size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Eventify Hub</h1>
                        <p className="text-slate-600 dark:text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Portal Access</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-2xl mb-8 text-sm font-medium animate-in slide-in-from-top-4 duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <UserIcon size={14} /> Username
                        </label>
                        <input
                            type="text"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="e.g. admin_mark"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Lock size={14} /> Password
                        </label>
                        <input
                            type="password"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-lg font-black tracking-tight group overflow-hidden">
                        Secure Login <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/forgot-password" className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-colors">
                        Lost your vault key?
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 text-center">
                    <p className="text-slate-600 dark:text-slate-500 font-bold text-sm">
                        New to the platform?{' '}
                        <Link to="/register" className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                            Create Hub ID
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
