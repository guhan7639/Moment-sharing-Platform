import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Tag, Search, Filter, ChevronRight, Sparkles, CalendarPlus, QrCode, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'College', 'Other'];

const Home = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                if (data && Array.isArray(data)) {
                    setEvents(data);
                    setFilteredEvents(data);
                } else {
                    console.error('Events data is not an array:', data);
                }
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        let result = events;
        if (searchTerm) {
            result = result.filter(e =>
                e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.eventLocation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== 'All') {
            result = result.filter(e => e.category === selectedCategory);
        }
        setFilteredEvents(result);
    }, [searchTerm, selectedCategory, events]);

    return (
        <div className="space-y-24 pb-20">
            {/* HERO SECTION */}
            <section className="relative min-h-[85vh] rounded-[2.5rem] overflow-hidden glass border-none flex items-center justify-start px-8 lg:px-24 group mt-4">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2670"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    alt="Elegant Wedding Ceremony"
                />
                <div className="relative z-20 max-w-3xl space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-[#361321]/60 text-[#ecc2ce] px-5 py-2.5 rounded-full text-sm font-medium border border-[#bc3d71]/40 backdrop-blur-md">
                        <Sparkles size={16} className="text-[#f18e6e]" />
                        Your Wedding, perfectly captured
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1] text-white font-serif tracking-tight">
                        Experience the <br />
                        Magic of <span className="text-[#f18e6e]">Moments</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                        The ultimate wedding photo sharing platform where every guest becomes a photographer, and every memory is instantly shared.
                    </p>
                    
                    {!user && (
                        <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-[#de358c] text-white rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(222,53,140,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-transparent backdrop-blur-sm text-white border border-white/20 hover:bg-white/10 rounded-xl font-bold text-lg hover:-translate-y-0.5 transition-all duration-300">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="container mx-auto px-6 py-12 text-center max-w-4xl">
                <h2 className="text-sm font-bold tracking-widest uppercase text-rose-500 dark:text-rose-400 mb-4">About Moments</h2>
                <p className="text-3xl md:text-4xl text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                    A beautiful, seamless way to collect and share every precious memory from your wedding day. We bring all your guests' perspectives together in one elegant, unified gallery.
                </p>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="container mx-auto px-6 py-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">How It Works</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        “Capturing wedding memories shouldn't be complicated. We make it instant and automatic.”
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {/* Step 1 */}
                    <div className="glass p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-rose-400 dark:hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2 group bg-white/50 dark:bg-slate-900/40">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <CalendarPlus size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">Create Event 📅</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Organizers create a wedding event and receive a unique QR code for their venue.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="glass p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-violet-400 dark:hover:border-violet-500/30 transition-all duration-500 hover:-translate-y-2 group bg-white/50 dark:bg-slate-900/40">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 dark:text-violet-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <QrCode size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">Instant Gallery ✨</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Guests scan the QR code to upload photos instantly, and all photos appear in the event gallery in real time.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="glass p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/30 transition-all duration-500 hover:-translate-y-2 group bg-white/50 dark:bg-slate-900/40">
                        <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <Camera size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">High-Def Memories 📸</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Every “Moment” is preserved in stunning high resolution, ensuring your big day looks perfect forever.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            {(user?.role === 'admin' || user?.role === 'host') && (
                <div className="glass p-4 sticky top-6 z-30 flex flex-col md:flex-row gap-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex-1 relative group flex items-center">
                        <input
                            type="text"
                            placeholder="Search events by name or location..."
                            className="input-field w-full pl-14 pr-4 h-12 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        <Filter size={20} className="text-slate-500 shrink-0 mx-2" />
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${selectedCategory === cat
                                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30'
                                    : 'bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default Home;
