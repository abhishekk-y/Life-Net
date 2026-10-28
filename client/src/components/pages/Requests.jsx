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
const BLOOD_COMPONENTS = ["WHOLE_BLOOD", "PACKED_RBC", "PLATELETS", "PLASMA", "CRYOPRECIPITATE"];
const ORGAN_TYPES = ["HEART", "LIVER", "KIDNEY", "LUNG", "PANCREAS", "INTESTINE", "CORNEA", "BONE_MARROW", "SKIN", "OTHER"];

const statusColors = {
  PENDING: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  MATCHED: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  APPROVED: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  IN_TRANSIT: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
  COMPLETED: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
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
  CANCELLED: XCircle,
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
  const [candidateResults, setCandidateResults] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: "BLOOD",
    urgency: "ROUTINE",
    resourceDetails: { bloodGroup: "O+", component: "PACKED_RBC", quantity: 1 },
    notes: "",
  });

  const fetchRequests = async () => {
    try {

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
      const updated = await api.requests[action](id);
      toast.success(`Request ${label}.`);
      setSelectedRequest((current) => current?._id === id ? { ...current, ...updated } : current);
      await fetchRequests();
    } catch (error) {
      toast.error(error.message || `Failed to ${label} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFindInventory = async (request) => {
    try {
      setActionLoading(request._id);
      const result = await api.requests.match(request._id);
      setSelectedRequest(request);
      setCandidateResults({ requestId: request._id, ...result });
      if (!result?.candidates?.length) toast.info(result?.alreadyMatched ? 'A center has already assigned inventory.' : 'No matching reported inventory is available right now.');
    } catch (error) {
      toast.error(error.message || 'Could not check reported inventory.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignInventory = async (requestId, resourceId) => {
    try {
      setActionLoading(requestId);
      const updated = await api.requests.assign(requestId, resourceId);
      setSelectedRequest((current) => current?._id === requestId ? { ...current, ...updated } : current);
      setCandidateResults(null);
      toast.success('Potential inventory assigned. Administrative approval is still required.');
      await fetchRequests();
    } catch (error) {
      toast.error(error.message || 'This inventory could not be assigned.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const payload = { ...newRequest, resourceDetails: { ...newRequest.resourceDetails } };
      if (!payload.notes?.trim()) delete payload.notes;
      await api.requests.create(payload);
      toast.success("Request recorded.");
      setShowCreateDialog(false);
      setNewRequest({ type: "BLOOD", urgency: "ROUTINE", resourceDetails: { bloodGroup: "O+", component: "PACKED_RBC", quantity: 1 }, notes: "" });
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

  const isAdmin = user?.role === "ADMIN";
  const isHospital = user?.role === "HOSPITAL";
  const hospitalOwnsRequest = (request) => String(request?.hospital?._id || request?.hospital || "") === String(user?._id || "");
  const providerRoleForRequest = (request) => request?.type === "ORGAN" ? "PROCUREMENT_CENTER" : "BLOOD_BANK";
  const userCanAssign = (request) => isAdmin || (user?.role === providerRoleForRequest(request));

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
          {(isHospital || isAdmin) && (
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
          )}
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
                            {req.status === "PENDING" && (isHospital || isAdmin || user?.role === providerRoleForRequest(req)) && (
                              <Button size="sm" variant="outline" className="h-8 rounded-lg px-2 text-xs" disabled={actionLoading === req._id}
                                onClick={() => handleFindInventory(req)}>
                                {actionLoading === req._id ? <Loader2 className="h-3 w-3 animate-spin" /> : isHospital ? "Find stock" : "Review"}
                              </Button>
                            )}
                            {req.status === "MATCHED" && isAdmin && (
                              <Button size="sm" className="h-8 rounded-lg bg-emerald-700 px-2 text-xs hover:bg-emerald-800" disabled={actionLoading === req._id}
                                onClick={() => handleAction(req._id, "approve", "approved")}>
                                Approve
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
                    setNewRequest({ ...newRequest, type, resourceDetails: type === "ORGAN" ? { organType: "KIDNEY", bloodGroup: "O+" } : { bloodGroup: "O+", component: "PACKED_RBC", quantity: 1 } });
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={newRequest.resourceDetails.bloodGroup} onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, bloodGroup: e.target.value } })}>
                    {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Component</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={newRequest.resourceDetails.component || "PACKED_RBC"} onChange={(e) => setNewRequest({ ...newRequest, resourceDetails: { ...newRequest.resourceDetails, component: e.target.value } })}>
                    {BLOOD_COMPONENTS.map((component) => <option key={component} value={component}>{component.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Units required</Label>
                  <Input type="number" min="1" max="500" className="rounded-xl" value={newRequest.resourceDetails.quantity || 1}
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

            <div className="space-y-2">
              <Label>Operational notes</Label>
              <Input maxLength={500} className="rounded-xl" placeholder="Do not enter patient or donor names" value={newRequest.notes}
                onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })} />
              <p className="text-xs text-gray-500 dark:text-gray-400">Only include information needed to coordinate this request.</p>
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
      <Dialog open={!!selectedRequest} onOpenChange={() => { setSelectedRequest(null); setCandidateResults(null); }}>
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
                      : `${selectedRequest.resourceDetails?.component?.replace(/_/g, " ")} · ${selectedRequest.resourceDetails?.bloodGroup} · ${selectedRequest.resourceDetails?.quantity || 1} unit(s)`}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Requested quantity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.resourceDetails?.quantity || 1} {selectedRequest.type === "BLOOD" ? "unit(s)" : "request"}
                  </p>
                </div>
              </div>

              {selectedRequest.fulfilledBy && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">Assigned center</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950 dark:text-emerald-100">{selectedRequest.fulfilledBy.organization || selectedRequest.fulfilledBy.name}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800 dark:text-emerald-300">Reported inventory is reserved. Confirm current availability and clinical suitability before approval or transfer.</p>
                </div>
              )}

              {selectedRequest.notes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">Notes</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{selectedRequest.notes}</p>
                </div>
              )}

              {candidateResults?.requestId === selectedRequest._id && (
                <section className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800" aria-live="polite">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Potential inventory</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">Shortlisted from reported blood group, component, expiry or viability, and location. This is not a clinical compatibility or allocation decision.</p>
                  </div>
                  {candidateResults.candidates?.length ? candidateResults.candidates.map((candidate) => {
                    const canAssign = userCanAssign(selectedRequest);
                    const location = [candidate.location?.city, candidate.location?.state].filter(Boolean).join(", ");
                    return (
                      <div key={candidate._id} className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {candidate.type === "ORGAN" ? candidate.resource?.replace(/_/g, " ") : candidate.resource?.replace(/_/g, " ")} · {candidate.bloodGroup}
                            {candidate.type === "BLOOD" ? ` · ${candidate.units} unit(s)` : ""}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{candidate.center?.organization || candidate.center?.name || "Participating center"}{location ? ` · ${location}` : ""}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{candidate.type === "ORGAN" ? `${candidate.hoursRemaining} hours reported in viability window` : `Reported expiry ${new Date(candidate.expiresAt).toLocaleDateString()}`}</p>
                        </div>
                        {canAssign && (
                          <Button size="sm" disabled={actionLoading === selectedRequest._id} onClick={() => handleAssignInventory(selectedRequest._id, candidate._id)} className="shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800">
                            {actionLoading === selectedRequest._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign for review"}
                          </Button>
                        )}
                      </div>
                    );
                  }) : (
                    <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">No available inventory currently meets these filters. Availability may change; contact the relevant center directly for time-sensitive requests.</p>
                  )}
                </section>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Created: {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>

              {/* Workflow Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 flex-wrap">
                {selectedRequest.status === "PENDING" && (isAdmin || (isHospital && hospitalOwnsRequest(selectedRequest)) || user?.role === providerRoleForRequest(selectedRequest)) && (
                  <Button variant="outline" className="flex-1 rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleFindInventory(selectedRequest)}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {isHospital ? "Find potential inventory" : "Review inventory"}
                  </Button>
                )}
                {selectedRequest.status === "MATCHED" && isAdmin && (
                  <Button className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "approve", "approved")}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Approve assignment
                  </Button>
                )}
                {isAdmin && ["PENDING", "MATCHED", "APPROVED"].includes(selectedRequest.status) && (
                  <Button variant="outline" className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    disabled={actionLoading === selectedRequest._id} onClick={() => handleAction(selectedRequest._id, "reject", "declined")}>
                    <XCircle className="mr-2 h-4 w-4" /> Decline
                  </Button>
                )}
                {(isHospital && hospitalOwnsRequest(selectedRequest) || isAdmin) && ["PENDING", "MATCHED"].includes(selectedRequest.status) && (
                  <Button variant="outline" className="rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "cancel", "cancelled")}>
                    Cancel request
                  </Button>
                )}
                {selectedRequest.status === "APPROVED" && (isAdmin || (user?.role === providerRoleForRequest(selectedRequest) && String(selectedRequest.fulfilledBy?._id || "") === String(user?._id || ""))) && (
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700 rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "transfer", "marked in transit")}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                    Mark in transit
                  </Button>
                )}
                {selectedRequest.status === "IN_TRANSIT" && (isAdmin || (isHospital && hospitalOwnsRequest(selectedRequest))) && (
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl" disabled={actionLoading === selectedRequest._id}
                    onClick={() => handleAction(selectedRequest._id, "complete", "completed")}>
                    {actionLoading === selectedRequest._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Confirm completion
                  </Button>
                )}
                {["COMPLETED", "REJECTED", "CANCELLED"].includes(selectedRequest.status) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">This request is {selectedRequest.status.toLowerCase()}.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
