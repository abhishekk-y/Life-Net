import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Search, ShieldCheck, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const blankProfile = { specialty: '', qualification: '', experienceYears: 0, consultationFee: 0, bio: '', languages: [], address: { city: '', state: '', country: 'India' }, acceptingAppointments: true };
const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(blankProfile);
  const [slots, setSlots] = useState({});
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [slotForm, setSlotForm] = useState({ startAt: '', endAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState('');
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  const loadDoctors = useCallback(async (search = '', cityName = '') => {
    
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (cityName.trim()) params.set('city', cityName.trim());
      const data = await api.doctors.list(params.toString());
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Could not load the doctor directory.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isDoctor) {
      Promise.all([api.doctors.myProfile(), api.doctors.mySlots()]).then(([saved, mySlots]) => {
        setProfile({ ...blankProfile, ...saved, specialty: saved?.specialty || user?.providerDetails?.specialty || '', qualification: saved?.qualification || user?.providerDetails?.qualification || '', address: { ...blankProfile.address, city: user?.address?.city || '', ...(saved?.address || {}) } });
        setSlots({ mine: mySlots || [] });
      }).catch((error) => toast.error(error.message || 'Could not load your profile.')).finally(() => setLoading(false));
    } else {
      loadDoctors();
    }
  }, [isDoctor, loadDoctors, user]);

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const updateProfileAddress = (field, value) => setProfile((current) => ({ ...current, address: { ...current.address, [field]: value } }));

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const saved = await api.doctors.saveProfile({ ...profile, experienceYears: Number(profile.experienceYears), consultationFee: Number(profile.consultationFee), languages: typeof profile.languages === 'string' ? profile.languages.split(',').map((value) => value.trim()).filter(Boolean) : profile.languages });
      setProfile((current) => ({ ...current, ...saved }));
      toast.success('Your doctor profile is saved.');
    } catch (error) { toast.error(error.message || 'Could not save the profile.'); }
    finally { setSaving(false); }
  };

  const addSlot = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      await api.doctors.createSlot({ startAt: new Date(slotForm.startAt).toISOString(), endAt: new Date(slotForm.endAt).toISOString() });
      setSlotForm({ startAt: '', endAt: '' });
      const mySlots = await api.doctors.mySlots();
      setSlots((current) => ({ ...current, mine: mySlots }));
      toast.success('Appointment time published.');
    } catch (error) { toast.error(error.message || 'Could not add this time.'); }
    finally { setSaving(false); }
  };

  const closeSlot = async (id) => {
    setActionId(id);
    try { await api.doctors.closeSlot(id); setSlots((current) => ({ ...current, mine: current.mine.filter((slot) => slot._id !== id) })); toast.success('Availability removed.'); }
    catch (error) { toast.error(error.message || 'Could not remove this time.'); }
    finally { setActionId(''); }
  };

  const showSlots = async (doctorId) => {
    setActionId(doctorId);
    try { const data = await api.doctors.slots(doctorId); setSlots((current) => ({ ...current, [doctorId]: data })); }
    catch (error) { toast.error(error.message || 'Could not load appointment times.'); }
    finally { setActionId(''); }
  };

  const bookSlot = async (doctorId, slotId) => {
    setActionId(slotId);
    try { await api.appointments.book({ doctorId, slotId }); setSlots((current) => ({ ...current, [doctorId]: (current[doctorId] || []).filter((slot) => slot._id !== slotId) })); toast.success('Appointment request sent. Check Appointments for updates.'); }
    catch (error) { toast.error(error.message || 'Could not request this appointment.'); if (error.status === 409) showSlots(doctorId); }
    finally { setActionId(''); }
  };

  const submitSearch = (event) => { event.preventDefault(); loadDoctors(query, city); };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Care directory</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{isDoctor ? 'Your doctor profile' : 'Find a doctor'}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">{isDoctor ? 'Publish accurate profile details and add in-person appointment times you can honour.' : 'Browse clinician profiles approved for LifeNet and request an in-person appointment. Availability is confirmed by the clinic.'}</p>
      </header>

      {isDoctor ? <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl"><CardContent className="p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <h2 className="text-lg font-semibold">Public profile</h2>
            <p className="text-sm text-gray-500">Your professional registration number is reviewed by LifeNet and is never displayed in this directory.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="doctor-specialty">Specialty</Label><Input id="doctor-specialty" required value={profile.specialty || ''} onChange={(e) => updateProfile('specialty', e.target.value)} maxLength={120} /></div>
              <div className="space-y-2"><Label htmlFor="doctor-qualification">Qualification</Label><Input id="doctor-qualification" required value={profile.qualification || ''} onChange={(e) => updateProfile('qualification', e.target.value)} maxLength={160} /></div>
              <div className="space-y-2"><Label htmlFor="doctor-experience">Years of experience</Label><Input id="doctor-experience" type="number" min="0" max="70" required value={profile.experienceYears ?? 0} onChange={(e) => updateProfile('experienceYears', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="doctor-fee">Consultation fee (₹)</Label><Input id="doctor-fee" type="number" min="0" step="1" required value={profile.consultationFee ?? 0} onChange={(e) => updateProfile('consultationFee', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="doctor-city">City</Label><Input id="doctor-city" required value={profile.address?.city || ''} onChange={(e) => updateProfileAddress('city', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="doctor-languages">Languages</Label><Input id="doctor-languages" value={Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages} onChange={(e) => updateProfile('languages', e.target.value)} placeholder="Hindi, English" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="doctor-bio">About your practice</Label><textarea id="doctor-bio" className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" maxLength={1200} value={profile.bio || ''} onChange={(e) => updateProfile('bio', e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={profile.acceptingAppointments !== false} onChange={(e) => updateProfile('acceptingAppointments', e.target.checked)} /> Accept new appointment requests</label>
            </div>
            <Button disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
          </form>
        </CardContent></Card>
        <div className="space-y-6">
          <Card className="rounded-2xl"><CardContent className="p-6">
            <form onSubmit={addSlot} className="space-y-4">
              <div><h2 className="text-lg font-semibold">Offer an appointment time</h2><p className="mt-1 text-sm text-gray-500">Slots are in your device’s local time. Appointments are in-person.</p></div>
              <div className="space-y-2"><Label htmlFor="slot-start">Starts</Label><Input id="slot-start" type="datetime-local" required value={slotForm.startAt} onChange={(e) => setSlotForm((s) => ({ ...s, startAt: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="slot-end">Ends</Label><Input id="slot-end" type="datetime-local" required value={slotForm.endAt} onChange={(e) => setSlotForm((s) => ({ ...s, endAt: e.target.value }))} /></div>
              <Button disabled={saving || !profile.specialty} className="w-full">Add available time</Button>
              {!profile.specialty && <p className="text-xs text-amber-700">Save your doctor profile first to publish availability.</p>}
            </form>
          </CardContent></Card>
          <Card className="rounded-2xl"><CardContent className="p-6">
            <h2 className="text-lg font-semibold">Upcoming availability</h2>
            <div className="mt-4 space-y-2">{(slots.mine || []).filter((slot) => slot.status === 'AVAILABLE').map((slot) => <div key={slot._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"><span className="text-sm">{formatDate(slot.startAt)}</span><Button size="sm" variant="outline" disabled={actionId === slot._id} onClick={() => closeSlot(slot._id)}>Remove</Button></div>)}{!slots.mine?.some((slot) => slot.status === 'AVAILABLE') && <p className="text-sm text-gray-500">No open times. Add one when you are ready.</p>}</div>
          </CardContent></Card>
        </div>
      </div> : <>
        <form onSubmit={submitSearch} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_0.7fr_auto]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Specialty or qualification" aria-label="Search specialty or qualification" /></div>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" aria-label="City" />
          <Button><Search className="mr-2 h-4 w-4" /> Search</Button>
        </form>
        {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading clinician profiles…</p> : doctors.length ? <div className="grid gap-4 lg:grid-cols-2">{doctors.map((item) => {
          const doctorId = item.doctor?._id;
          return <Card key={item._id} className="rounded-2xl"><CardContent className="p-5">
            <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Stethoscope /></div><div><h2 className="font-semibold">Dr. {item.doctor?.name}</h2><p className="text-sm font-medium text-blue-700 dark:text-blue-300">{item.specialty}</p><p className="text-sm text-gray-500">{item.qualification} · {item.experienceYears} years</p></div></div><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Approved provider" />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2"><p className="flex items-center gap-2"><MapPin size={15} />{item.address?.city}{item.address?.state ? `, ${item.address.state}` : ''}</p><p className="flex items-center gap-2"><CalendarDays size={15} />₹{Number(item.consultationFee || 0).toLocaleString('en-IN')} consultation</p><p className="sm:col-span-2">{item.doctor?.organization}</p></div>
            {item.bio && <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.bio}</p>}
            {isPatient && <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800"><Button variant="outline" onClick={() => showSlots(doctorId)} disabled={actionId === doctorId}><Clock3 className="mr-2 h-4 w-4" />{slots[doctorId] ? 'Refresh times' : 'View appointment times'}</Button>
              {slots[doctorId] && <div className="mt-3 space-y-2">{slots[doctorId].length ? slots[doctorId].map((slot) => <div key={slot._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><span className="text-sm">{formatDate(slot.startAt)}</span><Button size="sm" disabled={actionId === slot._id} onClick={() => bookSlot(doctorId, slot._id)}>{actionId === slot._id ? 'Requesting…' : 'Request this time'}</Button></div>) : <p className="text-sm text-gray-500">No open times right now. Try another doctor or check back later.</p>}</div>}
            </div>}
          </CardContent></Card>;
        })}</div> : <Card className="rounded-2xl"><CardContent className="p-10 text-center"><Stethoscope className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-3 font-medium">No approved profiles found</p><p className="mt-1 text-sm text-gray-500">Try a broader specialty or a nearby city.</p></CardContent></Card>}
      </>}
      {!isDoctor && <p className="text-xs leading-5 text-gray-500">LifeNet lists profiles and appointment availability supplied by providers. Confirm clinic details, fees, suitability, and care directly with the provider. This directory does not offer medical advice or emergency services.</p>}
    </div>
  );
}
