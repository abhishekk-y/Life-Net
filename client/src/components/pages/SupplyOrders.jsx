import { useCallback, useEffect, useState } from 'react';
import { PackageCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const colors = { PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-800', READY: 'bg-emerald-100 text-emerald-800', COMPLETED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-gray-100 text-gray-700' };

export function SupplyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState('');
  const isSupplier = user?.role === 'SUPPLIER';
  const load = useCallback(async () => {  try { setOrders(await api.suppliers.orders()); } catch (error) { toast.error(error.message || 'Could not load supply requests.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (order, action) => { setBusy(order._id); try { await api.suppliers.updateOrder(order._id, action); toast.success(`Supply request ${action.toLowerCase()}.`); await load(); } catch (error) { toast.error(error.message || 'Could not update this supply request.'); } finally { setBusy(''); } };
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Supplier network</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Supply requests</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{isSupplier ? 'Confirm orders, prepare confirmed requests, and record delivery.' : 'Follow supply requests sent by your organization.'} Delivery and payment are handled directly between organizations.</p></header>
    {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading supply requests…</p> : orders.length ? <div className="space-y-3">{orders.map((order) => <Card key={order._id} className="rounded-2xl"><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{order.productName}</h2><Badge className={colors[order.status]}>{order.status}</Badge></div><p className="mt-2 flex items-center gap-2 text-sm text-gray-500"><Truck size={15} />{isSupplier ? order.buyer?.organization || order.buyer?.name : order.supplier?.organization || order.supplier?.name}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{order.quantity} {order.unit} · Indicative total ₹{(order.quantity * order.unitPrice).toFixed(2)}</p><p className="mt-1 text-xs text-gray-500">Requested {new Date(order.createdAt).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{isSupplier && order.status === 'PENDING' && <><Button disabled={busy === order._id} onClick={() => update(order, 'CONFIRMED')}>Confirm</Button><Button variant="outline" disabled={busy === order._id} onClick={() => update(order, 'CANCELLED')}>Decline</Button></>}{isSupplier && order.status === 'CONFIRMED' && <Button disabled={busy === order._id} onClick={() => update(order, 'READY')}>Ready to dispatch</Button>}{isSupplier && order.status === 'READY' && <Button disabled={busy === order._id} onClick={() => update(order, 'COMPLETED')}>Mark delivered</Button>}{!isSupplier && order.status === 'PENDING' && <Button variant="outline" disabled={busy === order._id} onClick={() => update(order, 'CANCELLED')}>Cancel request</Button>}</div></CardContent></Card>)}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><PackageCheck className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No supply requests</p><p className="mt-1 text-sm text-gray-500">Requests sent by your organization or to your catalog will appear here.</p></CardContent></Card>}
  </div>;
}
