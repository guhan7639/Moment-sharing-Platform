import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Shield, ChevronRight, Activity } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        let value = e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await register(formData);
            navigate(formData.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-4 py-20">
            {/* Background Glow */}
            <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="glass p-12 w-full max-w-2xl relative z-10 border-none shadow-3xl rounded-[3rem]">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl mb-2">
                        <Activity size={32} className="text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Create Your Account</h1>
                        <p className="text-slate-600 dark:text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Step into the future of events</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-2xl mb-8 text-sm font-medium animate-in zoom-in duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <User size={12} /> Full Identity
                        </label>
                        <input
                            name="name"
                            type="text"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Shield size={12} /> Unique Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            placeholder="master_username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail size={12} /> Network Address (Email)
                        </label>
                        <input
                            name="email"
                            type="email"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Lock size={12} /> Encrypted Key (Password)
                        </label>
                        <input
                            name="password"
                            type="password"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Activity size={12} /> Access Clearance (Role)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                                className={`h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${formData.role === 'user' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-500 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}
                            >
                                Standard User
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                className={`h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${formData.role === 'admin' ? 'bg-violet-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-500 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}
                            >
                                Administrator
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 btn-primary h-16 rounded-[2rem] flex items-center justify-center gap-4 text-xl font-black tracking-tight group mt-4">
                        Initialize Account <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-12 text-slate-600 dark:text-slate-500 font-bold text-sm">
                    Already verified?{' '}
                    <Link to="/login" className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                        Access Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
