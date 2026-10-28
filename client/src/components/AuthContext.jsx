import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        if (!localStorage.getItem('accessToken')) {
          const refreshed = await api.auth.refresh();
          if (refreshed?.accessToken) localStorage.setItem('accessToken', refreshed.accessToken);
        }
        if (localStorage.getItem('accessToken')) {
          const currentUser = await api.auth.me();
          if (active) setUser(currentUser);
        }
      } catch {
        localStorage.removeItem('accessToken');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const handleUnauthorized = () => {
      if (active) setUser(null);
    };

    window.addEventListener('lifenet:unauthorized', handleUnauthorized);
    restoreSession();

    return () => {
      active = false;
      window.removeEventListener('lifenet:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return undefined;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return undefined;

    const socket = connectSocket(token);
    const handleNotification = (notification) => {
      if (notification?.title) {
        toast.info(notification.title, { description: notification.message });
      }
    };
    const handleTokenRefreshed = (event) => connectSocket(event.detail);

    socket.on('notification', handleNotification);
    window.addEventListener('lifenet:token-refreshed', handleTokenRefreshed);
    return () => {
      socket.off('notification', handleNotification);
      window.removeEventListener('lifenet:token-refreshed', handleTokenRefreshed);
    };
  }, [user]);

  const login = async (email, password) => {
    const result = await api.auth.login({ email, password });
    localStorage.setItem('accessToken', result.accessToken);
    setUser(result.user);
    setIsLoading(false);
    return result.user;
  };

  const register = (data) => api.auth.register(data);

  const updateProfile = async (data) => {
    const updatedUser = await api.auth.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Local sign-out still succeeds when the API is unavailable.
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
