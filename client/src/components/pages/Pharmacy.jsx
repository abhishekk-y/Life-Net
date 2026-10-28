import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, PackagePlus, Pill, Search, Store } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const emptyListing = { medicineName: '', activeIngredient: '', strength: '', dosageForm: '', packSize: '', manufacturer: '', price: '', stockQuantity: '', expiresAt: '', active: true };
const exactProduct = (item) => `${item.activeIngredient} · ${item.strength} · ${item.dosageForm} · ${item.packSize}`;

export function Pharmacy() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [mine, setMine] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [form, setForm] = useState(emptyListing);
  const [editId, setEditId] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [placing, setPlacing] = useState('');
  const isPharmacy = user?.role === 'PHARMACY';
  const isPatient = user?.role === 'PATIENT';

  const load = useCallback(async (text = '', cityName = '') => {
    
    try {
      const params = new URLSearchParams();
      if (text.trim()) params.set('search', text.trim());
      if (cityName.trim()) params.set('city', cityName.trim());
      const [publicRows, ownRows] = await Promise.all([
        api.pharmacies.listings(params.toString()),
        isPharmacy ? api.pharmacies.myListings() : Promise.resolve([]),
      ]);
      setListings(Array.isArray(publicRows) ? publicRows : []);
      setMine(Array.isArray(ownRows) ? ownRows : []);
    } catch (error) { toast.error(error.message || 'Could not load pharmacy listings.'); }
    finally { setLoading(false); }
  }, [isPharmacy]);
  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => {
    const grouped = new Map();
    for (const item of listings) {
      if (!grouped.has(item.comparisonKey)) grouped.set(item.comparisonKey, []);
      grouped.get(item.comparisonKey).push(item);
    }
    return [...grouped.entries()].map(([key, items]) => ({ key, items: items.sort((a, b) => a.price - b.price) }));
  }, [listings]);

  const resetForm = () => { setForm(emptyListing); setEditId(''); };
  const editListing = (item) => {
    setEditId(item._id);
    setForm({ ...item, price: String(item.price), stockQuantity: String(item.stockQuantity), expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 10) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const saveListing = async (event) => {
    event.preventDefault(); setSaving(true);
    const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), ...(form.expiresAt ? { expiresAt: new Date(`${form.expiresAt}T23:59:59`) } : { expiresAt: undefined }) };
    try {
      if (editId) await api.pharmacies.updateListing(editId, payload);
      else await api.pharmacies.createListing(payload);
      toast.success(editId ? 'Inventory listing updated.' : 'Medicine added to pharmacy inventory.');
      resetForm(); await load(search, city);
    } catch (error) { toast.error(error.message || 'Could not save this medicine.'); }
    finally { setSaving(false); }
  };
  const placeOrder = async (item) => {
    const quantity = Number(quantities[item._id] || 1);
    setPlacing(item._id);
    try {
      await api.pharmacies.placeOrder({ listingId: item._id, quantity });
      toast.success('Pickup request sent. The pharmacy will confirm it.');
      await load(search, city);
    } catch (error) { toast.error(error.message || 'Could not request this quantity.'); }
    finally { setPlacing(''); }
  };

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pharmacy network</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Medicine availability & prices</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">Compare current listings for the same active ingredient, strength, dosage form, and pack size. Stock and prices are supplied by each pharmacy.</p></header>

    {isPharmacy && <Card className="rounded-2xl"><CardContent className="p-6"><form onSubmit={saveListing} className="space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{editId ? 'Update listing' : 'Manage pharmacy inventory'}</h2><p className="mt-1 text-sm text-gray-500">Keep price, quantity, and expiry current. Customers pay at pickup.</p></div>{editId && <Button type="button" variant="ghost" onClick={resetForm}>Cancel edit</Button>}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["medicineName", "Medicine name"], ["activeIngredient", "Active ingredient"], ["strength", "Strength"], ["dosageForm", "Dosage form"], ["packSize", "Pack size"], ["manufacturer", "Manufacturer"]].map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`listing-${key}`}>{label}</Label><Input id={`listing-${key}`} value={form[key] || ''} required={key !== 'manufacturer'} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} /></div>)}
        <div className="space-y-2"><Label htmlFor="listing-price">Price per pack (₹)</Label><Input id="listing-price" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} /></div>
        <div className="space-y-2"><Label htmlFor="listing-stock">Packs in stock</Label><Input id="listing-stock" type="number" min="0" step="1" required value={form.stockQuantity} onChange={(e) => setForm((current) => ({ ...current, stockQuantity: e.target.value }))} /></div>
        <div className="space-y-2"><Label htmlFor="listing-expiry">Expiry date (if applicable)</Label><Input id="listing-expiry" type="date" value={form.expiresAt || ''} onChange={(e) => setForm((current) => ({ ...current, expiresAt: e.target.value }))} /></div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))} /> Visible to patients</label>
      </div>
      <div className="flex flex-wrap gap-2"><Button disabled={saving}>{saving ? 'Saving…' : editId ? 'Save listing' : 'Add listing'}</Button>{editId && <Button type="button" variant="outline" onClick={resetForm}>Clear form</Button>}</div>
    </form></CardContent></Card>}

    <form onSubmit={(event) => { event.preventDefault(); load(search, city); }} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_0.6fr_auto]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Medicine or active ingredient" aria-label="Medicine or active ingredient" /></div>
      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" aria-label="City" />
      <Button><Search className="mr-2 h-4 w-4" /> Compare prices</Button>
    </form>

    {isPharmacy && <section><div className="mb-3 flex items-center gap-2"><PackagePlus className="h-5 w-5 text-blue-700" /><h2 className="font-semibold">Your inventory ({mine.length})</h2></div><div className="flex gap-3 overflow-x-auto pb-2">{mine.map((item) => <button type="button" key={item._id} onClick={() => editListing(item)} className="min-w-64 rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-gray-800 dark:bg-gray-900"><span className="font-medium">{item.medicineName}</span><span className="mt-1 block text-xs text-gray-500">{item.stockQuantity} packs · ₹{Number(item.price).toFixed(2)} · edit</span></button>)}</div></section>}

    {loading ? <p className="py-10 text-center text-sm text-gray-500">Checking pharmacy listings…</p> : groups.length ? <div className="space-y-4">{groups.map(({ key, items }) => <Card key={key} className="overflow-hidden rounded-2xl"><CardContent className="p-0">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900"><h2 className="font-semibold">{items[0].medicineName}</h2><p className="mt-1 text-sm text-gray-500">Same product details: {exactProduct(items[0])}</p></div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((item) => <div key={item._id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Store size={16} className="text-gray-400" /><p className="font-medium">{item.pharmacy?.organization || item.pharmacy?.name}</p>{item.manufacturer && <span className="text-xs text-gray-500">{item.manufacturer}</span>}</div><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} />{item.pharmacy?.address?.city || 'Location not listed'} · {item.stockQuantity} packs in stock</p></div><div className="flex flex-wrap items-center gap-3"><span className="text-lg font-semibold">₹{Number(item.price).toFixed(2)}</span>{isPatient && <><Input className="w-20" type="number" min="1" max={item.stockQuantity} aria-label={`Packs of ${item.medicineName}`} value={quantities[item._id] || 1} onChange={(e) => setQuantities((current) => ({ ...current, [item._id]: e.target.value }))} /><Button disabled={placing === item._id} onClick={() => placeOrder(item)}>{placing === item._id ? 'Sending…' : 'Request pickup'}</Button></>}</div></div>)}</div>
    </CardContent></Card>)}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><Pill className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No matching in-stock listings</p><p className="mt-1 text-sm text-gray-500">Try another medicine name or city.</p></CardContent></Card>}
    {isPatient && <p className="text-xs leading-5 text-gray-500">Listings are provided by pharmacies and may change before pickup. A price comparison is not a recommendation or a substitute for a prescription. Confirm the exact product, prescription requirements, price, expiry, and suitability with a licensed pharmacist. Pickup requests are paid directly at the pharmacy; no online payment is collected by LifeNet.</p>}
  </div>;
}
