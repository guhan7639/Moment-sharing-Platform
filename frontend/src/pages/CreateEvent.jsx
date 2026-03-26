import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, FileText, Tag, Image as ImageIcon, Plus, ArrowLeft } from 'lucide-react';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventDate: '',
        time: '', // Optional
        eventLocation: '',
        category: 'Wedding'
    });
    const [banner, setBanner] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBanner(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (banner) data.append('bannerImage', banner);

            await api.post('/events', data);

            if (isAdmin) {
                navigate('/admin');
            } else {
                alert('Your event request has been submitted and is pending admin approval.');
                navigate('/');
            }
        } catch (err) {
            console.error("AXIOS ERROR DETAILED:", err);
            console.error("Response data:", err.response?.data);
            alert(err.response?.data?.message || err.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <Link to={isAdmin ? "/admin" : "/"} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-500 hover:text-rose-500 mb-8 transition-colors">
                <ArrowLeft size={18} /> {isAdmin ? "Back to Dashboard" : "Back to Home"}
            </Link>

            <div className="glass p-12 rounded-[3rem] border border-slate-200 dark:border-none shadow-3xl bg-white/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                        <Plus size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                            {isAdmin ? "Initialize New Event" : "Submit Event Request"}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Event Configuration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={14} /> Full Event Name
                        </label>
                        <input
                            name="eventName"
                            className="input-field w-full h-14 px-6 rounded-2xl text-lg font-bold"
                            placeholder="e.g. Royal Wedding Symphony"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={14} /> Narrative / Description
                        </label>
                        <textarea
                            name="eventDescription"
                            className="input-field w-full h-40 px-6 py-4 rounded-3xl text-lg font-medium resize-none"
                            placeholder="Detailed description of the upcoming celebration..."
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Calendar size={14} /> Scheduled Date
                        </label>
                        <input
                            name="eventDate"
                            type="date"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Tag size={14} /> Event Category
                        </label>
                        <select
                            name="category"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            onChange={handleChange}
                            required
                        >
                            <option value="Wedding">Wedding</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Corporate">Corporate</option>
                            <option value="College">College</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={14} /> Venue Location
                        </label>
                        <input
                            name="eventLocation"
                            className="input-field w-full h-14 px-6 rounded-2xl font-bold"
                            placeholder="e.g. Grand Plaza, Downtown"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                        <label className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <ImageIcon size={14} /> Hero Banner Asset
                        </label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem] p-4 text-center hover:border-rose-500 transition-all cursor-pointer relative group overflow-hidden min-h-[220px] flex items-center justify-center">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {preview ? (
                                <div className="relative w-full h-[200px] animate-in zoom-in duration-500">
                                    <img src={preview} className="w-full h-full object-cover rounded-2xl shadow-2xl" alt="Preview" />
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Change Banner</div>
                                </div>
                            ) : (
                                <div className="text-slate-500 dark:text-slate-600 transition-colors group-hover:text-rose-500">
                                    <ImageIcon className="mx-auto mb-4" size={48} />
                                    <p className="text-lg font-black tracking-tight text-slate-700 dark:text-white">Select High-Resolution Banner</p>
                                    <p className="text-sm font-bold opacity-50 text-slate-600 dark:text-slate-400">Drag and drop or click to upload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="md:col-span-2 btn-primary h-20 rounded-[2.5rem] text-2xl font-black tracking-tighter mt-6 disabled:opacity-50 shadow-2xl overflow-hidden relative group"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                {isAdmin ? "Deploying Event..." : "Submitting..."}
                            </div>
                        ) : (
                            <>
                                {isAdmin ? "Initialize Celebration" : "Submit Request"}
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
