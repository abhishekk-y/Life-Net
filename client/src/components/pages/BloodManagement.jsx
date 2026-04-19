import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { BarChart3, Droplets, TrendingUp, TrendingDown, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodManagement() {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsData, summaryData] = await Promise.allSettled([
        api.blood.list(),
        api.blood.summary(),
      ]);
      if (unitsData.status === "fulfilled") {
        const items = unitsData.value?.bloodUnits || unitsData.value || [];
        setBloodUnits(Array.isArray(items) ? items : []);
      }
      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute analytics
  const analytics = BLOOD_GROUPS.map((bg) => {
    const units = bloodUnits.filter((u) => u.bloodGroup === bg);
    const available = units.filter((u) => u.status === "AVAILABLE").length;
    const reserved = units.filter((u) => u.status === "RESERVED").length;
    const expired = units.filter((u) => u.status === "EXPIRED").length;
    const expiringSoon = units.filter((u) => {
      if (!u.expiryDate) return false;
      const days = (new Date(u.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return days > 0 && days < 7;
    }).length;
    const totalQty = units.reduce((s, u) => s + (u.quantity || 0), 0);
    const health = units.length === 0 ? 0 : available === 0 ? 10 : Math.round((available / units.length) * 100);
    return { bloodGroup: bg, total: units.length, available, reserved, expired, expiringSoon, totalQty, health };
  });

  const totalAvailable = analytics.reduce((s, a) => s + a.available, 0);
  const totalExpiring = analytics.reduce((s, a) => s + a.expiringSoon, 0);
  const totalExpired = analytics.reduce((s, a) => s + a.expired, 0);
  const totalQty = analytics.reduce((s, a) => s + a.totalQty, 0);

  const healthColor = (h) => h >= 60 ? "bg-emerald-500" : h >= 30 ? "bg-amber-500" : "bg-red-500";

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blood Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Analytics and health metrics for blood inventory</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl border-gray-300 dark:border-gray-700">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: `${(totalQty / 1000).toFixed(1)}L`, icon: Droplets, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Available Units", value: totalAvailable, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Expiring Soon", value: totalExpiring, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Expired Units", value: totalExpired, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
        ].map((k) => (
          <Card key={k.label} className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</p>
                <p className="text-xs text-gray-500">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Blood Group Health Matrix */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Blood Group Health Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bloodUnits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {analytics.map((a) => (
                <div key={a.bloodGroup} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">{a.bloodGroup}</span>
                    </div>
                    <Badge className={`rounded-lg text-xs ${a.total === 0 ? "bg-gray-100 text-gray-500" : a.health >= 60 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" : a.health >= 30 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"}`}>
                      {a.total === 0 ? "Empty" : a.health >= 60 ? "Good" : a.health >= 30 ? "Low" : "Critical"}
                    </Badge>
                  </div>

                  {/* Health bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Health</span><span>{a.health}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${healthColor(a.health)}`} style={{ width: `${a.health}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="font-bold text-gray-900 dark:text-white">{a.total}</p>
                      <p className="text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="font-bold text-emerald-600">{a.available}</p>
                      <p className="text-gray-500">Available</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="font-bold text-amber-600">{a.expiringSoon}</p>
                      <p className="text-gray-500">Expiring</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="font-bold text-gray-700 dark:text-gray-300">{(a.totalQty / 1000).toFixed(1)}L</p>
                      <p className="text-gray-500">Volume</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No blood data available.</p>
              <p className="text-sm text-gray-400 mt-1">Add blood units from the Blood Bank page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
