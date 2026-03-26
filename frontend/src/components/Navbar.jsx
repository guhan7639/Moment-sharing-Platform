import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, PlusCircle, LayoutDashboard, User, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 glass border-none rounded-none bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent italic shrink-0">
                    Eventify
                </Link>

                <div className="hidden md:flex flex-1 max-w-md mx-8 relative items-center group">
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                    <Search className="absolute left-3 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={16} />
                </div>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    <Link to="/" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-2 font-medium">
                        Home
                    </Link>

                    {user ? (
                        <>
                            {(user.role === 'admin' || user.role === 'host') && (
                                <Link to="/my-photos" className="hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium">
                                    My Photos
                                </Link>
                            )}

                            <Link to="/my-events" className="hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium">
                                <Calendar size={18} /> My Events
                            </Link>
                            
                            {user.role === 'photographer' && (
                                <Link to="/photographer-dashboard" className="hover:text-violet-400 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <LayoutDashboard size={18} /> My Dashboard
                                </Link>
                            )}

                            {user.role !== 'photographer' && (
                                <Link to="/create-event" className="hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <PlusCircle size={18} /> Create
                                </Link>
                            )}

                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-2">
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                </>
                            )}
                            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 mx-2" />
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform" title="View Profile">
                                    {user.name.charAt(0).toUpperCase()}
                                </Link>
                                <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 p-2 rounded-full transition-all group ms-2"
                                    title="Logout"
                                >
                                    <LogOut size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-rose-500" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link to="/photographer-login" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-2 font-medium">
                                Photographer
                            </Link>
                            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden md:block" />
                            <Link to="/login" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Login</Link>
                            <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
