import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Heart,
  Droplets,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  X,
  Calendar,
  MapPin,
  Phone,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { api } from "../../lib/api";
import { useAuth } from "../AuthContext";
import { NetworkMap } from "../ui/NetworkMap";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [organs, setOrgans] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, organsData, bloodData, requestsData, activityData] =
        await Promise.allSettled([
          api.dashboard.stats(),
          api.organs.list(),
          api.blood.list(),
          api.requests.list(),
          api.dashboard.activity(),
        ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (organsData.status === "fulfilled") {
        const items = organsData.value?.organs || organsData.value || [];
        setOrgans(Array.isArray(items) ? items : []);
      }
      if (bloodData.status === "fulfilled") {
        const items = bloodData.value?.bloodUnits || bloodData.value || [];
        setBloodUnits(Array.isArray(items) ? items : []);
      }
      if (requestsData.status === "fulfilled") {
        const items = requestsData.value?.requests || requestsData.value || [];
        setRequests(Array.isArray(items) ? items : []);
      }
      if (activityData.status === "fulfilled") {
        const items = activityData.value?.logs || activityData.value || [];
        setActivity(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute blood inventory summary from real data
  const bloodSummary = BLOOD_GROUPS.map((bg) => {
    const units = bloodUnits.filter((u) => u.bloodGroup === bg);
    const totalQty = units.reduce((sum, u) => sum + (u.quantity || 0), 0);
    const available = units.filter((u) => u.status === "AVAILABLE").length;
    const expiringSoon = units.filter((u) => {
      const exp = new Date(u.expiryDate);
      const daysLeft = (exp - new Date()) / (1000 * 60 * 60 * 24);
      return daysLeft < 7 && daysLeft > 0;
    }).length;
    return {
      bloodGroup: bg,
      totalUnits: units.length,
      totalQty,
      available,
      expiringSoon,
      percentage: Math.min(Math.round((units.length / 10) * 100), 100),
    };
  }).filter((b) => b.totalUnits > 0);

  // Compute organ summary from real data
  const organSummary = {};
  organs.forEach((o) => {
    const type = o.organType || "OTHER";
    if (!organSummary[type]) {
      organSummary[type] = { name: type, available: 0, total: 0, items: [] };
    }
    organSummary[type].total++;
    if (o.status === "AVAILABLE") organSummary[type].available++;
    organSummary[type].items.push(o);
  });
  const organList = Object.values(organSummary);

  const kpiCards = [
    {
      title: "Total Organs",
      value: stats?.totalOrgans ?? organs.length,
      sub: `${stats?.availableOrgans ?? organList.reduce((s, o) => s + o.available, 0)} available`,
      icon: Heart,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
    {
      title: "Blood Units",
      value: stats?.totalBloodUnits ?? bloodUnits.length,
      sub: `${stats?.availableBloodUnits ?? bloodSummary.reduce((s, b) => s + b.available, 0)} available`,
      icon: Droplets,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Requests",
      value: stats?.pendingRequests ?? requests.filter((r) => r.status !== "COMPLETED" && r.status !== "REJECTED").length,
      sub: `${stats?.totalRequests ?? requests.length} total`,
      icon: Activity,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Users",
      value: stats?.totalUsers ?? "—",
      sub: `${user?.role || "Admin"} access`,
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {user?.name || "Admin"}. Here's your network overview.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          className="rounded-xl border-gray-300 dark:border-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {kpi.title}
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {kpi.value}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {kpi.sub}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Network Command Map */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <NetworkMap />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Inventory - REAL DATA */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Blood Inventory ({bloodUnits.length} units)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bloodSummary.length > 0 ? (
              bloodSummary.map((blood) => (
                <div key={blood.bloodGroup} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {blood.bloodGroup}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {blood.totalUnits} units ({blood.totalQty} ml)
                      </span>
                      {blood.expiringSoon > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px]">
                          {blood.expiringSoon} expiring
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={blood.percentage} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No blood units in inventory. Add units from the Blood Bank page.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Organ Availability - REAL DATA */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              Organ Availability ({organs.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organList.length > 0 ? (
                organList.map((organ) => (
                  <div
                    key={organ.name}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrgan(organ)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {organ.name.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {organ.total} registered
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {organ.available}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        available
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No organs registered. Add organs from the Organs page.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests - REAL DATA */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Recent Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Details
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Urgency
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 10).map((request) => (
                    <tr
                      key={request._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-mono text-gray-900 dark:text-white">
                        {request._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        <Badge variant="outline" className="rounded-lg">
                          {request.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {request.type === "ORGAN"
                          ? request.resourceDetails?.organType
                          : `${request.resourceDetails?.bloodGroup} (${request.resourceDetails?.quantity || 1} units)`}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${urgencyColors[request.urgency] || urgencyColors.ROUTINE}`}
                        >
                          {request.urgency === "EMERGENCY" && (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {request.urgency}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[request.status] || ""}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          onClick={() => setSelectedRequest(request)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No requests yet. Create a request from the Requests page.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Log - REAL DATA */}
      {activity.length > 0 && (
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.slice(0, 8).map((log, idx) => (
                <div
                  key={log._id || idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {log.entity} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Detail Dialog */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Request Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3 flex-wrap">
                <Badge className={urgencyColors[selectedRequest.urgency] || ""}>
                  {selectedRequest.urgency}
                </Badge>
                <Badge className={statusColors[selectedRequest.status] || ""}>
                  {selectedRequest.status}
                </Badge>
                <Badge variant="outline">{selectedRequest.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Resource</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRequest.type === "ORGAN"
                      ? selectedRequest.resourceDetails?.organType
                      : selectedRequest.resourceDetails?.bloodGroup}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Patient</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRequest.patientAge
                      ? `Age ${selectedRequest.patientAge}, ${selectedRequest.patientGender || "N/A"}`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl">
                  <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Workflow Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {selectedRequest.status === "PENDING" && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    onClick={async () => {
                      try {
                        await api.requests.approve(selectedRequest._id);
                        setSelectedRequest(null);
                        fetchDashboardData();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedRequest.status === "APPROVED" && (
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 rounded-xl"
                    onClick={async () => {
                      try {
                        await api.requests.transfer(selectedRequest._id);
                        setSelectedRequest(null);
                        fetchDashboardData();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Mark In Transit
                  </Button>
                )}
                {selectedRequest.status === "IN_TRANSIT" && (
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                    onClick={async () => {
                      try {
                        await api.requests.complete(selectedRequest._id);
                        setSelectedRequest(null);
                        fetchDashboardData();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Complete
                  </Button>
                )}
                {selectedRequest.status === "PENDING" && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    onClick={async () => {
                      try {
                        await api.requests.reject(selectedRequest._id);
                        setSelectedRequest(null);
                        fetchDashboardData();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Organ Detail Dialog */}
      <Dialog
        open={!!selectedOrgan}
        onOpenChange={() => setSelectedOrgan(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {selectedOrgan?.name?.replace(/_/g, " ")} Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrgan && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    Available
                  </p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {selectedOrgan.available}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Total Registered
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedOrgan.total}
                  </p>
                </div>
              </div>
              {selectedOrgan.items && selectedOrgan.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Individual Organs
                  </h4>
                  {selectedOrgan.items.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Blood: {item.bloodGroup} • Age: {item.donorAge || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.location?.city || "Unknown location"}
                        </p>
                      </div>
                      <Badge className={item.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}>
                        {item.status}
                      </Badge>
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
