import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock } from 'lucide-react';

const PhotographerLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await login(formData.username, formData.password);
            if (user.role === 'photographer') {
                navigate('/photographer-dashboard');
            } else {
                setError('This login is for photographers only.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass p-8 rounded-3xl w-full max-w-md border-none shadow-3xl bg-white/50 dark:bg-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <Camera className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Photographer Portal</h2>
                        <p className="text-slate-600 dark:text-slate-400">Sign in to manage your bookings.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="your_username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-slate-300 dark:border-white/30 border-t-slate-800 dark:border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
                            Not registered yet? {' '}
                            <Link to="/photographer-register" className="text-violet-500 hover:text-violet-400 font-semibold transition-colors">
                                Apply Now
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PhotographerLogin;
