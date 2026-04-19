import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Landing } from "./components/pages/Landing";
import { Dashboard } from "./components/pages/Dashboard";
import { Categories } from "./components/pages/Categories";
import { Organs } from "./components/pages/Organs";
import { Requests } from "./components/pages/Requests";
import { Centers } from "./components/pages/Centers";
import { BloodBank } from "./components/pages/BloodBank";
import { BloodManagement } from "./components/pages/BloodManagement";
import { Login } from "./components/pages/Login";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="organs" element={<Organs />} />
              <Route path="requests" element={<Requests />} />
              <Route path="centers" element={<Centers />} />
              <Route path="blood-bank" element={<BloodBank />} />
              <Route path="blood-management" element={<BloodManagement />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
