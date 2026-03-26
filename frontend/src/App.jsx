import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import UploadPhoto from './pages/UploadPhoto';
import Gallery from './pages/Gallery';
import MyPhotos from './pages/MyPhotos';
import Profile from './pages/Profile';
import PhotographerLogin from './pages/PhotographerLogin';
import PhotographerRegister from './pages/PhotographerRegister';
import PhotographerDashboard from './pages/PhotographerDashboard';
import MyEvents from './pages/MyEvents';
import FindMyPhotos from './pages/FindMyPhotos';

const ProtectedRoute = ({ children, adminOnly = false, hostAllowed = false, photographerAllowed = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-8 text-center text-rose-500">Loading Session...</div>;
    if (!user) return <Navigate to="/login" />;
    
    // Check role constraints
    if (adminOnly && user.role !== 'admin') {
        // If it's host allowed, host passes
        if (hostAllowed && user.role === 'host') {
            return children;
        }
        return <Navigate to="/" />;
    }
    
    // Explicit photographer route checking
    if (photographerAllowed && user.role !== 'photographer') {
        return <Navigate to="/" />;
    }

    return children;
};

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-1 p-8 transition-all duration-300">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public / Auth (No Sidebar) */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/photographer-login" element={<PhotographerLogin />} />
                        <Route path="/photographer-register" element={<PhotographerRegister />} />

                        {/* Dashboard (With Sidebar) */}
                        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                        <Route path="/event/:id" element={<MainLayout><EventDetails /></MainLayout>} />
                        <Route path="/gallery/:eventId" element={<MainLayout><Gallery /></MainLayout>} />
                        <Route path="/upload/:eventId" element={
                            <ProtectedRoute adminOnly hostAllowed>
                                <MainLayout><UploadPhoto /></MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly>
                                <MainLayout><AdminDashboard /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/my-photos" element={
                            <ProtectedRoute adminOnly hostAllowed>
                                <MainLayout><MyPhotos /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/create-event" element={
                            <ProtectedRoute>
                                <MainLayout><CreateEvent /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/my-events" element={
                            <ProtectedRoute>
                                <MainLayout><MyEvents /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/photographer-dashboard" element={
                            <ProtectedRoute photographerAllowed>
                                <MainLayout><PhotographerDashboard /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <MainLayout><Profile /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/find-my-photos/:eventId" element={
                            <ProtectedRoute>
                                <MainLayout><FindMyPhotos /></MainLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
