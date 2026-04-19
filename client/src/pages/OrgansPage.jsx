import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrgans, createOrgan, matchOrgans, clearMatches } from '../redux/organSlice';
import { Heart, Plus, Search, X, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ORGAN_TYPES = ['HEART','LIVER','KIDNEY','LUNG','PANCREAS','INTESTINE','CORNEA','BONE_MARROW','SKIN','OTHER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const statusColor = {
  AVAILABLE: 'badge-success', RESERVED: 'badge-warning', MATCHED: 'badge-info',
  TRANSPLANTED: 'badge-purple', EXPIRED: 'badge-danger',
};

export default function OrgansPage() {
  const dispatch = useDispatch();
  const { items, matches, loading } = useSelector((s) => s.organs);
  const { user } = useSelector((s) => s.auth);
  const [showForm, setShowForm] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [filters, setFilters] = useState({ organType: '', bloodGroup: '', status: '' });
  const [form, setForm] = useState({
    organType: 'KIDNEY', bloodGroup: 'O+', donorAge: '', donorGender: 'MALE',
    viabilityHours: 36, location: { city: '', state: '' },
  });
  const [matchForm, setMatchForm] = useState({ organType: 'KIDNEY', bloodGroup: 'O+', patientAge: '' });

  useEffect(() => { dispatch(fetchOrgans(filters)); }, [dispatch, filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createOrgan(form));
    if (createOrgan.fulfilled.match(result)) {
      toast.success('Organ added successfully');
      setShowForm(false);
      dispatch(fetchOrgans(filters));
    } else {
      toast.error(result.payload || 'Failed to add organ');
    }
  };

  const handleMatch = async (e) => {
    e.preventDefault();
    await dispatch(matchOrgans(matchForm));
  };

  const canCreate = ['PROCUREMENT_CENTER', 'ADMIN'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organ Management</h1>
          <p className="text-sm text-text-muted">Track and manage organ availability</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowMatch(!showMatch); setShowForm(false); dispatch(clearMatches()); }} className="btn-secondary flex items-center gap-2">
            <Search className="w-4 h-4" /> Smart Match
          </button>
          {canCreate && (
            <button onClick={() => { setShowForm(!showForm); setShowMatch(false); }} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Organ
            </button>
          )}
        </div>
      </div>

      {/* Add Organ Form */}
      {showForm && (
        <div className="glass-card p-6 animate-slide-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-primary">Register New Organ</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Organ Type</label>
              <select className="input-dark" value={form.organType} onChange={(e) => setForm({...form, organType: e.target.value})}>
                {ORGAN_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Blood Group</label>
              <select className="input-dark" value={form.bloodGroup} onChange={(e) => setForm({...form, bloodGroup: e.target.value})}>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Donor Age</label>
              <input type="number" className="input-dark" value={form.donorAge} onChange={(e) => setForm({...form, donorAge: parseInt(e.target.value)})} min={0} max={120} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Donor Gender</label>
              <select className="input-dark" value={form.donorGender} onChange={(e) => setForm({...form, donorGender: e.target.value})}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Viability (hours)</label>
              <input type="number" className="input-dark" value={form.viabilityHours} onChange={(e) => setForm({...form, viabilityHours: parseInt(e.target.value)})} min={1} required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">City</label>
              <input type="text" className="input-dark" value={form.location.city} onChange={(e) => setForm({...form, location: {...form.location, city: e.target.value}})} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="btn-primary">Add Organ</button>
            </div>
          </form>
        </div>
      )}

      {/* Smart Match Form */}
      {showMatch && (
        <div className="glass-card p-6 animate-slide-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-primary">🧠 Smart Organ Match</h3>
            <button onClick={() => { setShowMatch(false); dispatch(clearMatches()); }} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleMatch} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Organ Needed</label>
              <select className="input-dark" value={matchForm.organType} onChange={(e) => setMatchForm({...matchForm, organType: e.target.value})}>
                {ORGAN_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Patient Blood Group</label>
              <select className="input-dark" value={matchForm.bloodGroup} onChange={(e) => setMatchForm({...matchForm, bloodGroup: e.target.value})}>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Patient Age</label>
              <input type="number" className="input-dark w-20" value={matchForm.patientAge} onChange={(e) => setMatchForm({...matchForm, patientAge: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="btn-primary">Find Matches</button>
          </form>

          {/* Match Results */}
          {matches.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-text-muted">{matches.length} match(es) found</p>
              {matches.map((m, i) => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{m.organType} — {m.bloodGroup}</p>
                      <p className="text-xs text-text-muted">{m.location?.city}, {m.location?.state} • {m.hoursRemaining}h remaining</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green">{m.matchScore}</p>
                    <p className="text-[10px] text-text-muted uppercase">Score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input-dark w-40" value={filters.organType} onChange={(e) => setFilters({...filters, organType: e.target.value})}>
          <option value="">All Types</option>
          {ORGAN_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
        </select>
        <select className="input-dark w-32" value={filters.bloodGroup} onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}>
          <option value="">All Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        <select className="input-dark w-36" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="MATCHED">Matched</option>
        </select>
      </div>

      {/* Organ Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((organ) => (
            <div key={organ._id} className="glass-card p-5 hover:border-accent/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <span className={`badge ${statusColor[organ.status]}`}>{organ.status}</span>
              </div>
              <h3 className="font-semibold text-text-primary text-lg">{organ.organType?.replace('_', ' ')}</h3>
              <p className="text-sm text-text-muted mt-1">Blood: <span className="text-text-primary font-medium">{organ.bloodGroup}</span></p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-text-muted">
                <p>Donor Age: <span className="text-text-secondary">{organ.donorAge || '—'}</span></p>
                <p>Gender: <span className="text-text-secondary">{organ.donorGender || '—'}</span></p>
                <p>Viable: <span className={organ.isViable ? 'text-green' : 'text-accent'}>{organ.isViable ? `${organ.hoursRemaining}h` : 'Expired'}</span></p>
                <p>📍 {organ.location?.city || '—'}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-muted">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No organs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
