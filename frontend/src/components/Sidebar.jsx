import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    LayoutDashboard,
    PlusCircle,
    LogOut,
    Calendar,
    Image as ImageIcon,
    User as UserIcon,
    Search,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, children }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(to)
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{children}</span>
        </Link>
    );

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 glass rounded-none border-y-0 border-l-0 flex flex-col p-6 z-40">
            <div className="mb-10 text-center">
                <Link to="/" className="text-3xl font-black bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent italic">
                    Eventify
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink to="/" icon={Home}>Home</NavLink>

                {user && (
                    <>
                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            My Dashboard
                        </div>
                        {user.role === 'admin' && (
                            <>
                                <NavLink to="/admin" icon={LayoutDashboard}>Admin Hub</NavLink>
                                <NavLink to="/create-event" icon={PlusCircle}>New Event</NavLink>
                            </>
                        )}
                        <NavLink to="/my-photos" icon={ImageIcon}>My Photos</NavLink>
                    </>
                )}
            </nav>

            <div className="pt-6 border-t border-white/10 space-y-4">
                {user ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <UserIcon size={20} />
                            <span className="font-medium">Login</span>
                        </Link>
                        <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
