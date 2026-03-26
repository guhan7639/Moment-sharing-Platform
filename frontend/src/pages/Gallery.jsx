import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ImageIcon, Download, Share2, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Gallery = () => {
    const { eventId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    const canManageSet = user && (user.role === 'admin' || user.role === 'host' || (event && event.createdBy?._id === user._id));

    useEffect(() => {
        const fetchGalleryData = async () => {
            try {
                const [eventRes, photosRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    api.get(`/photos/event/${eventId}`)
                ]);
                setEvent(eventRes.data);
                setPhotos(photosRes.data);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGalleryData();
    }, [eventId]);

    if (loading) return <div className="py-32 text-center text-rose-500 font-bold animate-pulse">Loading Gallery...</div>;

    return (
        <div className="space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 mb-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Event
                    </Link>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <Grid className="text-violet-500" /> {event?.eventName} Gallery
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{photos.length} Captured Moments</p>
                </div>

                <div className="flex gap-4">
                    {canManageSet ? (
                        <Link to={`/upload/${eventId}`} className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2">
                            <ImageIcon size={18} /> Add Photos
                        </Link>
                    ) : (
                        <button onClick={() => alert('Admin will add the photos. Please check back later.')} className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2">
                            <ImageIcon size={18} /> Add Photos
                        </button>
                    )}
                </div>
            </div>

            {photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {photos.map((photo, index) => (
                        <div
                            key={photo._id}
                            className="group relative glass bg-white/50 dark:bg-slate-900/40 aspect-[4/5] overflow-hidden rounded-3xl hover:translate-y-[-8px] transition-all duration-500 shadow-xl border border-slate-200 dark:border-white/10"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <img
                                src={`http://localhost:5000/${photo.imageUrl}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt=""
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex justify-end gap-2">
                                <button 
                                    onClick={() => {
                                        fetch(`http://localhost:5000/${photo.imageUrl}`)
                                            .then(response => response.blob())
                                            .then(blob => {
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.style.display = 'none';
                                                a.href = url;
                                                // Extract filename from the URL
                                                const filename = photo.imageUrl.split('/').pop() || 'photo.jpg';
                                                a.download = filename;
                                                document.body.appendChild(a);
                                                a.click();
                                                window.URL.revokeObjectURL(url);
                                            })
                                            .catch(() => alert('Failed to download image.'));
                                    }}
                                    className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-rose-500 transition-colors shadow-lg"
                                >
                                    <Download size={18} />
                                </button>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`http://localhost:5173/gallery/${eventId}`);
                                        alert('Gallery link copied to clipboard!');
                                    }}
                                    className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-violet-500 transition-colors shadow-lg"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center glass bg-white/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-6">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600">
                        <ImageIcon size={40} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-500 text-xl font-bold">No photos uploaded to this gallery yet.</p>
                    {canManageSet ? (
                        <Link to={`/upload/${eventId}`} className="btn-primary inline-flex items-center gap-2 py-4 px-10 rounded-2xl">
                            Be the First to Upload
                        </Link>
                    ) : (
                        <button onClick={() => alert('Admin will add the photos. Please check back later.')} className="btn-primary inline-flex items-center gap-2 py-4 px-10 rounded-2xl">
                            Be the First to Upload
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Gallery;
