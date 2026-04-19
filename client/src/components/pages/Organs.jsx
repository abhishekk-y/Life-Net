import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Search, Eye, X, Calendar, MapPin, User, Activity, Plus, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../AuthContext";

const ORGAN_TYPES = ['HEART', 'LIVER', 'KIDNEY', 'LUNG', 'PANCREAS', 'INTESTINE', 'CORNEA', 'BONE_MARROW', 'SKIN', 'OTHER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const statusColors = {
  AVAILABLE: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  RESERVED: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  TRANSPLANTED: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  EXPIRED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

export function Organs() {
  const { user } = useAuth();
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newOrgan, setNewOrgan] = useState({
    organType: "KIDNEY",
    bloodGroup: "O+",
    donorAge: 30,
    donorGender: "MALE",
    viabilityHours: 24,
    location: { city: "", state: "" },
    notes: "",
  });

  const fetchOrgans = async () => {
    try {
      setLoading(true);
      const data = await api.organs.list();
      const items = data?.organs || data || [];
      setOrgans(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to fetch organs:", error);
      toast.error("Failed to load organs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgans();
  }, []);

  const handleAddOrgan = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      await api.organs.create(newOrgan);
      toast.success("Organ registered successfully!");
      setShowAddDialog(false);
      setNewOrgan({ organType: "KIDNEY", bloodGroup: "O+", donorAge: 30, donorGender: "MALE", viabilityHours: 24, location: { city: "", state: "" }, notes: "" });
      fetchOrgans();
    } catch (error) {
      toast.error(error.message || "Failed to add organ");
    } finally {
      setAddLoading(false);
    }
  };

  const filteredOrgans = organs.filter(
    (organ) =>
      (organ.organType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (organ.bloodGroup || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (organ.location?.city || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getViabilityRemaining = (organ) => {
    if (!organ.harvestedAt || !organ.viabilityHours) return "N/A";
    const harvested = new Date(organ.harvestedAt);
    const expires = new Date(harvested.getTime() + organ.viabilityHours * 60 * 60 * 1000);
    const now = new Date();
    const hoursLeft = Math.max(0, (expires - now) / (1000 * 60 * 60));
    if (hoursLeft <= 0) return "Expired";
    if (hoursLeft < 1) return `${Math.round(hoursLeft * 60)} min`;
    return `${Math.round(hoursLeft)}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading organs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Organs Registry
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {organs.length} organs registered • {organs.filter(o => o.status === "AVAILABLE").length} available
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "PROCUREMENT_CENTER") && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Organ
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by type, blood group, or city..."
          className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Organs Table */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <CardContent className="p-0">
          {filteredOrgans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Blood Group</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor Age</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Viability</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgans.map((organ) => (
                    <tr
                      key={organ._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {organ.organType?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="rounded-lg font-mono">
                          {organ.bloodGroup}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                        {organ.donorAge || "N/A"} yrs
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                        {organ.viabilityHours}h window • {getViabilityRemaining(organ)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                        {organ.location?.city || "Unknown"}
                        {organ.location?.state ? `, ${organ.location.state}` : ""}
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={`rounded-lg ${statusColors[organ.status] || ""}`}>
                          {organ.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400"
                          onClick={() => setSelectedOrgan(organ)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No organs found.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Register a new organ to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Organ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Register New Organ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrgan} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organ Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={newOrgan.organType}
                  onChange={(e) => setNewOrgan({ ...newOrgan, organType: e.target.value })}
                >
                  {ORGAN_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={newOrgan.bloodGroup}
                  onChange={(e) => setNewOrgan({ ...newOrgan, bloodGroup: e.target.value })}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Donor Age</Label>
                <Input type="number" min="0" max="120" className="rounded-xl" value={newOrgan.donorAge} onChange={(e) => setNewOrgan({ ...newOrgan, donorAge: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" value={newOrgan.donorGender} onChange={(e) => setNewOrgan({ ...newOrgan, donorGender: e.target.value })}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Viability (hrs)</Label>
                <Input type="number" min="1" className="rounded-xl" value={newOrgan.viabilityHours} onChange={(e) => setNewOrgan({ ...newOrgan, viabilityHours: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input className="rounded-xl" placeholder="e.g. Mumbai" value={newOrgan.location.city} onChange={(e) => setNewOrgan({ ...newOrgan, location: { ...newOrgan.location, city: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input className="rounded-xl" placeholder="e.g. Maharashtra" value={newOrgan.location.state} onChange={(e) => setNewOrgan({ ...newOrgan, location: { ...newOrgan.location, state: e.target.value } })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input className="rounded-xl" placeholder="Any additional details..." value={newOrgan.notes} onChange={(e) => setNewOrgan({ ...newOrgan, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={addLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                {addLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Register Organ
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Organ Detail Dialog */}
      <Dialog open={!!selectedOrgan} onOpenChange={() => setSelectedOrgan(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>{selectedOrgan?.organType?.replace(/_/g, " ")} Details</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrgan(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedOrgan && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <Badge className={statusColors[selectedOrgan.status] || ""}>{selectedOrgan.status}</Badge>
                <Badge variant="outline" className="font-mono">{selectedOrgan.bloodGroup}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Viability Window</p>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">{selectedOrgan.viabilityHours}h</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{getViabilityRemaining(selectedOrgan)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Donor</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrgan.donorAge || "N/A"} yrs</p>
                  <p className="text-xs text-gray-500">{selectedOrgan.donorGender || "N/A"}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {selectedOrgan.location?.city || "Unknown"}{selectedOrgan.location?.state ? `, ${selectedOrgan.location.state}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(selectedOrgan.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {selectedOrgan.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-amber-50 dark:bg-amber-950 rounded-xl">
                  {selectedOrgan.notes}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
