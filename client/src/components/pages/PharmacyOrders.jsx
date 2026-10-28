import { useCallback, useEffect, useState } from 'react';
import { PackageCheck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const style = { PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-800', READY: 'bg-emerald-100 text-emerald-800', COMPLETED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-gray-100 text-gray-700' };

export function PharmacyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const isPharmacy = user?.role === 'PHARMACY';
  const load = useCallback(async () => {
    
    try { setOrders(await api.pharmacies.orders()); }
    catch (error) { toast.error(error.message || 'Could not load pickup orders.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (order, action) => {
    setActiveId(order._id);
    try { await api.pharmacies.updateOrder(order._id, action); toast.success(`Pickup order ${action.toLowerCase()}.`); await load(); }
    catch (error) { toast.error(error.message || 'Could not update this pickup order.'); }
    finally { setActiveId(''); }
  };
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pharmacy network</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Pickup orders</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{isPharmacy ? 'Confirm requests, prepare confirmed orders, and mark collections complete.' : 'Track your pharmacy pickup requests.'} Payment is handled at the pharmacy counter.</p></header>
    {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading pickup orders…</p> : orders.length ? <div className="space-y-3">{orders.map((order) => <Card key={order._id} className="rounded-2xl"><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{order.medicineName}</h2><Badge className={style[order.status] || ''}>{order.status}</Badge></div><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{order.listing?.strength} · {order.listing?.dosageForm} · {order.listing?.packSize}</p><p className="mt-2 flex items-center gap-2 text-sm text-gray-500"><Store size={15} />{isPharmacy ? order.patient?.name : order.pharmacy?.organization || order.pharmacy?.name} · {order.quantity} pack(s) · ₹{(order.unitPrice * order.quantity).toFixed(2)} total</p><p className="mt-1 text-xs text-gray-500">Requested {new Date(order.createdAt).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{isPharmacy && order.status === 'PENDING' && <><Button disabled={activeId === order._id} onClick={() => update(order, 'CONFIRMED')}>Confirm</Button><Button variant="outline" disabled={activeId === order._id} onClick={() => update(order, 'CANCELLED')}>Decline</Button></>}{isPharmacy && order.status === 'CONFIRMED' && <Button disabled={activeId === order._id} onClick={() => update(order, 'READY')}>Ready for pickup</Button>}{isPharmacy && order.status === 'READY' && <Button disabled={activeId === order._id} onClick={() => update(order, 'COMPLETED')}>Mark collected</Button>}{!isPharmacy && order.status === 'PENDING' && <Button variant="outline" disabled={activeId === order._id} onClick={() => update(order, 'CANCELLED')}>Cancel request</Button>}</div></CardContent></Card>)}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><PackageCheck className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No pickup orders</p><p className="mt-1 text-sm text-gray-500">{isPharmacy ? 'Patient requests will appear here.' : 'Request a pickup from a pharmacy listing to track it here.'}</p></CardContent></Card>}
  </div>;
}
