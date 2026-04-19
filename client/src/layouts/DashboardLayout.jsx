import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  LayoutDashboard, Heart, Droplets, FileText, Bell,
  LogOut, Menu, X, Activity, Shield, ChevronDown,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/organs', label: 'Organs', icon: Heart },
  { path: '/blood', label: 'Blood Bank', icon: Droplets },
  { path: '/requests', label: 'Requests', icon: FileText },
  { path: '/emergency', label: 'Emergency', icon: Activity },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const roleBadgeColor = {
    ADMIN: 'badge-danger',
    HOSPITAL: 'badge-info',
    BLOOD_BANK: 'badge-success',
    PROCUREMENT_CENTER: 'badge-purple',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-30 h-full transition-all duration-300 ease-in-out bg-bg-secondary border-r border-border flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold gradient-text">LifeNet</h1>
              <p className="text-[10px] text-text-muted tracking-widest uppercase">Healthcare Platform</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-accent/15 text-accent-hover border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }
                ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {item.path === '/emergency' && sidebarOpen && (
                <span className="ml-auto w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-bg-primary/50 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue to-purple flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || '?'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <span className={`badge text-[10px] ${roleBadgeColor[user?.role] || 'badge-info'}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-bg-secondary/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-text-secondary hover:text-text-primary"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Sidebar collapse toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
              </h2>
              <p className="text-xs text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
