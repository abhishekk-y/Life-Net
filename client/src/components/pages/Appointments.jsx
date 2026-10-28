import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const statusStyle = { PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-emerald-100 text-emerald-800', REJECTED: 'bg-red-100 text-red-800', CANCELLED: 'bg-gray-100 text-gray-700', COMPLETED: 'bg-blue-100 text-blue-800' };
const formatDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Time unavailable';

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const isDoctor = user?.role === 'DOCTOR';
  const load = useCallback(async () => {
    
    try { setAppointments(await api.appointments.list()); }
    catch (error) { toast.error(error.message || 'Could not load appointments.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (appointment, action) => {
    setActionId(appointment._id);
    try { await api.appointments.update(appointment._id, action); toast.success(`Appointment ${action.toLowerCase()}.`); await load(); }
    catch (error) { toast.error(error.message || 'Could not update the appointment.'); }
    finally { setActionId(''); }
  };

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Care coordination</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Appointments</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{isDoctor ? 'Review requests and keep your appointment status current.' : 'Track appointment requests and confirmations from clinics.'}</p></header>
    {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading appointments…</p> : appointments.length ? <div className="space-y-3">{appointments.map((appointment) => <Card key={appointment._id} className="rounded-2xl"><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{isDoctor ? appointment.patient?.name : `Dr. ${appointment.doctor?.name}`}</h2><Badge className={statusStyle[appointment.status] || ''}>{appointment.status}</Badge><Badge variant="outline">In person</Badge></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{isDoctor ? 'Patient appointment request' : `${appointment.doctor?.organization || 'Clinic'} · ${appointment.doctor?.address?.city || ''}`}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500"><span className="flex items-center gap-1.5"><CalendarDays size={15} />{formatDate(appointment.slot?.startAt)}</span><span className="flex items-center gap-1.5"><Clock3 size={15} />Until {appointment.slot?.endAt ? new Date(appointment.slot.endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}</span>{isDoctor && appointment.patient?.phone && <span>{appointment.patient.phone}</span>}</div>
      </div>
      <div className="flex flex-wrap gap-2">{isDoctor && appointment.status === 'PENDING' && <><Button disabled={actionId === appointment._id} onClick={() => update(appointment, 'CONFIRMED')}>Confirm</Button><Button variant="outline" disabled={actionId === appointment._id} onClick={() => update(appointment, 'REJECTED')}>Decline</Button></>}{isDoctor && appointment.status === 'CONFIRMED' && <Button disabled={actionId === appointment._id} onClick={() => update(appointment, 'COMPLETED')}>Mark completed</Button>}{['PENDING', 'CONFIRMED'].includes(appointment.status) && <Button variant="ghost" disabled={actionId === appointment._id} onClick={() => update(appointment, 'CANCELLED')}>Cancel</Button>}</div>
    </CardContent></Card>)}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No appointments yet</p><p className="mt-1 text-sm text-gray-500">{isDoctor ? 'Requests will appear here when a patient books an available time.' : 'Find a doctor and request an available time to get started.'}</p></CardContent></Card>}
  </div>;
}
