import { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, MapPin, Phone, RefreshCw, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

export function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [filters, setFilters] = useState({ search: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.centers.hospitals(filters);
      setHospitals(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'We could not load the hospital directory.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadHospitals(); }, [loadHospitals]);

  const handleSearch = (event) => {
    event.preventDefault();
    setFilters({ search, city });
  };

  const clearSearch = () => {
    setSearch('');
    setCity('');
    setFilters({ search: '', city: '' });
  };

  return (
    <section className="animate-fade-in space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Care network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Find a hospital</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">Browse approved hospitals participating in LifeNet. Contact each facility to confirm its services, hours, and availability.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadHospitals} disabled={loading} className="h-10 rounded-xl border-gray-300 dark:border-gray-700">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
        </Button>
      </header>

      <form onSubmit={handleSearch} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto_auto] sm:items-end">
        <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          Hospital or area
          <span className="relative block">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, city, or state" className="h-11 rounded-xl pl-10" maxLength={100} />
          </span>
        </label>
        <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          City
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Any city" className="h-11 rounded-xl" maxLength={100} />
        </label>
        <Button type="submit" disabled={loading} className="h-11 rounded-xl bg-blue-700 px-5 hover:bg-blue-800">Search hospitals</Button>
        <Button type="button" variant="ghost" onClick={clearSearch} disabled={loading && !filters.search && !filters.city} className="h-11 rounded-xl">Clear</Button>
      </form>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={loadHospitals}>Try again</Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading hospitals">
          {[0, 1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />)}
        </div>
      ) : !error && hospitals.length ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">{hospitals.length} {hospitals.length === 1 ? 'hospital' : 'hospitals'} found{hospitals.length === 100 ? ' (showing the first 100)' : ''}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hospitals.map((hospital) => {
              const location = [hospital.address?.city, hospital.address?.state, hospital.address?.country].filter(Boolean).join(', ');
              const name = hospital.organization || hospital.name;
              return (
                <Card key={hospital._id} className="rounded-2xl border-gray-200 bg-white shadow-none dark:border-gray-800 dark:bg-gray-900">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200"><Building2 size={19} /></span>
                      <Badge variant="outline" className="rounded-lg border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">Approved</Badge>
                    </div>
                    <h2 className="mt-5 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{name}</h2>
                    {hospital.name !== name && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hospital.name}</p>}
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {location && <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-gray-400" /><span>{location}</span></p>}
                      {hospital.phone && <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 hover:text-blue-700 dark:hover:text-blue-300"><Phone size={14} className="shrink-0 text-gray-400" /><span>{hospital.phone}</span></a>}
                      {!location && !hospital.phone && <p className="text-gray-500 dark:text-gray-400">Contact details have not been added.</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : !error ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-5 py-14 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <Building2 className="mx-auto h-9 w-9 text-gray-400" />
          <h2 className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-200">No hospitals found</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">Try a different name or city. Only active hospitals approved for the LifeNet network appear here.</p>
        </div>
      ) : null}
    </section>
  );
}
