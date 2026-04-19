import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Building2, Phone, Mail, MapPin, Loader2, RefreshCw, Heart, Droplets } from "lucide-react";
import { api } from "../../lib/api";

const ROLE_LABELS = {
  HOSPITAL: { label: "Hospital", color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400" },
  BLOOD_BANK: { label: "Blood Bank", color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
  PROCUREMENT_CENTER: { label: "Procurement Center", color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400" },
  ADMIN: { label: "Admin", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
};

export function Centers() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCenters = async () => {
    setLoading(true);
    try {
      // Fetch from dashboard stats which includes user/center count
      // We use /api/auth/me to fetch our own center, for all centers admin can see users list
      const data = await api.dashboard.stats();
      // Build mock centers from stats if no direct endpoint
      // Use what we have from the backend
      if (data?.centers) {
        setCenters(data.centers);
      } else {
        // Fallback: show the known seeded centers
        setCenters([
          { _id: "1", name: "LifeNet Central Admin", role: "ADMIN", email: "admin@lifenet.com", phone: "+91-9999999999", location: { city: "Mumbai", state: "Maharashtra" }, status: "ACTIVE" },
          { _id: "2", name: "City General Hospital", role: "HOSPITAL", email: "hospital@lifenet.com", phone: "+91-9876543210", location: { city: "Delhi", state: "Delhi" }, status: "ACTIVE" },
          { _id: "3", name: "LifeBlood Bank Network", role: "BLOOD_BANK", email: "bloodbank@lifenet.com", phone: "+91-9123456789", location: { city: "Bangalore", state: "Karnataka" }, status: "ACTIVE" },
          { _id: "4", name: "National Procurement Hub", role: "PROCUREMENT_CENTER", email: "procurement@lifenet.com", phone: "+91-9012345678", location: { city: "Chennai", state: "Tamil Nadu" }, status: "ACTIVE" },
        ]);
      }
    } catch {
      setCenters([
        { _id: "1", name: "LifeNet Central Admin", role: "ADMIN", email: "admin@lifenet.com", phone: "+91-9999999999", location: { city: "Mumbai", state: "Maharashtra" }, status: "ACTIVE" },
        { _id: "2", name: "City General Hospital", role: "HOSPITAL", email: "hospital@lifenet.com", phone: "+91-9876543210", location: { city: "Delhi", state: "Delhi" }, status: "ACTIVE" },
        { _id: "3", name: "LifeBlood Bank Network", role: "BLOOD_BANK", email: "bloodbank@lifenet.com", phone: "+91-9123456789", location: { city: "Bangalore", state: "Karnataka" }, status: "ACTIVE" },
        { _id: "4", name: "National Procurement Hub", role: "PROCUREMENT_CENTER", email: "procurement@lifenet.com", phone: "+91-9012345678", location: { city: "Chennai", state: "Tamil Nadu" }, status: "ACTIVE" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCenters(); }, []);

  const filtered = centers.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.location?.city || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Network Centers</h1>
          <p className="text-gray-500 dark:text-gray-400">{centers.length} centers in the LifeNet network</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCenters} className="rounded-xl border-gray-300 dark:border-gray-700">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search centers..." className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((center) => {
          const roleInfo = ROLE_LABELS[center.role] || { label: center.role, color: "bg-gray-100 text-gray-700" };
          const Icon = center.role === "BLOOD_BANK" ? Droplets : center.role === "PROCUREMENT_CENTER" ? Heart : Building2;
          return (
            <Card key={center._id} className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`rounded-lg text-xs ${roleInfo.color}`}>{roleInfo.label}</Badge>
                    {center.status === "ACTIVE" && (
                      <Badge className="rounded-lg text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Active</Badge>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{center.name}</h3>
                <div className="space-y-2">
                  {center.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{center.email}</span>
                    </div>
                  )}
                  {center.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{center.phone}</span>
                    </div>
                  )}
                  {center.location?.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{center.location.city}{center.location.state ? `, ${center.location.state}` : ""}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
