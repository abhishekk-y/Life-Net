import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBloodUnits, createBloodUnit, fetchBloodSummary } from '../redux/bloodSlice';
import { Droplets, Plus, X, Loader2, Thermometer, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE'];

const tempStatusColor = { OPTIMAL: 'text-green', WARNING: 'text-amber', CRITICAL: 'text-accent' };

export default function BloodPage() {
  const dispatch = useDispatch();
  const { items, summary, loading } = useSelector((s) => s.blood);
  const { user } = useSelector((s) => s.auth);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ bloodGroup: '', component: '' });
  const [form, setForm] = useState({
    bloodGroup: 'O+', component: 'WHOLE_BLOOD', quantity: 450, units: 1,
    storageTemp: 4, donorId: '', expiryDate: '', location: { city: '', state: '' },
  });

  useEffect(() => {
    dispatch(fetchBloodUnits(filters));
    dispatch(fetchBloodSummary());
  }, [dispatch, filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBloodUnit(form));
    if (createBloodUnit.fulfilled.match(result)) {
      toast.success('Blood unit added');
      setShowForm(false);
      dispatch(fetchBloodUnits(filters));
      dispatch(fetchBloodSummary());
    } else toast.error(result.payload || 'Failed');
  };

  const canCreate = ['BLOOD_BANK', 'ADMIN'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blood Bank</h1>
          <p className="text-sm text-text-muted">Manage blood inventory & storage</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Blood Unit
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BLOOD_GROUPS.map((bg) => {
          const s = summary.find((x) => x._id?.bloodGroup === bg);
          return (
            <div key={bg} className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-accent">{bg}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{s?.totalUnits || 0}</p>
              <p className="text-[10px] text-text-muted">units</p>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-6 animate-slide-left">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Add Blood Unit</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Blood Group</label>
              <select className="input-dark" value={form.bloodGroup} onChange={(e) => setForm({...form, bloodGroup: e.target.value})}>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Component</label>
              <select className="input-dark" value={form.component} onChange={(e) => setForm({...form, component: e.target.value})}>
                {COMPONENTS.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Quantity (ml)</label>
              <input type="number" className="input-dark" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})} min={1} required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Units</label>
              <input type="number" className="input-dark" value={form.units} onChange={(e) => setForm({...form, units: parseInt(e.target.value)})} min={1} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Storage Temp (°C)</label>
              <input type="number" className="input-dark" value={form.storageTemp} onChange={(e) => setForm({...form, storageTemp: parseFloat(e.target.value)})} required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Donor ID</label>
              <input type="text" className="input-dark" value={form.donorId} onChange={(e) => setForm({...form, donorId: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Expiry Date</label>
              <input type="date" className="input-dark" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">City</label>
              <input type="text" className="input-dark" value={form.location.city} onChange={(e) => setForm({...form, location: {...form.location, city: e.target.value}})} />
            </div>
            <div className="col-span-full">
              <button type="submit" className="btn-primary">Add Unit</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input-dark w-32" value={filters.bloodGroup} onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}>
          <option value="">All Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        <select className="input-dark w-40" value={filters.component} onChange={(e) => setFilters({...filters, component: e.target.value})}>
          <option value="">All Components</option>
          {COMPONENTS.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      {/* Blood Units Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((unit) => (
            <div key={unit._id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue" />
                  </div>
                  <span className="text-xl font-bold text-accent">{unit.bloodGroup}</span>
                </div>
                <span className={`badge ${unit.isExpired ? 'badge-danger' : 'badge-success'}`}>
                  {unit.isExpired ? 'EXPIRED' : unit.status}
                </span>
              </div>
              <p className="text-sm text-text-secondary font-medium">{unit.component?.replace(/_/g, ' ')}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-text-muted">
                <p className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {unit.quantity}ml × {unit.units}</p>
                <p className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  <span className={tempStatusColor[unit.tempStatus]}>{unit.storageTemp}°C</span>
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {unit.daysUntilExpiry > 0 ? (
                    <span className={unit.daysUntilExpiry <= 3 ? 'text-amber' : 'text-green'}>{unit.daysUntilExpiry}d left</span>
                  ) : <span className="text-accent">Expired</span>}
                </p>
                <p>📍 {unit.location?.city || '—'}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-muted">
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No blood units found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
