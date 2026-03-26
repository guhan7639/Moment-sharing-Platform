import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';

const PhotographerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState(null);
    const { user } = useAuth();
    const token = user?.token;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/events/photographer/approved-events', config);
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchEvents();
    }, [token]);

    const handleApply = async (eventId) => {
        setApplyingId(eventId);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post(`/events/${eventId}/apply`, {}, config);
            
            // Optimistically update the UI to show pending
            setEvents(events.map(event => {
                if (event._id === eventId) {
                    return {
                        ...event,
                        photographersApplied: [
                            ...(event.photographersApplied || []),
                            { photographer: user._id, status: 'Pending' }
                        ]
                    };
                }
                return event;
            }));
        } catch (error) {
            console.error('Error applying for event:', error);
            alert(error.response?.data?.message || 'Error applying for event');
        } finally {
            setApplyingId(null);
        }
    };

    const getApplicationStatus = (event) => {
        if (!event.photographersApplied) return null;
        
        // Use user._id or user.id depending on what the token provides
        const userId = user._id || user.id;

        const application = event.photographersApplied.find(
            app => {
                const appId = app.photographer._id || app.photographer;
                return appId === userId;
            }
        );
        return application ? application.status : null;
    };

    if (loading) return <div className="text-center p-8 text-violet-500 dark:text-violet-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">My Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Browse available events and apply to cover them.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => {
                    const status = getApplicationStatus(event);
                    const isBooked = event.bookedPhotographer;
                    
                    return (
                        <div key={event._id} className="glass card-hover rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 flex flex-col group relative">
                            {event.bannerImage ? (
                                <img src={`http://localhost:5000/${event.bannerImage}`} alt={event.eventName} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 flex items-center justify-center">
                                    <Calendar className="w-12 h-12 text-violet-500/50" />
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold leading-tight flex-1 text-slate-900 dark:text-white">{event.eventName}</h3>
                                    <span className="bg-violet-500/20 text-violet-300 text-xs px-3 py-1 rounded-full border border-violet-500/30 whitespace-nowrap ml-2">
                                        {event.category}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6 text-slate-600 dark:text-slate-300 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-violet-500 dark:text-violet-400 shrink-0" />
                                        <span className="text-sm truncate">{new Date(event.eventDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-violet-500 dark:text-violet-400 shrink-0" />
                                        <span className="text-sm truncate">{event.eventLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Host: {event.createdBy?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                                    {status === 'Pending' ? (
                                        <div className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            <Clock size={18} />
                                            Application Pending
                                        </div>
                                    ) : status === 'Booked' ? (
                                        <div className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <CheckCircle size={18} />
                                            Booked for Event
                                        </div>
                                    ) : status === 'Not Selected' ? (
                                        <div className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            <XCircle size={18} />
                                            Not Selected
                                        </div>
                                    ) : isBooked ? (
                                        <div className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-slate-800/80 text-slate-400 cursor-not-allowed">
                                            Event Closed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(event._id)}
                                            disabled={applyingId === event._id}
                                            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {applyingId === event._id ? 'Applying...' : 'Apply for Event'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {events.length === 0 && (
                    <div className="col-span-full py-16 text-center glass rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40">
                        <Calendar className="w-16 h-16 text-violet-500/50 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">No Available Events</h3>
                        <p className="text-slate-600 dark:text-slate-400">Check back later for new events posted by hosts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotographerDashboard;
