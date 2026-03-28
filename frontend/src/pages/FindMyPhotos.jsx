import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Camera, Upload, ArrowLeft, Search, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';


const FindMyPhotos = () => {
    const { eventId } = useParams();
    const [selfie, setSelfie] = useState(null);
    const [preview, setPreview] = useState(null);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelfie(file);
            setPreview(URL.createObjectURL(file));
            setResults([]);
            setError(null);
        }
    };

    const handleSearch = async () => {
        if (!selfie) return;
        setSearching(true);
        setError(null);
        setIsFallback(false);
        const formData = new FormData();
        formData.append('image', selfie);
        try {
            const { data } = await api.post(`/face-match/${eventId}`, formData);
            if (data.matches && data.matches.length > 0) {
                // Map matches to include the Confidence
                const matchedPhotos = data.matches.map(m => ({
                    ...m,
                    matchConfidence: m.similarity_score / 100,
                    isMatch: true
                }));
                setResults(matchedPhotos);
            } else {
                // Fallback: fetch all photos for this event
                setIsFallback(true);
                const { data: allPhotos } = await api.get(`/photos/event/${eventId}`);
                setResults(allPhotos.map(p => ({ ...p, isMatch: false })));
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to Event
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass bg-white/50 dark:bg-slate-900/40 p-8 space-y-6 sticky top-24">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Sparkles className="text-rose-500" /> Find Me
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Upload a selfie and our AI will find all photos you appear in.
                            </p>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`group relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                                preview ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileChange}
                                accept="image/*"
                            />

                            {preview ? (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                    <img src={preview} className="h-48 w-48 object-cover rounded-2xl mx-auto shadow-2xl border-4 border-white dark:border-slate-800" alt="Selfie preview" />
                                    <p className="text-xs text-rose-500 font-medium">Click to change photo</p>
                                </div>
                            ) : (
                                <div className="space-y-4 py-8">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform">
                                        <Camera size={28} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">Snap or Upload</p>
                                        <p className="text-xs text-slate-500">JPG, PNG supported</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={!selfie || searching}
                            className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 transition-all ${
                                searching ? 'opacity-80 cursor-wait' : ''
                            }`}
                        >
                            {searching ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Analyzing Faces...
                                </>
                            ) : (
                                <>
                                    <Search size={20} /> Search Gallery
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm text-center animate-in slide-in-from-top-2 duration-300">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-8">
                    {results.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {isFallback ? 'Gallery Photos' : 'Matched Photos'} 
                                    <span className="text-lg font-medium text-slate-500">({results.length})</span>
                                </h2>
                                {isFallback && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-500 text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-500">
                                        <Sparkles size={16} />
                                        No similar photos found. Showing all event photos.
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((photo, index) => (
                                    <div 
                                        key={photo._id} 
                                        className={`group relative overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 border-2 transition-all ${
                                            photo.isMatch ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-transparent glass'
                                        }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                         <img 
                                             src={formatImageUrl(photo.imageUrl)} 
                                             alt="Matched moment"

                                            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <div className="flex items-center justify-between">
                                                {photo.isMatch && (
                                                    <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                        Match Confidence: {Math.round(photo.matchConfidence * 100)}%
                                                    </span>
                                                )}
                                                 <a 
                                                     href={formatImageUrl(photo.imageUrl)} 
                                                     target="_blank" 
 
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-white"
                                                >
                                                    <ImageIcon size={20} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !searching && !error && (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                <ImageIcon size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Your moments await</h3>
                                <p className="max-w-xs mx-auto">Upload a selfie to instantly find your photos from the event.</p>
                            </div>
                        </div>
                    )}

                    {searching && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindMyPhotos;
