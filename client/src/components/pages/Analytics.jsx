import { createElement, useCallback, useEffect, useState } from "react";
import { Activity, Droplets, Heart, Loader2, RefreshCw, ClipboardList } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const COLORS = ["#059669", "#0f766e", "#0891b2", "#2563eb", "#4f46e5", "#7c3aed", "#c026d3", "#e11d48"];
const compactDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function ChartCard({ title, children, className = "" }) {
  return <Card className={`rounded-2xl border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
    <CardHeader><CardTitle className="text-base font-semibold text-gray-900 dark:text-white">{title}</CardTitle></CardHeader>
    <CardContent className="h-72">{children}</CardContent>
  </Card>;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalytics(await api.dashboard.analytics());
    } catch (error) {
      toast.error(error.message || "Could not load network analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  const refreshAnalytics = async () => { setLoading(true); await loadAnalytics(); };

  const trend = (analytics?.requestsTrend || []).map((item) => ({
    ...item,
    dateLabel: compactDate(item._id),
  }));
  const blood = analytics?.bloodDistribution || [];
  const organs = analytics?.organDistribution || [];
  const statuses = analytics?.statusBreakdown || [];
  const totalRequests = statuses.reduce((sum, item) => sum + item.count, 0);
  const totalBloodUnits = blood.reduce((sum, item) => sum + item.count, 0);
  const availableOrgans = organs.reduce((sum, item) => sum + item.available, 0);
  const dataReady = !!analytics && (trend.length + blood.length + organs.length + statuses.length > 0);

  if (loading && !analytics) return <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading analytics</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Network overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">Operational activity and reported inventory across the LifeNet network.</p>
        </div>
        <Button variant="outline" onClick={refreshAnalytics} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Network totals">
        {[
          { label: "Requests recorded", value: totalRequests, icon: ClipboardList },
          { label: "Available blood units", value: totalBloodUnits, icon: Droplets },
          { label: "Available organ records", value: availableOrgans, icon: Heart },
          { label: "Request statuses", value: statuses.length, icon: Activity },
        ].map(({ label, value, icon }) => <Card key={label} className="rounded-2xl border-0 bg-gray-100/80 shadow-none dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-gray-800 dark:text-emerald-300">{createElement(icon, { className: "h-5 w-5" })}</span>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">{value.toLocaleString()}</p></div>
          </CardContent>
        </Card>)}
      </section>

      {dataReady ? <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Requests over the last 30 days">
          {trend.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs><linearGradient id="requestsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.24} /><stop offset="100%" stopColor="#059669" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /><XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="count" name="Requests" stroke="#059669" strokeWidth={2} fill="url(#requestsFill)" /><Area type="monotone" dataKey="completed" name="Completed" stroke="#0e7490" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-gray-500">No requests in this period.</p>}
        </ChartCard>
        <ChartCard title="Requests by status">
          {statuses.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={statuses} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /><XAxis dataKey="_id" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="count" name="Requests" fill="#059669" radius={[5, 5, 0, 0]} />
          </BarChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-gray-500">No request records yet.</p>}
        </ChartCard>
        <ChartCard title="Reported available blood by group">
          {blood.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={blood} dataKey="count" nameKey="_id" innerRadius="52%" outerRadius="78%" paddingAngle={2} label={({ _id, count }) => `${_id} · ${count}`}>
            {blood.map((item, index) => <Cell key={item._id} fill={COLORS[index % COLORS.length]} />)}
          </Pie><Tooltip /></PieChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-gray-500">No available blood records.</p>}
        </ChartCard>
        <ChartCard title="Organ records by type">
          {organs.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={organs} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="_id" width={82} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="total" name="Records" fill="#0e7490" radius={[0, 5, 5, 0]} />
          </BarChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-gray-500">No organ records yet.</p>}
        </ChartCard>
      </div> : <Card className="rounded-2xl border-dashed"><CardContent className="py-16 text-center"><Activity className="mx-auto h-8 w-8 text-gray-400" /><h2 className="mt-3 font-semibold text-gray-900 dark:text-white">No network activity yet</h2><p className="mt-1 text-sm text-gray-500">Analytics will appear as centers record requests and inventory.</p></CardContent></Card>}
      <p className="text-xs leading-5 text-gray-500">Charts summarize records entered in LifeNet. They do not represent clinical guidance, donor allocation, or verified availability.</p>
    </div>
  );
}
