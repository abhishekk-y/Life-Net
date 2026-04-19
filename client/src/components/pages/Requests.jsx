import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Search, Plus, Loader2, RefreshCw, X, AlertCircle, Clock, ShieldCheck, Truck,
  CheckCircle2, XCircle, ClipboardList, Calendar, Heart, Droplets,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ORGAN_TYPES = ["HEART", "LIVER", "KIDNEY", "LUNG", "PANCREAS", "INTESTINE", "CORNEA", "BONE_MARROW", "SKIN", "OTHER"];

const statusColors = {
  PENDING: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  MATCHED: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  APPROVED: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  IN_TRANSIT: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
  COMPLETED: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const urgencyColors = {
  EMERGENCY: "bg-red-600 text-white",
  URGENT: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
  ROUTINE: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

const statusIcons = {
  PENDING: Clock,
  MATCHED: ShieldCheck,
  APPROVED: CheckCircle2,
  IN_TRANSIT: Truck,
  COMPLETED: CheckCircle2,
  REJECTED: XCircle,
};

export function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: "BLOOD",
    urgency: "ROUTINE",
    resourceDetails: { bloodGroup: "O+", quantity: 1 },
    patientAge: 30,
    patientGender: "MALE",
    notes: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.requests.list();
      const items = data?.requests || data || [];
      setRequests(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action, label) => {
    try {
      setActionLoading(id);
      await api.requests[action](id);
      toast.success(`Request ${label} successfully`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.message || `Failed to ${label} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await api.requests.create(newRequest);
      toast.success("Request created successfully!");
      setShowCreateDialog(false);
      setNewRequest({ type: "BLOOD", urgency: "ROUTINE", resourceDetails: { bloodGroup: "O+", quantity: 1 }, patientAge: 30, patientGender: "MALE", notes: "" });
      fetchRequests();
    } catch (error) {
      toast.error(error.message || "Failed to create request");
    } finally {
      setCreateLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      (r._id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    inProgress: requests.filter((r) => ["MATCHED", "APPROVED", "IN_TRANSIT"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Requests</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage organ and blood requests</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchRequests} className="rounded-xl border-gray-300 dark:border-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: ClipboardList, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "In Progress", value: stats.inProgress, icon: Truck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search requests..." className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "MATCHED", "APPROVED", "IN_TRANSIT", "COMPLETED", "REJECTED"].map((s) => (
            <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm"
              className={`rounded-xl text-xs ${filterStatus === s ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 dark:border-gray-700"}`}
              onClick={() => setFilterStatus(s)}>
              {s === "ALL" ? "All" : s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {["ID", "Type", "Resource", "Urgency", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const StatusIcon = statusIcons[req.status] || Clock;
                    return (
                      <tr key={req._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono text-gray-900 dark:text-white">{req._id?.slice(-6).toUpperCase()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {req.type === "ORGAN" ? <Heart className="w-3.5 h-3.5 text-rose-500" /> : <Droplets className="w-3.5 h-3.5 text-blue-500" />}
                            <span className="text-sm text-gray-900 dark:text-white">{req.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {req.type === "ORGAN" ? req.resourceDetails?.organType?.replace(/_/g, " ") : `${req.resourceDetails?.bloodGroup} × ${req.resourceDetails?.quantity || 1}`}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`rounded-lg text-xs ${urgencyColors[req.urgency] || urgencyColors.ROUTINE}`}>
                            {req.urgency === "EMERGENCY" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {req.urgency}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`rounded-lg text-xs ${statusColors[req.status] || ""}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />{req.status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 h-8 px-2" onClick={() => setSelectedRequest(req)}>View</Button>
                            {req.status === "PENDING" && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2 text-xs rounded-lg" disabled={actionLoading === req._id}
                                onClick={() => handleAction(req._id, "approve", "approved")}>
                                {actionLoading === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Create New Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={newRequest.type} onChange={(e) => {
                    const type = e.target.value;
                    setNewRequest({ ...newRequest, type, resourceDetails: type === "ORGAN" ? { organType: "KIDNEY", bloodGroup: "O+" } : { bloodGroup: "O+", quantity: 1 } });
                  }}>
                  <option value="BLOOD">Blood</option>
                  <option value="ORGAN">Organ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={newRequest.urgency} onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </div>

            {newRequest.type === "BLOOD" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={newRequest.resourceDetails.bloodGroup} onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, bloodGroup: e.target.value } })}>
                    {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Units Needed</Label>
                  <Input type="number" min="1" className="rounded-xl" value={newRequest.resourceDetails.quantity || 1}
                    onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, quantity: parseInt(e.target.value) || 1 } })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organ Type</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={newRequest.resourceDetails.organType || "KIDNEY"} onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, organType: e.target.value } })}>
                    {ORGAN_TYPES.map((t) => (<option key={t} value={t}>{t.replace(/_/g, " ")}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={newRequest.resourceDetails.bloodGroup} onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, bloodGroup: e.target.value } })}>
                    {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Age</Label>
                <Input type="number" min="0" max="120" className="rounded-xl" value={newRequest.patientAge}
                  onChange={(e) => setNewRequest({ ...newRequest, patientAge: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={newRequest.patientGender} onChange={(e) => setNewRequest({ ...newRequest, patientGender: e.target.value })}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input className="rounded-xl" placeholder="Additional details..." value={newRequest.notes}
                onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                {createLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Request
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Detail Dialog with Workflow */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Request {selectedRequest?._id?.slice(-6).toUpperCase()}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-4">
              {/* Status workflow visualization */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {["PENDING", "MATCHED", "APPROVED", "IN_TRANSIT", "COMPLETED"].map((step, idx) => {
                  const StepIcon = statusIcons[step];
                  const isActive = step === selectedRequest.status;
                  const isPast = ["PENDING", "MATCHED", "APPROVED", "IN_TRANSIT", "COMPLETED"].indexOf(selectedRequest.status) >= idx;
                  return (
                    <div key={step} className="flex items-center gap-1">
                      {idx > 0 && <div className={`w-6 h-0.5 ${isPast ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`} />}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${isActive ? "bg-blue-600 text-white" : isPast ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                        <StepIcon className="w-3 h-3" />
                        {step.replace(/_/g, " ")}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Badge className={urgencyColors[selectedRequest.urgency] || ""}>{selectedRequest.urgency}</Badge>
                <Badge className={statusColors[selectedRequest.status] || ""}>{selectedRequest.status}</Badge>
                <Badge variant="outline">
                  {selectedRequest.type === "ORGAN" ? <Heart className="w-3 h-3 mr-1" /> : <Droplets className="w-3 h-3 mr-1" />}
                  {selectedRequest.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Resource</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.type === "ORGAN"
                      ? selectedRequest.resourceDetails?.organType?.replace(/_/g, " ")
                      : `${selectedRequest.resourceDetails?.bloodGroup} × ${selectedRequest.resourceDetails?.quantity || 1} units`}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Patient</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Age {selectedRequest.patientAge || "N/A"}, {selectedRequest.patientGender || "N/A"}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">Notes</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Created: {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>

              {/* Workflow Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 flex-wrap">
                {selectedRequest.status === "PENDING" && (
                  <>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl" disabled={actionLoading === selectedRequest._id}
                      onClick={() => handleAction(selectedRequest._id, "approve", "approved")}>
                      {actionLoading === selectedRequest._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      Approve
                    </Button>
                    <Button variant="outline" className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      disabled={actionLoading === selectedRequest._id}
                      onClick={() => handleAction(selectedRequest._id, "reject", "rejected")}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status === "APPROVED" && (
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700 rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "transfer", "marked in transit")}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                    Mark In Transit
                  </Button>
                )}
                {selectedRequest.status === "IN_TRANSIT" && (
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "complete", "completed")}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Mark Completed
                  </Button>
                )}
                {["COMPLETED", "REJECTED"].includes(selectedRequest.status) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">This request has been {selectedRequest.status.toLowerCase()}.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
