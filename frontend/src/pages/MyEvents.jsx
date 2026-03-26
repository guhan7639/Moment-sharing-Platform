import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Search, ChevronRight, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const { data } = await api.get('/events/my-events');
                if (data && Array.isArray(data)) {
                    setEvents(data);
                } else {
                    console.error('Events data is not an array:', data);
                }
            } catch (err) {
                console.error('Error fetching my events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    return (
        <div className="space-y-12 pb-20 mt-8">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Grid className="text-rose-500" size={32} />
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">My Events</h1>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
                    Manage and view the events you've created.
                </p>
            </div>

            {/* Events Grid */}
            <section className="space-y-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 glass animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.length > 0 ? events.map(event => (
                            <Link
                                key={event._id}
                                to={`/event/${event._id}`}
                                className="group glass p-2 hover:translate-y-[-8px] transition-all duration-500 overflow-hidden"
                            >
                                <div className="h-56 relative rounded-xl overflow-hidden">
                                    <img
                                        src={event.bannerImage ? `http://localhost:5000/${event.bannerImage}` : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={event.eventName}
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 border border-slate-200 dark:border-white/10">
                                            {event.category}
                                        </span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-100 dark:from-slate-950 to-transparent opacity-90 dark:opacity-60" />
                                </div>
                                <div className="p-6 space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                                        {event.eventName}
                                    </h3>
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-400">
                                                <Calendar size={14} />
                                            </div>
                                            {event.eventDate}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400">
                                                <MapPin size={14} />
                                            </div>
                                            {event.eventLocation}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-between items-center border-t border-slate-200 dark:border-white/5">
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">View Details</span>
                                        <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-rose-500 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-32 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 glass">
                                <Search size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">You haven't created any events yet.</p>
                                <Link to="/create-event" className="mt-4 inline-block text-rose-500 hover:underline font-bold">Create your first event</Link>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyEvents;
