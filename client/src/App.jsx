import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadUser } from './redux/authSlice';
import { fetchNotifications } from './redux/notificationSlice';
import { addNotification } from './redux/notificationSlice';
import { connectSocket, disconnectSocket, getSocket } from './socket';

import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OrgansPage from './pages/OrgansPage';
import BloodPage from './pages/BloodPage';
import RequestsPage from './pages/RequestsPage';
import EmergencyPage from './pages/EmergencyPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      const socket = connectSocket(token);

      // Fetch existing notifications
      dispatch(fetchNotifications());

      // Listen for real-time notifications
      socket.on('notification', (notification) => {
        dispatch(addNotification(notification));
        // Show toast for important notifications
        import('react-hot-toast').then(({ default: toast }) => {
          toast(notification.title, {
            icon: notification.type === 'EMERGENCY' ? '🚨' : '🔔',
            duration: 5000,
            style: {
              background: '#1a1f2e',
              color: '#f1f5f9',
              border: '1px solid #2a3042',
            },
          });
        });
      });

      // Listen for emergency broadcasts
      socket.on('emergency', (data) => {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error(data.message, {
            duration: 10000,
            style: {
              background: '#1a1f2e',
              color: '#fb7185',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              fontWeight: 600,
            },
          });
        });
      });

      return () => {
        socket.off('notification');
        socket.off('emergency');
        disconnectSocket();
      };
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1f2e',
            color: '#f1f5f9',
            border: '1px solid #2a3042',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected dashboard routes */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="organs" element={<OrgansPage />} />
          <Route path="blood" element={<BloodPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
