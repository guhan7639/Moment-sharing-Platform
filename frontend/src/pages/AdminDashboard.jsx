import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Edit, ExternalLink, Calendar, MapPin, Users, Image as ImageIcon, LayoutGrid, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';


const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, totalPhotos: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
                setStats({
                    totalEvents: data.length,
                    totalPhotos: 0,
                    totalUsers: 0
                });
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                setEvents(events.filter(e => e._id !== id));
            } catch (err) {
                alert('Deletion failed');
            }
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/events/${id}/status`, { status: newStatus });
            setEvents(events.map(e => e._id === id ? { ...e, status: newStatus } : e));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredEvents = events.filter(e =>
        e.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingEvents = filteredEvents.filter(e => e.status === 'Pending');
    const approvedEvents = filteredEvents.filter(e => e.status === 'Approved');

    return (
        <div className="space-y-12 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Command Center</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Event Logistics Oversight</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 flex items-center">
                        <input
                            type="text"
                            placeholder="Search logistics..."
                            className="input-field w-full pl-14 pr-4 h-14 rounded-2xl font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-2 p-3 text-slate-500 hover:text-rose-500 transition-colors">
                            <Search size={22} />
                        </button>
                    </div>
                    <Link to="/create-event" className="btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 shadow-2xl">
                        <Plus size={24} /> <span className="hidden sm:inline font-black uppercase tracking-tight">Deploy New</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Deployed Events', value: approvedEvents.length, icon: Calendar, color: 'emerald' },
                    { label: 'Pending Requests', value: pendingEvents.length, icon: Clock, color: 'amber' },
                    { label: 'Media Assets', value: stats.totalPhotos, icon: ImageIcon, color: 'violet' },
                    { label: 'Active Personnel', value: stats.totalUsers, icon: Users, color: 'blue' }
                ].map((stat, idx) => (
                    <div key={idx} className="glass p-8 rounded-[2.5rem] border border-slate-200 dark:border-none shadow-xl relative overflow-hidden group bg-white/50 dark:bg-slate-900/40">
                        <div className={`absolute top-0 left-0 w-2 h-full bg-${stat.color}-500 group-hover:w-full transition-all duration-700 opacity-20`} />
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-slate-600 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-5xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                            <stat.icon className={`text-${stat.color}-500 opacity-50 group-hover:scale-125 transition-transform duration-500`} size={48} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Requests Table */}
            {pendingEvents.length > 0 && (
                <div className="glass rounded-[3rem] shadow-2xl overflow-hidden mb-12 border border-amber-500/20 bg-white/50 dark:bg-slate-900/40">
                    <div className="p-8 border-b border-amber-500/10 flex items-center gap-3 bg-amber-500/5">
                        <Clock className="text-amber-500" size={24} />
                        <h2 className="text-xl font-black tracking-tight text-amber-600 dark:text-amber-500">Pending Authorization Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-6">Identity & Venue</th>
                                    <th className="px-6 py-6 text-center">Designation</th>
                                    <th className="px-6 py-6 text-center">Requested By</th>
                                    <th className="px-10 py-6 text-right">Action Required</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                                {pendingEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-amber-500/5 transition-all duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 shadow-2xl ring-2 ring-slate-200 dark:ring-white/5 group-hover:ring-amber-500/30 transition-all flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                    {event.bannerImage ? (
                                                        <img src={formatImageUrl(event.bannerImage)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                    ) : (

                                                        <ImageIcon size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-xl flex items-center gap-3 text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                                                        {event.eventName}
                                                    </div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                                                        <MapPin size={12} className="text-violet-500" /> {event.eventLocation}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-center">
                                            <span className="bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-lg">
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-8 text-center">
                                            <div className="text-sm font-black text-slate-700 dark:text-slate-300">
                                                {event.createdBy?.name || 'Unknown User'}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3 shadow-3xl">
                                                <button
                                                    onClick={() => handleStatusUpdate(event._id, 'Approved')}
                                                    className="p-3 bg-white dark:bg-slate-900/50 hover:bg-emerald-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-xl border border-slate-200 dark:border-none"
                                                    title="Approve Event"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(event._id, 'Rejected')}
                                                    className="p-3 bg-white dark:bg-slate-900/50 hover:bg-rose-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-xl border border-slate-200 dark:border-none"
                                                    title="Reject Event"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approved Events Table Container */}
            <div className="glass rounded-[3rem] shadow-2xl overflow-hidden bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10">
                <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center gap-3">
                    <LayoutGrid className="text-emerald-500" size={24} />
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Active Event Manifest</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-6">Identity & Venue</th>
                                <th className="px-6 py-6 text-center">Designation</th>
                                <th className="px-6 py-6 text-center">Scheduled Date</th>
                                <th className="px-10 py-6 text-right">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                            {approvedEvents.map((event) => (
                                <tr key={event._id} className="hover:bg-white/5 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 shadow-2xl ring-2 ring-slate-200 dark:ring-white/5 group-hover:ring-rose-500/30 transition-all">
                                                 <img
                                                     src={event.bannerImage ? formatImageUrl(event.bannerImage) : 'https://images.unsplash.com/photo-1492684225110-28f0e9a4c6b9?auto=format&fit=crop&q=80&w=2070'}
                                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                     alt=""
                                                 />

                                            </div>
                                            <div>
                                                <div className="font-black text-xl flex items-center gap-3 text-slate-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                                                    {event.eventName}
                                                    <Link to={`/event/${event._id}`} className="opacity-0 group-hover:opacity-100 transition-all">
                                                        <ExternalLink size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white" />
                                                    </Link>
                                                </div>
                                                <div className="text-xs text-slate-600 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                                                    <MapPin size={12} className="text-violet-500" /> {event.eventLocation}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <span className="bg-violet-500/10 text-violet-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-500/20 shadow-lg">
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <div className="text-sm font-black text-slate-700 dark:text-slate-300">
                                            {event.eventDate}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-4 shadow-3xl">
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-none hover:bg-rose-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-2xl transition-all duration-300 hover:rotate-3 shadow-xl"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {approvedEvents.length === 0 && (
                    <div className="py-32 text-center text-slate-600 font-black uppercase tracking-widest text-sm opacity-50">
                        End of manifest - No active records found
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
