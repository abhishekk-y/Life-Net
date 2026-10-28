import { createElement, useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, Droplets, Heart, Package, Pill, Stethoscope, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const ACTIVE_APPOINTMENT = ['PENDING', 'CONFIRMED'];

export function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    
    try {
      if (role === 'PATIENT') {
        const [appointments, medicines, blood] = await Promise.all([api.appointments.list(), api.pharmacies.listings(), api.blood.list()]);
        setData({ appointments, medicines, blood });
      } else if (role === 'DOCTOR') {
        const [appointments, profile] = await Promise.all([api.appointments.list(), api.doctors.myProfile()]);
        setData({ appointments, profile });
      } else if (role === 'PHARMACY') {
        const [orders, listings] = await Promise.all([api.pharmacies.orders(), api.pharmacies.myListings()]);
        setData({ orders, listings });
      } else if (role === 'SUPPLIER') {
        const [orders, listings] = await Promise.all([api.suppliers.orders(), api.suppliers.myListings()]);
        setData({ orders, listings });
      } else if (role === 'BLOOD_BANK') {
        const [requests, summary] = await Promise.all([api.requests.list(), api.blood.summary()]);
        setData({ requests, summary });
      } else if (role === 'PROCUREMENT_CENTER') {
        const [requests, organs] = await Promise.all([api.requests.list(), api.organs.list()]);
        setData({ requests, organs });
      } else {
        setData({});
      }
    } catch (error) {
      toast.error(error.message || 'Could not load your workspace.');
    } finally { setLoading(false); }
  }, [role]);
  useEffect(() => { load(); }, [load]);

  let cards = [];
  let shortcuts = [];
  if (user?.role === 'PATIENT') {
    cards = [
      { title: 'Appointments', value: (data.appointments || []).filter((item) => ACTIVE_APPOINTMENT.includes(item.status)).length, icon: CalendarDays, detail: 'Requests awaiting confirmation or scheduled' },
      { title: 'Pharmacy listings', value: data.medicines?.length ?? '—', icon: Pill, detail: 'In-stock listings matching your area search' },
      { title: 'Blood availability', value: data.blood?.length ?? '—', icon: Droplets, detail: 'Currently reported available records' },
    ];
    shortcuts = [['Find a doctor', '/doctors'], ['Compare medicine prices', '/pharmacy'], ['Track appointments', '/appointments'], ['See blood availability', '/blood-bank']];
  } else if (user?.role === 'DOCTOR') {
    cards = [
      { title: 'New appointment requests', value: (data.appointments || []).filter((item) => item.status === 'PENDING').length, icon: CalendarDays, detail: 'Review requests in your schedule' },
      { title: 'Upcoming confirmed', value: (data.appointments || []).filter((item) => item.status === 'CONFIRMED').length, icon: Stethoscope, detail: 'Confirmed in-person appointments' },
      { title: 'Directory status', value: data.profile?.acceptingAppointments ? 'Published' : 'Setup needed', icon: Activity, detail: 'Keep your profile and availability current' },
    ];
    shortcuts = [['Manage public profile', '/doctors'], ['Appointments', '/appointments']];
  } else if (user?.role === 'PHARMACY') {
    cards = [
      { title: 'Active listings', value: (data.listings || []).filter((item) => item.active && item.stockQuantity > 0).length, icon: Pill, detail: 'Listings with stock for patients' },
      { title: 'Pickup requests', value: (data.orders || []).filter((item) => item.status === 'PENDING').length, icon: Package, detail: 'Requests waiting for your review' },
      { title: 'Preparing', value: (data.orders || []).filter((item) => ['CONFIRMED', 'READY'].includes(item.status)).length, icon: Activity, detail: 'Confirmed orders awaiting pickup' },
    ];
    shortcuts = [['Manage medicine prices and stock', '/pharmacy'], ['Pickup orders', '/pharmacy-orders']];
  } else if (user?.role === 'SUPPLIER') {
    cards = [
      { title: 'Active supply listings', value: (data.listings || []).filter((item) => item.active && item.stockQuantity > 0).length, icon: Package, detail: 'Published items with stock' },
      { title: 'Requests to review', value: (data.orders || []).filter((item) => item.status === 'PENDING').length, icon: Activity, detail: 'Waiting for your response' },
      { title: 'Preparing or dispatching', value: (data.orders || []).filter((item) => ['CONFIRMED', 'READY'].includes(item.status)).length, icon: Truck, detail: 'Orders in progress' },
    ];
    shortcuts = [['Manage supply catalog', '/supplies'], ['Supply requests', '/supply-orders']];
  } else if (user?.role === 'BLOOD_BANK') {
    cards = [
      { title: 'Reported available units', value: data.summary?.totals?.availableUnits ?? '—', icon: Droplets, detail: 'Based on your latest inventory records' },
      { title: 'Blood requests', value: data.requests?.filter((item) => ['PENDING', 'MATCHED', 'APPROVED'].includes(item.status)).length ?? '—', icon: Activity, detail: 'Relevant coordination requests' },
      { title: 'Needs stock review', value: data.summary?.totals?.staleUnits ?? '—', icon: Package, detail: 'Available stock not updated in 24 hours' },
    ];
    shortcuts = [['Update blood inventory', '/blood-bank'], ['Blood overview', '/blood-management'], ['Request coordination', '/requests']];
  } else {
    cards = [
      { title: 'Organ listings', value: data.organs?.length ?? '—', icon: Heart, detail: 'Records maintained by your center' },
      { title: 'Active requests', value: data.requests?.filter((item) => ['PENDING', 'MATCHED', 'APPROVED', 'IN_TRANSIT'].includes(item.status)).length ?? '—', icon: Activity, detail: 'Requests requiring coordination' },
      { title: 'Available records', value: data.organs?.filter((item) => item.status === 'AVAILABLE' && item.isViable).length ?? '—', icon: Package, detail: 'Reported as available and within entered viability time' },
    ];
    shortcuts = [['Manage organ registry', '/organs'], ['Request coordination', '/requests']];
  }

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{user?.role?.replace(/_/g, ' ')}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'there'}</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your LifeNet workspace, based on the records connected to this account.</p></div><Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button></header>
    <div className="grid gap-4 md:grid-cols-3">{cards.map(({ title, value, icon, detail }) => <Card key={title} className="rounded-2xl"><CardContent className="p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{createElement(icon, { size: 19 })}</span><p className="mt-5 text-sm text-gray-500">{title}</p><p className="mt-1 text-2xl font-semibold">{loading ? '—' : value}</p><p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p></CardContent></Card>)}</div>
    <Card className="rounded-2xl"><CardContent className="p-6"><h2 className="text-lg font-semibold">Quick access</h2><div className="mt-4 flex flex-wrap gap-3">{shortcuts.map(([label, href]) => <Button asChild key={href} variant="outline"><Link to={href}>{label}</Link></Button>)}</div></CardContent></Card>
    <p className="text-xs leading-5 text-gray-500">LifeNet shows information supplied by participating providers. Confirm availability, prices, and care directly with the relevant provider. The platform does not provide medical advice or emergency response.</p>
  </div>;
}
