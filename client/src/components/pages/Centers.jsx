import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { api } from '../../lib/api';
import { useAuth } from '../AuthContext';
import {
  Building2, Check, Droplets, Heart, Loader2, Mail, MapPin,
  Phone, RefreshCw, Search, ShieldCheck, X, Stethoscope, Pill, Truck,
} from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS = {
  DOCTOR: 'Doctor / clinician',
  HOSPITAL: 'Hospital',
  PHARMACY: 'Pharmacy',
  SUPPLIER: 'Healthcare supplier',
  BLOOD_BANK: 'Blood bank',
  PROCUREMENT_CENTER: 'Organ procurement center',
};

const roleIcon = {
  DOCTOR: Stethoscope,
  HOSPITAL: Building2,
  PHARMACY: Pill,
  SUPPLIER: Truck,
  BLOOD_BANK: Droplets,
  PROCUREMENT_CENTER: Heart,
};

export function Centers() {
  const { user } = useAuth();
  const [centers, setCenters] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionId, setActionId] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  const fetchCenters = useCallback(async () => {

    setLoadError('');
    try {
      const data = await api.centers.list();
      setCenters(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(error.message || 'We could not load the center network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCenters(); }, [fetchCenters]);

  const filteredCenters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return centers;
    return centers.filter((center) => [
      center.name,
      center.organization,
      center.email,
      center.address?.city,
      center.address?.state,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [centers, search]);

  const updateVerification = async (centerId, status) => {
    setActionId(centerId);
    try {
      await api.centers.setVerification(centerId, status);
      toast.success(status === 'APPROVED' ? 'Provider approved.' : 'Provider application declined.');
      await fetchCenters();
    } catch (error) {
      toast.error(error.message || 'We could not update this center.');
    } finally {
      setActionId('');
    }
  };

  const summary = isAdmin
    ? `${centers.filter((center) => center.verificationStatus === 'PENDING').length} provider applications to review`
    : `${centers.length} approved organizations in your network`;

  return (
    <section className="space-y-7 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">LifeNet network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Partner applications</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{summary}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCenters} disabled={loading} className="h-10 rounded-xl border-gray-300 dark:border-gray-700">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </header>

      <div className="relative max-w-lg">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input aria-label="Search organizations" placeholder="Search by provider, email, or city" className="h-11 rounded-xl border-gray-300 bg-white pl-10 dark:border-gray-700 dark:bg-gray-900" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {loadError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={fetchCenters}>Try again</Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading centers">
          {[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />)}
        </div>
      ) : !loadError && filteredCenters.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCenters.map((center) => {
            const Icon = roleIcon[center.role] || Building2;
            const verificationStatus = center.verificationStatus || 'APPROVED';
            const isPending = verificationStatus === 'PENDING';
            const city = [center.address?.city, center.address?.state].filter(Boolean).join(', ');

            return (
              <Card key={center._id} className="rounded-2xl border-gray-200 bg-white shadow-none transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0eb] text-[#386e59] dark:bg-emerald-950/50 dark:text-emerald-200"><Icon size={19} /></span>
                    <Badge variant="outline" className={`rounded-lg ${isPending ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : verificationStatus === 'REJECTED' ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>
                      {verificationStatus === 'APPROVED' ? 'Approved' : verificationStatus === 'PENDING' ? 'Review needed' : 'Declined'}
                    </Badge>
                  </div>
                  <p className="mt-5 text-xs font-medium text-gray-500 dark:text-gray-400">{ROLE_LABELS[center.role] || 'Healthcare center'}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{center.organization || center.name}</h2>
                  {center.organization && center.name !== center.organization && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{center.name}</p>}

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    {center.email && <a href={`mailto:${center.email}`} className="flex items-center gap-2 hover:text-blue-700 dark:hover:text-blue-300"><Mail size={14} className="shrink-0 text-gray-400" /><span className="truncate">{center.email}</span></a>}
                    {center.phone && <a href={`tel:${center.phone}`} className="flex items-center gap-2 hover:text-blue-700 dark:hover:text-blue-300"><Phone size={14} className="shrink-0 text-gray-400" /><span>{center.phone}</span></a>}
                    {city && <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-gray-400" /><span>{city}</span></p>}
                    {isAdmin && center.providerDetails?.registrationNumber && <p className="text-xs text-gray-500">License / registration: {center.providerDetails.registrationNumber}</p>}
                  </div>

                  {isAdmin && (
                    <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                      {verificationStatus !== 'APPROVED' && <Button size="sm" disabled={actionId === center._id} onClick={() => updateVerification(center._id, 'APPROVED')} className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800"><Check size={14} className="mr-1.5" /> Approve</Button>}
                      {verificationStatus !== 'REJECTED' && <Button size="sm" variant="outline" disabled={actionId === center._id} onClick={() => updateVerification(center._id, 'REJECTED')} className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"><X size={14} className="mr-1.5" /> Decline</Button>}
                      {actionId === center._id && <Loader2 size={16} className="animate-spin self-center" aria-label="Saving review" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !loadError ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-5 py-14 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <Building2 className="mx-auto h-9 w-9 text-gray-400" />
          <h2 className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-200">{centers.length ? 'No centers match this search' : isAdmin ? 'No center applications yet' : 'No approved centers yet'}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">{centers.length ? 'Try another provider, email, or city.' : isAdmin ? 'New provider applications will appear here for review.' : 'Approved participating organizations will appear here.'}</p>
        </div>
      ) : null}
    </section>
  );
}
