import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Droplets, TrendingUp, X, Plus, Loader2, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodBank() {
  const { user } = useAuth();
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [newUnit, setNewUnit] = useState({
    bloodGroup: "O+",
    quantity: 450,
    collectedAt: new Date().toISOString().split("T")[0],
    expiryDate: "",
    storageTemp: 4,
    notes: "",
  });

  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      const data = await api.blood.list();
      const items = data?.bloodUnits || data || [];
      setBloodUnits(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to fetch blood units:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodUnits();
  }, []);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      const payload = { ...newUnit };
      if (!payload.expiryDate) {
        const d = new Date(payload.collectedAt || Date.now());
        d.setDate(d.getDate() + 42);
        payload.expiryDate = d.toISOString().split("T")[0];
      }
      await api.blood.create(payload);
      toast.success("Blood unit added successfully!");
      setShowAddDialog(false);
      setNewUnit({ bloodGroup: "O+", quantity: 450, collectedAt: new Date().toISOString().split("T")[0], expiryDate: "", storageTemp: 4, notes: "" });
      fetchBloodUnits();
    } catch (error) {
      toast.error(error.message || "Failed to add blood unit");
    } finally {
      setAddLoading(false);
    }
  };

  // Group by blood type for summary cards
  const bloodSummary = BLOOD_GROUPS.map((bg) => {
    const units = bloodUnits.filter((u) => u.bloodGroup === bg);
    const available = units.filter((u) => u.status === "AVAILABLE").length;
    const totalQty = units.reduce((sum, u) => sum + (u.quantity || 0), 0);
    const expiringSoon = units.filter((u) => {
      if (!u.expiryDate) return false;
      const daysLeft = (new Date(u.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft < 7;
    }).length;
    const status = units.length === 0 ? "Empty" : units.length < 3 ? "Critical" : units.length < 6 ? "Low" : units.length < 10 ? "Medium" : "Good";
    return { bloodGroup: bg, total: units.length, available, totalQty, expiringSoon, status, units };
  });

  const statusColor = (s) => {
    switch (s) {
      case "Critical": case "Empty": return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400";
      case "Low": return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400";
      case "Medium": return "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400";
      default: return "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400";
    }
  };

  const unitStatusColor = (s) => {
    switch (s) {
      case "AVAILABLE": return "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400";
      case "RESERVED": return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400";
      case "USED": return "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400";
      case "EXPIRED": return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading blood bank...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blood Bank</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {bloodUnits.length} total units • {bloodUnits.filter(u => u.status === "AVAILABLE").length} available
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchBloodUnits} className="rounded-xl border-gray-300 dark:border-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {(user?.role === "ADMIN" || user?.role === "BLOOD_BANK") && (
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Blood Unit
            </Button>
          )}
        </div>
      </div>

      {/* Blood Group Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloodSummary.map((item) => (
          <Card
            key={item.bloodGroup}
            className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => setSelectedBlood(item)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.bloodGroup}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.total} units</p>
                  </div>
                </div>
                <Badge className={`rounded-lg ${statusColor(item.status)}`}>{item.status}</Badge>
              </div>
              <Progress value={Math.min((item.total / 15) * 100, 100)} className="h-2 mb-3" />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{item.available} available</span>
                {item.expiringSoon > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {item.expiringSoon} expiring
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Blood Units Table */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Blood Units Inventory ({bloodUnits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bloodUnits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Blood Group</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collected</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expires</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Temp</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodUnits.slice(0, 20).map((unit) => {
                    const daysLeft = unit.expiryDate ? Math.round((new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <tr key={unit._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-lg text-xs font-mono font-bold">
                            <Droplets className="w-3 h-3" /> {unit.bloodGroup}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{unit.quantity} ml</td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {unit.collectedAt ? new Date(unit.collectedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span className={daysLeft !== null && daysLeft < 7 ? "text-amber-600 font-medium" : "text-gray-700 dark:text-gray-300"}>
                            {unit.expiryDate ? new Date(unit.expiryDate).toLocaleDateString() : "N/A"}
                            {daysLeft !== null && daysLeft < 7 && daysLeft > 0 && ` (${daysLeft}d)`}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{unit.storageTemp ?? 4}°C</td>
                        <td className="py-4 px-4">
                          <Badge className={`rounded-lg ${unitStatusColor(unit.status)}`}>{unit.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Droplets className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No blood units in inventory.</p>
              <p className="text-sm text-gray-400 mt-1">Add blood units to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Blood Unit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add Blood Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUnit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" value={newUnit.bloodGroup} onChange={(e) => setNewUnit({ ...newUnit, bloodGroup: e.target.value })}>
                  {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity (ml)</Label>
                <Input type="number" min="100" max="1000" className="rounded-xl" value={newUnit.quantity} onChange={(e) => setNewUnit({ ...newUnit, quantity: parseInt(e.target.value) || 0 })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collection Date</Label>
                <Input type="date" className="rounded-xl" value={newUnit.collectedAt} onChange={(e) => setNewUnit({ ...newUnit, collectedAt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Storage Temp (°C)</Label>
                <Input type="number" min="-20" max="10" className="rounded-xl" value={newUnit.storageTemp} onChange={(e) => setNewUnit({ ...newUnit, storageTemp: parseFloat(e.target.value) || 4 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input className="rounded-xl" placeholder="Optional notes..." value={newUnit.notes} onChange={(e) => setNewUnit({ ...newUnit, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={addLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                {addLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Unit
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Blood Group Detail Dialog */}
      <Dialog open={!!selectedBlood} onOpenChange={() => setSelectedBlood(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Blood Type {selectedBlood?.bloodGroup} Details</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBlood(null)} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
            </DialogTitle>
          </DialogHeader>
          {selectedBlood && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{selectedBlood.total}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Available</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{selectedBlood.available}</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Expiring</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{selectedBlood.expiringSoon}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Total volume: {selectedBlood.totalQty} ml</p>
              {selectedBlood.units.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedBlood.units.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <span>{u.quantity}ml • {u.collectedAt ? new Date(u.collectedAt).toLocaleDateString() : "N/A"}</span>
                      <Badge className={`text-[10px] ${unitStatusColor(u.status)}`}>{u.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
