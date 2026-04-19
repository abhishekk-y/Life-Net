import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, createRequest, updateRequestStatus } from '../redux/requestSlice';
import { FileText, Plus, X, Loader2, CheckCircle, XCircle, Truck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColor = {
  PENDING: 'badge-warning', MATCHED: 'badge-info', APPROVED: 'badge-success',
  IN_TRANSIT: 'badge-purple', COMPLETED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-danger',
};
const statusIcon = {
  PENDING: AlertTriangle, APPROVED: CheckCircle, IN_TRANSIT: Truck, COMPLETED: CheckCircle, REJECTED: XCircle,
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGAN_TYPES = ['HEART','LIVER','KIDNEY','LUNG','PANCREAS','INTESTINE','CORNEA','BONE_MARROW'];

export default function RequestsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.requests);
  const { user } = useSelector((s) => s.auth);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [form, setForm] = useState({
    type: 'BLOOD', urgency: 'ROUTINE',
    resourceDetails: { bloodGroup: 'O+', organType: '', component: 'WHOLE_BLOOD', quantity: 450 },
    patientAge: '', patientGender: 'MALE',
  });

  useEffect(() => { dispatch(fetchRequests(filters)); }, [dispatch, filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createRequest(form));
    if (createRequest.fulfilled.match(result)) {
      toast.success('Request created');
      setShowForm(false);
      dispatch(fetchRequests(filters));
    } else toast.error(result.payload || 'Failed');
  };

  const handleAction = async (id, action) => {
    const result = await dispatch(updateRequestStatus({ id, action }));
    if (updateRequestStatus.fulfilled.match(result)) {
      toast.success(`Request ${action}d`);
    } else toast.error(result.payload || 'Action failed');
  };

  const canCreate = ['HOSPITAL', 'ADMIN'].includes(user?.role);
  const canApprove = user?.role === 'ADMIN';
  const canTransfer = ['ADMIN', 'PROCUREMENT_CENTER', 'BLOOD_BANK'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Request Management</h1>
          <p className="text-sm text-text-muted">Track organ and blood requests</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Request
          </button>
        )}
      </div>

      {/* Create Request Form */}
      {showForm && (
        <div className="glass-card p-6 animate-slide-left">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Create Request</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Type</label>
              <select className="input-dark" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                <option value="BLOOD">Blood</option><option value="ORGAN">Organ</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Urgency</label>
              <select className="input-dark" value={form.urgency} onChange={(e) => setForm({...form, urgency: e.target.value})}>
                <option value="ROUTINE">Routine</option><option value="URGENT">Urgent</option><option value="EMERGENCY">🚨 Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Blood Group</label>
              <select className="input-dark" value={form.resourceDetails.bloodGroup} onChange={(e) => setForm({...form, resourceDetails: {...form.resourceDetails, bloodGroup: e.target.value}})}>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            {form.type === 'ORGAN' && (
              <div>
                <label className="text-xs text-text-muted mb-1 block">Organ Type</label>
                <select className="input-dark" value={form.resourceDetails.organType} onChange={(e) => setForm({...form, resourceDetails: {...form.resourceDetails, organType: e.target.value}})}>
                  <option value="">Select...</option>
                  {ORGAN_TYPES.map(o => <option key={o} value={o}>{o.replace('_',' ')}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted mb-1 block">Patient Age</label>
              <input type="number" className="input-dark" value={form.patientAge} onChange={(e) => setForm({...form, patientAge: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Patient Gender</label>
              <select className="input-dark" value={form.patientGender} onChange={(e) => setForm({...form, patientGender: e.target.value})}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-full"><button type="submit" className="btn-primary">Submit Request</button></div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input-dark w-36" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          {['PENDING','APPROVED','IN_TRANSIT','COMPLETED','REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-dark w-32" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          <option value="BLOOD">Blood</option><option value="ORGAN">Organ</option>
        </select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((req) => {
            const Icon = statusIcon[req.status] || FileText;
            return (
              <div key={req._id} className="glass-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.urgency === 'EMERGENCY' ? 'bg-accent/10 emergency-pulse' : 'bg-blue/10'}`}>
                    <Icon className={`w-5 h-5 ${req.urgency === 'EMERGENCY' ? 'text-accent' : 'text-blue'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${statusColor[req.status]}`}>{req.status}</span>
                      <span className="badge badge-info">{req.type}</span>
                      {req.urgency === 'EMERGENCY' && <span className="badge badge-danger">🚨 EMERGENCY</span>}
                      {req.urgency === 'URGENT' && <span className="badge badge-warning">URGENT</span>}
                    </div>
                    <p className="text-sm text-text-primary mt-1.5 font-medium">
                      {req.type === 'ORGAN' ? req.resourceDetails?.organType?.replace('_', ' ') : req.resourceDetails?.component?.replace(/_/g, ' ')}
                      {' — '}{req.resourceDetails?.bloodGroup}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      By {req.requestedBy?.organization || req.requestedBy?.name || '—'} • {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {req.status === 'PENDING' && canApprove && (
                    <>
                      <button onClick={() => handleAction(req._id, 'approve')} className="btn-primary text-xs py-1.5 px-3">Approve</button>
                      <button onClick={() => handleAction(req._id, 'reject')} className="btn-secondary text-xs py-1.5 px-3 hover:text-accent">Reject</button>
                    </>
                  )}
                  {req.status === 'APPROVED' && canTransfer && (
                    <button onClick={() => handleAction(req._id, 'transfer')} className="btn-primary text-xs py-1.5 px-3">Mark Transit</button>
                  )}
                  {req.status === 'IN_TRANSIT' && (
                    <button onClick={() => handleAction(req._id, 'complete')} className="btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-green to-emerald-600">Complete</button>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
