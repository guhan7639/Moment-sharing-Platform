import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Grid, AlertCircle, ChevronRight, Search } from 'lucide-react';

const MyPhotos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated or not an admin/host
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin' && user.role !== 'host') {
            navigate('/');
            return;
        }

        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [user, navigate]);

    if (loading) return <div className="py-32 text-center text-rose-500 font-bold animate-pulse">Loading Events...</div>;

    return (
        <div className="space-y-8 pb-32">
            <div className="space-y-2">
                <h1 className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                    <Grid className="text-rose-500" /> My Photos (Host View)
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Manage photo galleries for all events.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.length > 0 ? events.map(event => (
                    <div key={event._id} className="group glass bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 p-2 hover:translate-y-[-8px] transition-all duration-500 overflow-hidden flex flex-col shadow-xl">
                        <div className="h-48 relative rounded-xl overflow-hidden shrink-0">
                            <img
                                src={event.bannerImage ? `http://localhost:5000/${event.bannerImage}` : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={event.eventName}
                            />
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                    By: {event.createdBy?.name || 'Unknown User'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{event.eventName}</h3>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-violet-400" />
                                        {event.eventDate}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-rose-400" />
                                        {event.eventLocation}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/gallery/${event._id}`} className="btn-primary py-2 px-4 text-sm flex-1 text-center rounded-xl">
                                    View Gallery
                                </Link>
                                <Link to={`/upload/${event._id}`} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-2 px-4 text-sm rounded-xl transition-colors text-center border border-slate-300 dark:border-white/10 flex items-center justify-center">
                                    Upload Photos
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 glass">
                        <AlertCircle size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">No events found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPhotos;
