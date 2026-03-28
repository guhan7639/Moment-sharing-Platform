import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
    User as UserIcon, 
    QrCode, 
    Mail, 
    Shield, 
    Calendar, 
    Edit3, 
    Save, 
    X, 
    Camera,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../constants';
import { formatImageUrl } from '../utils/imageUtils';


const Profile = () => {
    const { user, setUser } = useAuth();
    const fileInputRef = React.useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        profilePhoto: user?.profilePhoto || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                profilePhoto: user.profilePhoto || '',
            });
        }
    }, [user]);

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-bold">Please log in to view your profile.</h2>
            </div>
        </div>
    );

    const handlePhotoClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const photoFormData = new FormData();
        photoFormData.append('profilePhoto', file);

        try {
            setLoading(true);
            const { data } = await api.post('/auth/upload-profile', photoFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profilePhoto: data.filePath }));
            setMessage({ type: 'success', text: 'Photo uploaded! Click Save Changes to keep it.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Photo upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const { data } = await api.put('/auth/profile', formData);
            
            // Update AuthContext state
            setUser(prev => ({ ...prev, ...data }));
            
            // Update localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadQR = () => {
        if (!user.qrCode) return;
        const link = document.createElement('a');
        link.href = user.qrCode;
        link.download = `${user.username}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto space-y-8 pb-32 px-4"
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
                accept="image/*"
            />
            {/* Header Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden glass rounded-[2.5rem] bg-gradient-to-br from-white/80 to-slate-50/50 dark:from-slate-900/80 dark:to-slate-950/50 border-slate-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-rose-500/20 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                             {formData.profilePhoto || user.profilePhoto ? (
                                 <img 
                                     src={formatImageUrl(formData.profilePhoto || user.profilePhoto)} 
                                     alt={user.name} 
                                     className="w-full h-full object-cover" 
                                 />

                            ) : (
                                <UserIcon size={64} className="text-slate-400" />
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <button className="absolute bottom-2 right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors">
                                <Camera size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{user.name}</h1>
                            <span className="inline-flex items-center px-3 py-1 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-bold rounded-full border border-violet-200 dark:border-violet-500/20 capitalize w-fit mx-auto md:mx-0">
                                <Shield size={14} className="mr-1" /> {user.role}
                            </span>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
                            {user.bio || "No bio added yet. Tell us something about yourself!"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all font-bold text-slate-700 dark:text-slate-200"
                        >
                            {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"></div>
            </motion.div>

            <AnimatePresence>
                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Information Card */}
                <motion.div variants={itemVariants} className="md:col-span-2 glass p-8 rounded-[2rem] space-y-8 h-full">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <UserIcon className="text-rose-500" /> Personal Information
                        </h2>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Full Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 p-1">{user.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Email Address</label>
                                {isEditing ? (
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 p-1 flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" /> {user.email || 'Not provided'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Bio</label>
                            {isEditing ? (
                                <textarea 
                                    rows="4"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    placeholder="Write something about yourself..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed p-1">
                                    {user.bio || "No biography provided yet."}
                                </p>
                            )}
                        </div>

                        {isEditing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-end pt-4"
                            >
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl"
                                >
                                    {loading ? "Saving..." : <><Save size={20} /> Save Changes</>}
                                </button>
                            </motion.div>
                        )}
                    </form>
                </motion.div>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    {/* Account Stats Card */}
                    <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-violet-500" size={20} /> Activity & Stats
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Member Since</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-none">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Username</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-none">@{user.username}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* QR Code Card */}
                    <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <QrCode className="text-rose-500" size={20} /> Access QR
                            </h2>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400">Scan code to directly access your shared events.</p>
                        
                        {user.qrCode ? (
                            <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <img src={user.qrCode} alt="Your personalized QR Code" className="w-full aspect-square" />
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
                                <QrCode size={40} className="opacity-20" />
                                <p className="text-xs font-medium">QR not generated</p>
                            </div>
                        )}
                        
                        <button 
                            onClick={handleDownloadQR}
                            className="w-full py-3 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                            Download QR Code
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;

