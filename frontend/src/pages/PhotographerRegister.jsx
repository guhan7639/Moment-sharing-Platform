import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Camera, Mail, Lock, User, Phone, Briefcase, Image as ImageIcon, Star } from 'lucide-react';

const PhotographerRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        experience: '',
        profilePhoto: '',
        portfolioPhotos: '',
        rating: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('profilePhoto', file);

        setUploading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/upload-profile', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profilePhoto: res.data.filePath }));
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Split portfolio photos by comma and trim
            const portfolioArray = formData.portfolioPhotos
                .split(',')
                .map(url => url.trim())
                .filter(url => url !== '');

            const dataToSend = {
                ...formData,
                role: 'photographer',
                portfolioPhotos: portfolioArray,
                rating: formData.rating ? Number(formData.rating) : 0
            };

            await axios.post('http://localhost:5000/api/auth/register', dataToSend);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/photographer-login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass p-8 rounded-3xl w-full max-w-2xl border-none shadow-3xl bg-white/50 dark:bg-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <Camera className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Join as Photographer</h2>
                        <p className="text-slate-600 dark:text-slate-400">Showcase your portfolio and book events instantly.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-xl mb-6 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="johndoe_photo"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Years of Experience</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="e.g. 5 Years"
                                    />
                                </div>
                            </div>
                            
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</label>
                                <div className="relative group">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"
                                        accept="image/*"
                                    />
                                </div>
                                {uploading && <div className="text-xs text-rose-500 animate-pulse">Uploading photo...</div>}
                                {formData.profilePhoto && (
                                    <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                                        <img src={`http://localhost:5000${formData.profilePhoto}`} alt="Profile Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rating (Optional for Demo)</label>
                                <div className="relative group">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="number"
                                        step="0.1"
                                        max="5"
                                        min="0"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="4.8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Portfolio Image URLs (Comma separated)</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                <textarea
                                    name="portfolioPhotos"
                                    value={formData.portfolioPhotos}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium min-h-[100px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="https://url1.jpg, https://url2.jpg, ..."
                                ></textarea>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-slate-300 dark:border-white/30 border-t-slate-800 dark:border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>

                        <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
                            Already have an account? {' '}
                            <Link to="/photographer-login" className="text-rose-500 hover:text-rose-400 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PhotographerRegister;
