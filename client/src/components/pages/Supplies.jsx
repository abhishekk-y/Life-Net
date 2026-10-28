import { useCallback, useEffect, useState } from 'react';
import { PackageSearch, Search, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const empty = { productName: '', category: '', description: '', unit: 'case', unitPrice: '', stockQuantity: '', leadTimeDays: 0, active: true };
const buyers = ['HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER'];

export function Supplies() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [quantity, setQuantity] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const isSupplier = user?.role === 'SUPPLIER';
  const canBuy = buyers.includes(user?.role);

  const load = useCallback(async (text = '', cityName = '') => {
    
    try {
      const params = new URLSearchParams(); if (text.trim()) params.set('search', text.trim()); if (cityName.trim()) params.set('city', cityName.trim());
      const [listings, own] = await Promise.all([api.suppliers.listings(params.toString()), isSupplier ? api.suppliers.myListings() : Promise.resolve([])]);
      setRows(Array.isArray(listings) ? listings : []); setMine(Array.isArray(own) ? own : []);
    } catch (error) { toast.error(error.message || 'Could not load supply listings.'); }
    finally { setLoading(false); }
  }, [isSupplier]);
  useEffect(() => { load(); }, [load]);

  const edit = (item) => { setEditId(item._id); setForm({ ...item, unitPrice: String(item.unitPrice), stockQuantity: String(item.stockQuantity) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { setEditId(''); setForm(empty); };
  const save = async (event) => {
    event.preventDefault(); setBusy('save');
    const payload = { ...form, unitPrice: Number(form.unitPrice), stockQuantity: Number(form.stockQuantity), leadTimeDays: Number(form.leadTimeDays) };
    try { if (editId) await api.suppliers.updateListing(editId, payload); else await api.suppliers.createListing(payload); toast.success(editId ? 'Supply listing updated.' : 'Supply listing published.'); reset(); await load(search, city); }
    catch (error) { toast.error(error.message || 'Could not save this listing.'); }
    finally { setBusy(''); }
  };
  const order = async (item) => {
    setBusy(item._id);
    try { await api.suppliers.placeOrder({ listingId: item._id, quantity: Number(quantity[item._id] || 1) }); toast.success('Supply request sent to the supplier.'); await load(search, city); }
    catch (error) { toast.error(error.message || 'Could not place this request.'); }
    finally { setBusy(''); }
  };

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Approved supplier network</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Healthcare supplies</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">Suppliers manage their own catalog and stock. Approved care organizations can send requests and follow the response. Delivery and payment terms are arranged directly between organizations.</p></header>
    {isSupplier && <Card className="rounded-2xl"><CardContent className="p-6"><form onSubmit={save} className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{editId ? 'Update supply listing' : 'Your supplier catalog'}</h2><p className="mt-1 text-sm text-gray-500">Keep quantities, lead times, and indicative prices current.</p></div>{editId && <Button type="button" variant="outline" onClick={reset}>Cancel edit</Button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['productName','Product'],['category','Category'],['unit','Unit / pack'],['unitPrice','Indicative price per unit']].map(([key,label]) => <div key={key} className="space-y-2"><Label htmlFor={`supply-${key}`}>{label}</Label><Input id={`supply-${key}`} type={key === 'unitPrice' ? 'number' : 'text'} min={key === 'unitPrice' ? 0 : undefined} step={key === 'unitPrice' ? '0.01' : undefined} required value={form[key] ?? ''} onChange={(e) => setForm((state) => ({ ...state, [key]: e.target.value }))} /></div>)}<div className="space-y-2"><Label htmlFor="supply-stock">Available quantity</Label><Input id="supply-stock" type="number" min="0" required value={form.stockQuantity} onChange={(e) => setForm((state) => ({ ...state, stockQuantity: e.target.value }))} /></div><div className="space-y-2"><Label htmlFor="supply-lead">Lead time (days)</Label><Input id="supply-lead" type="number" min="0" max="365" required value={form.leadTimeDays} onChange={(e) => setForm((state) => ({ ...state, leadTimeDays: e.target.value }))} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="supply-description">Description / specifications</Label><Input id="supply-description" maxLength={1200} value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} /></div><label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((state) => ({ ...state, active: e.target.checked }))} />Show in buyer catalog</label></div><Button disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : editId ? 'Save changes' : 'Publish listing'}</Button></form></CardContent></Card>}
    {isSupplier && mine.length > 0 && <div className="flex gap-3 overflow-x-auto pb-1">{mine.map((item) => <button key={item._id} type="button" onClick={() => edit(item)} className="min-w-64 rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-gray-800 dark:bg-gray-900"><span className="font-medium">{item.productName}</span><span className="mt-1 block text-xs text-gray-500">{item.stockQuantity} {item.unit} · edit listing</span></button>)}</div>}
    <form onSubmit={(event) => { event.preventDefault(); load(search, city); }} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_0.6fr_auto]"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Product or description" aria-label="Search supplies" /><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Supplier city" aria-label="Supplier city" /><Button><Search className="mr-2 h-4 w-4" />Search catalog</Button></form>
    {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading supplier catalog…</p> : rows.length ? <div className="grid gap-4 lg:grid-cols-2">{rows.map((item) => <Card key={item._id} className="rounded-2xl"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200"><PackageSearch /></span><span className="text-xs text-gray-500">{item.category}</span></div><h2 className="mt-4 text-lg font-semibold">{item.productName}</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description || 'No extra specifications provided.'}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><div><p className="font-semibold">₹{Number(item.unitPrice).toFixed(2)} / {item.unit}</p><p className="mt-1 text-xs text-gray-500">{item.stockQuantity} {item.unit} available · {item.leadTimeDays} day lead time</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Truck size={13} />{item.supplier?.organization} · {item.supplier?.address?.city || 'Location not listed'}</p></div>{canBuy && <div className="flex items-center gap-2"><Input className="w-24" type="number" min="1" max={item.stockQuantity} value={quantity[item._id] || 1} aria-label={`Quantity of ${item.productName}`} onChange={(e) => setQuantity((state) => ({ ...state, [item._id]: e.target.value }))} /><Button disabled={busy === item._id} onClick={() => order(item)}>{busy === item._id ? 'Sending…' : 'Request supply'}</Button></div>}</div></CardContent></Card>)}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><PackageSearch className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No supply listings found</p><p className="mt-1 text-sm text-gray-500">Try another product or location.</p></CardContent></Card>}
  </div>;
}
