import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Upload, ImageIcon, CheckCircle, ArrowLeft, X } from 'lucide-react';

const UploadPhoto = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (selectedFiles) => {
        const validFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        } else {
            alert('Please select valid image files.');
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        handleFiles(droppedFiles);
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => {
             formData.append('photos', file);
        });

        try {
            await api.post(`/photos/upload-bulk/${eventId}`, formData);
            navigate(`/gallery/${eventId}`);
        } catch (err) {
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to Event
            </Link>

            <div className="glass bg-white/50 dark:bg-slate-900/40 p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Upload Photo</h1>
                    <p className="text-slate-600 dark:text-slate-400">Share your favorite moments with others</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${isDragging
                            ? 'border-rose-500 bg-rose-500/10 scale-105'
                            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFiles(e.target.files)}
                            accept="image/*"
                            multiple
                        />

                        {previews.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative inline-block">
                                        <img src={preview} className="h-32 w-full object-cover rounded-2xl mx-auto shadow-xl" alt={`Preview ${index}`} />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const newFiles = [...files];
                                                newFiles.splice(index, 1);
                                                setFiles(newFiles);
                                                
                                                const newPreviews = [...previews];
                                                URL.revokeObjectURL(newPreviews[index]);
                                                newPreviews.splice(index, 1);
                                                setPreviews(newPreviews);
                                            }}
                                            className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-1 rounded-full hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white hover:border-transparent shadow-lg transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600 mb-4">
                                    <Upload size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-300">Drag & drop your photo here</p>
                                    <p className="text-slate-600 dark:text-slate-500">or click to browse from your device</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={files.length === 0 || uploading}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        {uploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} /> Publish Photo
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPhoto;
