import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Grid3x3,
  Heart,
  ClipboardList,
  Building2,
  Hospital,
  Droplets,
  BarChart3,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  User,
  Stethoscope,
  CalendarDays,
  Pill,
  PackageCheck,
  Truck,
  Bell,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings", label: "Account security", icon: Settings },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN"] },
  { path: "/requests", label: "Requests", icon: ClipboardList, roles: ["ADMIN", "HOSPITAL", "BLOOD_BANK", "PROCUREMENT_CENTER"] },
  { path: "/organs", label: "Organ registry", icon: Heart, roles: ["ADMIN", "HOSPITAL", "PROCUREMENT_CENTER"] },
  { path: "/categories", label: "Organ guide", icon: Grid3x3, roles: ["ADMIN", "HOSPITAL", "PROCUREMENT_CENTER"] },
  { path: "/blood-bank", label: "Blood inventory", patientLabel: "Blood availability", icon: Droplets, roles: ["ADMIN", "HOSPITAL", "BLOOD_BANK", "PATIENT"] },
  { path: "/blood-management", label: "Blood overview", icon: BarChart3, roles: ["ADMIN", "BLOOD_BANK"] },
  { path: "/centers", label: "Partners & verification", icon: Building2, roles: ["ADMIN", "HOSPITAL", "BLOOD_BANK", "PROCUREMENT_CENTER"] },
  { path: "/doctors", label: "Doctor directory", icon: Stethoscope, roles: ["ADMIN", "PATIENT", "DOCTOR"] },
  { path: "/hospitals", label: "Hospital directory", icon: Hospital, roles: ["ADMIN", "PATIENT", "DOCTOR", "HOSPITAL", "PHARMACY", "SUPPLIER", "BLOOD_BANK", "PROCUREMENT_CENTER"] },
  { path: "/appointments", label: "Appointments", icon: CalendarDays, roles: ["ADMIN", "PATIENT", "DOCTOR"] },
  { path: "/pharmacy", label: "Medicine prices", icon: Pill, roles: ["ADMIN", "PATIENT", "PHARMACY"] },
  { path: "/pharmacy-orders", label: "Pickup orders", icon: PackageCheck, roles: ["ADMIN", "PATIENT", "PHARMACY"] },
  { path: "/supplies", label: "Healthcare supplies", icon: Truck, roles: ["ADMIN", "HOSPITAL", "PHARMACY", "BLOOD_BANK", "PROCUREMENT_CENTER", "SUPPLIER"] },
  { path: "/supply-orders", label: "Supply requests", icon: PackageCheck, roles: ["ADMIN", "HOSPITAL", "PHARMACY", "BLOOD_BANK", "PROCUREMENT_CENTER", "SUPPLIER"] },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("You are signed out.");
    navigate("/login");
  };

  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 lg:flex-row">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 dark:bg-gray-900 dark:text-white">
        Skip to main content
      </a>
      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">LifeNet</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Organ & Blood Network
            </p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{user?.role === "PATIENT" ? (item.patientLabel || item.label) : item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {user && (
            <div className="px-4 py-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors w-full"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <h1 className="text-gray-900 dark:text-white">LifeNet</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Main navigation" className="space-y-1 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{user?.role === "PATIENT" ? (item.patientLabel || item.label) : item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="min-w-0 flex-1 overflow-auto scroll-smooth">
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-9">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
