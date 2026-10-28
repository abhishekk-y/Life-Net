import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Clock3, Droplets, RefreshCw, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const label = (value) => String(value || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export function BloodManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {

    try { setReport(await api.blood.summary()); }
    catch (error) { toast.error(error.message || 'Could not load the current blood stock summary.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const totals = report?.totals || {};

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Blood bank operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Inventory overview</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Counts reflect this bank’s reported inventory. Review physical stock and follow your approved handling procedures.</p></div><Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button></header>
    {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading inventory summary…</p> : report ? <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        { title: 'Available units', value: totals.availableUnits, icon: Droplets, detail: 'Reported available and not expired' },
        { title: 'Reserved units', value: totals.reservedUnits, icon: Clock3, detail: 'Reserved for an active request' },
        { title: 'Expiring in 7 days', value: totals.expiringSoonUnits, icon: AlertTriangle, detail: 'Review dated stock records' },
        { title: 'Stale records', value: totals.staleUnits, icon: RefreshCw, detail: 'Available records not updated in 24 hours' },
      ].map((metric) => <Card key={metric.title} className="rounded-2xl"><CardContent className="p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><metric.icon size={18} /></span><p className="mt-4 text-sm text-gray-500">{metric.title}</p><p className="mt-1 text-2xl font-semibold">{metric.value ?? 0}</p><p className="mt-1 text-xs text-gray-500">{metric.detail}</p></CardContent></Card>)}</div>
      <Card className="overflow-hidden rounded-2xl"><CardContent className="p-0"><div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800"><h2 className="font-semibold">Reported stock by group and component</h2><p className="mt-1 text-sm text-gray-500">Each quantity reflects unit counts entered by your team, grouped by component.</p></div>
        {report.breakdown?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900"><tr><th className="px-5 py-3">Group</th><th className="px-5 py-3">Component</th><th className="px-5 py-3">Available</th><th className="px-5 py-3">Reserved</th><th className="px-5 py-3">Expiring soon</th><th className="px-5 py-3">Last updated</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{report.breakdown.map((row) => <tr key={`${row._id.bloodGroup}-${row._id.component}`}><td className="px-5 py-4 font-semibold">{row._id.bloodGroup}</td><td className="px-5 py-4">{label(row._id.component)}</td><td className="px-5 py-4">{row.availableUnits}</td><td className="px-5 py-4">{row.reservedUnits}</td><td className="px-5 py-4">{row.expiringSoonUnits}</td><td className="px-5 py-4 text-gray-500">{row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : '—'}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-gray-500">No stock records have been added yet.</div>}
      </CardContent></Card>
      <p className="flex items-start gap-2 text-xs leading-5 text-gray-500"><Thermometer size={15} className="mt-0.5 shrink-0" />Temperature is shown as entered on each inventory record. LifeNet does not determine whether storage conditions meet your service’s approved standard operating procedure.</p>
      <p className="text-xs text-gray-500">Report generated {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'just now'}.</p>
    </> : <Card className="rounded-2xl"><CardContent className="p-8 text-center text-sm text-gray-500">The current summary could not be loaded. Refresh to try again.</CardContent></Card>}
  </div>;
}
