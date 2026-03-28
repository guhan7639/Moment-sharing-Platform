import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Upload, Image as ImageIcon, CheckCircle2, ArrowLeft, Clock, Grid, Share2, Download, Edit, Trash2, XCircle, Camera, Star, Briefcase, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import { formatImageUrl } from '../utils/imageUtils';


const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [photosCount, setPhotosCount] = useState(0);

    const [showQR, setShowQR] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [actionLoading, setActionLoading] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const [eventRes, photosRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/photos/event/${id}`)
                ]);
                setEvent(eventRes.data);
                setPhotos(photosRes.data);
                setPhotosCount(photosRes.data.length);

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.response?.status === 403 ? 'Unauthorized' : 'Not Found');
            }
        };
        fetchEventData();
    }, [id]);

    useEffect(() => {
        if (!event?.eventDate) return;

        const timer = setInterval(() => {
            const targetDate = new Date(event.eventDate).getTime();
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [event]);

    const downloadQR = () => {
        const svg = document.getElementById("QRCode-SVG");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${event.eventName}-QR`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    const handlePhotographerAction = async (photographerId, action) => {
        setActionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = action === 'select' ? 'select-photographer' : 'reject-photographer';
            const { data } = await api.patch(`/events/${id}/${endpoint}`, { photographerId }, config);
            
            // Reload event data to get updated structure
            const eventRes = await api.get(`/events/${id}`);
            setEvent(eventRes.data);
        } catch (err) {
            console.error('Error updating photographer:', err);
            alert(err.response?.data?.message || 'Error executing action');
        } finally {
            setActionLoading(false);
        }
    };

    if (error === 'Unauthorized') return (
        <div className="py-32 text-center space-y-6">
            <XCircle size={64} className="mx-auto text-rose-500 opacity-50" />
            <h2 className="text-3xl font-black italic">Access Restricted</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">You do not have authorization to view this secure event profile.</p>
            <Link to="/" className="btn-secondary inline-block py-3 px-8 rounded-2xl">Return to Manifest</Link>
        </div>
    );
    if (!event) return <div className="py-20 text-center text-rose-500 font-bold">Discovering Event Details...</div>;

    const isOwner = user && event.createdBy?._id === user._id;
    const isAdmin = user?.role === 'admin';
    const canManageSet = isOwner || isAdmin;

    const galleryLink = `${window.location.origin}/gallery/${id}`;

    return (
        <div className="space-y-8 pb-32">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 mb-2 transition-colors">
                <ArrowLeft size={18} /> Back to Discover
            </Link>

            {/* Premium Hero Banner */}
            <div className="relative h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl">
                <img
                    src={event.bannerImage ? `http://localhost:5000/${event.bannerImage}` : 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=2070'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt={event.eventName}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-rose-500/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                            {event.category}
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter leading-none">{event.eventName}</h1>
                        <div className="flex flex-wrap gap-6 text-slate-200">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <Calendar size={16} className="text-rose-400" />
                                <span className="font-bold">{event.eventDate}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <MapPin size={16} className="text-violet-400" />
                                <span className="font-bold">{event.eventLocation}</span>
                            </div>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bg-slate-950/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex gap-4 min-w-[320px] shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
                        {[
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hrs', value: timeLeft.hours },
                            { label: 'Min', value: timeLeft.minutes },
                            { label: 'Sec', value: timeLeft.seconds },
                        ].map((unit, idx) => (
                            <div key={idx} className="flex-1 text-center">
                                <div className="text-3xl font-black bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">{unit.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{unit.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Photographer Management Section (Host Only) */}
            {isOwner && (
                <div className="pt-8 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-violet-500 rounded-full" />
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Photographers</h2>
                    </div>

                    {event.bookedPhotographer ? (
                        <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl bg-emerald-500/5">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20"></div>
                                    <img 
                                        src={event.bookedPhotographer.profilePhoto ? formatImageUrl(event.bookedPhotographer.profilePhoto) : "https://ui-avatars.com/api/?name=" + event.bookedPhotographer.name + "&background=10b981&color=fff"} 
                                        alt={event.bookedPhotographer.name} 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 relative z-10"
                                    />

                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full relative z-10">
                                        <CheckCircle2 size={16} />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-emerald-500 text-sm font-bold tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-2">
                                        <Camera size={16} /> Official Event Photographer
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{event.bookedPhotographer.name}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                                        {event.bookedPhotographer.phone && (
                                            <span className="flex items-center gap-1"><Phone size={14} /> {event.bookedPhotographer.phone}</span>
                                        )}
                                        {event.bookedPhotographer.email && (
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {event.bookedPhotographer.email}</span>
                                        )}
                                        {event.bookedPhotographer.rating > 0 && (
                                            <span className="flex items-center gap-1 text-amber-500 font-bold"><Star size={14} fill="currentColor" /> {event.bookedPhotographer.rating}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {event.photographersApplied && event.photographersApplied.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {event.photographersApplied.filter(app => app.status === 'Pending').map((app) => (
                                        <div key={app.photographer._id} className="glass bg-white/50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col hover:border-violet-500/30 transition-colors group">
                                            <div className="flex items-start gap-4 mb-4">
                                                <img 
                                                    src={app.photographer.profilePhoto ? formatImageUrl(app.photographer.profilePhoto) : "https://ui-avatars.com/api/?name=" + app.photographer.name + "&background=8b5cf6&color=fff"} 
                                                    alt={app.photographer.name} 
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10 group-hover:border-violet-500 transition-colors"
                                                />

                                                <div className="flex-1">
                                                    <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{app.photographer.name}</h4>
                                                    {app.photographer.experience && (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                            <Briefcase size={12} /> {app.photographer.experience}
                                                        </span>
                                                    )}
                                                    {app.photographer.rating > 0 && (
                                                        <span className="text-xs text-amber-500 flex items-center gap-1 font-bold mt-1">
                                                            <Star size={12} fill="currentColor" /> {app.photographer.rating}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {app.photographer.portfolioPhotos && app.photographer.portfolioPhotos.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Portfolio Preview</div>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                        {app.photographer.portfolioPhotos.slice(0, 3).map((photoUrl, idx) => (
                                                            <img key={idx} src={formatImageUrl(photoUrl)} alt="Portfolio" className="w-16 h-16 rounded-xl object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />

                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-4 flex gap-2 border-t border-slate-200 dark:border-white/5">
                                                <button
                                                    onClick={() => handlePhotographerAction(app.photographer._id, 'select')}
                                                    disabled={actionLoading}
                                                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                                >
                                                    Select
                                                </button>
                                                <button
                                                    onClick={() => handlePhotographerAction(app.photographer._id, 'reject')}
                                                    disabled={actionLoading}
                                                    className="flex-[0.5] bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {event.photographersApplied.filter(app => app.status === 'Pending').length === 0 && (
                                        <div className="col-span-full py-8 text-center glass bg-white/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-white/5">
                                            <p className="text-slate-600 dark:text-slate-500 font-medium">All applications have been processed.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center glass bg-white/50 dark:bg-slate-900/40 py-12 rounded-3xl border border-slate-200 dark:border-white/5">
                                    <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-50" />
                                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-400">No Photographers Applied Yet</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-500">When photographers apply for your event, they will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">About the Event</h2>
                        </div>
                        <p className="text-xl text-slate-700 dark:text-slate-400 leading-relaxed font-medium">
                            {event.eventDescription}
                        </p>
                    </section>

                    {/* Gallery Preview Box */}
                    <section className="glass p-8 rounded-[2.5rem] border border-slate-200 dark:border-none shadow-2xl space-y-8 bg-white/50 dark:bg-slate-900/40">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Live Event Gallery</h2>
                                <p className="text-slate-600 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{photosCount} Photos Captured</p>
                            </div>
                            <div className="flex gap-3">
                                <Link to={`/find-my-photos/${id}`} className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2 bg-rose-500 hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20">
                                    <Sparkles size={18} /> Find Me
                                </Link>
                                <Link to={`/gallery/${id}`} className="btn-secondary py-3 px-8 rounded-2xl flex items-center gap-2">
                                    <Grid size={18} /> View All
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {photos.slice(0, 3).map((photo, idx) => (
                                <div key={photo._id || idx} className="aspect-square bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden">
                                    <img 
                                        src={formatImageUrl(photo.imageUrl)} 
                                        alt={`Event photo ${idx + 1}`} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {[...Array(Math.max(0, 3 - photos.length))].map((_, i) => (
                                <div key={`placeholder-${i}`} className="aspect-square bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-slate-800">
                                    <ImageIcon size={32} />
                                </div>
                            ))}

                            {canManageSet ? (
                                <div className="aspect-square bg-slate-200 dark:bg-white/10 rounded-3xl border border-slate-300 dark:border-white/20 flex flex-col items-center justify-center text-rose-500 group cursor-pointer hover:bg-rose-500/20 transition-all">
                                    <Link to={`/upload/${id}`} className="flex flex-col items-center">
                                        <Upload size={32} className="group-hover:translate-y-[-4px] transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-2">Add Yours</span>
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={() => alert('Admin will add the photos. Please check back later.')}
                                    className="aspect-square bg-slate-200 dark:bg-white/10 rounded-3xl border border-slate-300 dark:border-white/20 flex flex-col items-center justify-center text-rose-500 group cursor-pointer hover:bg-rose-500/20 transition-all">
                                    <div className="flex flex-col items-center">
                                        <Upload size={32} className="group-hover:translate-y-[-4px] transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-2">Add Yours</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Info & QR */}
                <div className="space-y-8">
                    <div className="glass p-8 rounded-[2.5rem] border border-slate-200 dark:border-none shadow-2xl flex flex-col items-center text-center space-y-6 bg-white/50 dark:bg-slate-900/40">
                        <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                            <Share2 size={24} className="text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Share with Guests</h3>
                            <p className="text-slate-600 dark:text-slate-500 text-sm mt-2">Anyone with this QR code can instantly access and download photos from your event gallery.</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-inner-xl group relative">
                            <QRCode id="QRCode-SVG" value={galleryLink} size={180} />
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl flex items-center justify-center">
                                <button onClick={downloadQR} className="bg-white text-slate-950 p-3 rounded-full hover:scale-110 transition-transform shadow-2xl">
                                    <Download size={24} />
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 tracking-widest uppercase">Scan to View Gallery</p>

                        <div className="w-full pt-4 border-t border-slate-200 dark:border-white/5">
                            <Link to={`/gallery/${id}`} className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3">
                                <Download size={20} /> Download Photos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
