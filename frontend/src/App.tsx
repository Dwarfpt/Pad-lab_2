import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from 'react-error-boundary';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import AboutUs from './pages/public/AboutUs';
import ContactUs from './pages/public/ContactUs';
import Tariffs from './pages/public/Tariffs';
import ParkingSlots from './pages/public/ParkingSlots';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Checkout from './pages/public/Checkout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// User Pages
import Profile from './pages/user/Profile';

// Debug Components
import AuthDebug from './components/debug/AuthDebug';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Parkings from './pages/admin/Parkings';
import TariffsManagement from './pages/admin/TariffsManagement';
import BlogManagement from './pages/admin/BlogManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import AdminSettings from './pages/admin/AdminSettings';
import SupportChat from './pages/admin/SupportChat';

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated && (user?.role === 'admin' || user?.role === 'super-admin') ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Что-то пошло не так</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/tariffs" element={<Tariffs />} />
              <Route path="/parking-slots" element={<ParkingSlots />} />
              <Route path="/parking" element={<Navigate to="/parking-slots" replace />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* User Routes - Protected */}
            <Route element={<PublicLayout />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="parkings" element={<Parkings />} />
              <Route path="tariffs" element={<TariffsManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="support" element={<SupportChat />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-right" />
        <AuthDebug />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
