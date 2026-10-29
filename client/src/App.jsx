import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./components/AuthContext";
import { Loader2 } from "lucide-react";

const lazyPage = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const Landing = lazyPage(() => import("./components/pages/Landing"), "Landing");
const Dashboard = lazyPage(() => import("./components/pages/Dashboard"), "Dashboard");
const Categories = lazyPage(() => import("./components/pages/Categories"), "Categories");
const Organs = lazyPage(() => import("./components/pages/Organs"), "Organs");
const Requests = lazyPage(() => import("./components/pages/Requests"), "Requests");
const Centers = lazyPage(() => import("./components/pages/Centers"), "Centers");
const BloodBank = lazyPage(() => import("./components/pages/BloodBank"), "BloodBank");
const BloodManagement = lazyPage(() => import("./components/pages/BloodManagement"), "BloodManagement");
const Login = lazyPage(() => import("./components/pages/Login"), "Login");
const Register = lazyPage(() => import("./components/pages/Register"), "Register");
const Doctors = lazyPage(() => import("./components/pages/Doctors"), "Doctors");
const Hospitals = lazyPage(() => import("./components/pages/Hospitals"), "Hospitals");
const Appointments = lazyPage(() => import("./components/pages/Appointments"), "Appointments");
const Pharmacy = lazyPage(() => import("./components/pages/Pharmacy"), "Pharmacy");
const PharmacyOrders = lazyPage(() => import("./components/pages/PharmacyOrders"), "PharmacyOrders");
const Supplies = lazyPage(() => import("./components/pages/Supplies"), "Supplies");
const SupplyOrders = lazyPage(() => import("./components/pages/SupplyOrders"), "SupplyOrders");
const Notifications = lazyPage(() => import("./components/pages/Notifications"), "Notifications");
const Analytics = lazyPage(() => import("./components/pages/Analytics"), "Analytics");
const Settings = lazyPage(() => import("./components/pages/Settings"), "Settings");
const PasswordReset = lazyPage(() => import("./components/pages/PasswordReset"), "PasswordReset");
const VerifyEmail = lazyPage(() => import("./components/pages/VerifyEmail"), "VerifyEmail");
const CareServices = lazyPage(() => import("./components/pages/CareServices"), "CareServices");

function RoleGate({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-gray-50 text-sm text-gray-600 dark:bg-gray-950 dark:text-gray-300" role="status"><span className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin" /> Loading LifeNet</span></div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="care-services" element={<CareServices />} />
              <Route path="analytics" element={<RoleGate roles={["ADMIN"]}><Analytics /></RoleGate>} />
              <Route path="categories" element={<Categories />} />
              <Route path="organs" element={<RoleGate roles={["ADMIN", "HOSPITAL", "PROCUREMENT_CENTER"]}><Organs /></RoleGate>} />
              <Route path="requests" element={<RoleGate roles={["ADMIN", "HOSPITAL", "BLOOD_BANK", "PROCUREMENT_CENTER"]}><Requests /></RoleGate>} />
              <Route path="centers" element={<RoleGate roles={["ADMIN", "HOSPITAL", "BLOOD_BANK", "PROCUREMENT_CENTER"]}><Centers /></RoleGate>} />
              <Route path="blood-bank" element={<RoleGate roles={["ADMIN", "HOSPITAL", "BLOOD_BANK", "PATIENT"]}><BloodBank /></RoleGate>} />
              <Route path="blood-management" element={<RoleGate roles={["ADMIN", "BLOOD_BANK"]}><BloodManagement /></RoleGate>} />
              <Route path="doctors" element={<RoleGate roles={["ADMIN", "PATIENT", "DOCTOR"]}><Doctors /></RoleGate>} />
              <Route path="hospitals" element={<RoleGate roles={["ADMIN", "PATIENT", "DOCTOR", "HOSPITAL", "PHARMACY", "SUPPLIER", "BLOOD_BANK", "PROCUREMENT_CENTER"]}><Hospitals /></RoleGate>} />
              <Route path="appointments" element={<RoleGate roles={["ADMIN", "PATIENT", "DOCTOR"]}><Appointments /></RoleGate>} />
              <Route path="pharmacy" element={<RoleGate roles={["ADMIN", "PATIENT", "PHARMACY"]}><Pharmacy /></RoleGate>} />
              <Route path="pharmacy-orders" element={<RoleGate roles={["ADMIN", "PATIENT", "PHARMACY"]}><PharmacyOrders /></RoleGate>} />
              <Route path="supplies" element={<RoleGate roles={["ADMIN", "HOSPITAL", "PHARMACY", "BLOOD_BANK", "PROCUREMENT_CENTER", "SUPPLIER"]}><Supplies /></RoleGate>} />
              <Route path="supply-orders" element={<RoleGate roles={["ADMIN", "HOSPITAL", "PHARMACY", "BLOOD_BANK", "PROCUREMENT_CENTER", "SUPPLIER"]}><SupplyOrders /></RoleGate>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
