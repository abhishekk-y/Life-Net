import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { useAuth } from '../AuthContext';

export function Settings() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India',
    },
  }));
  const [savingProfile, setSavingProfile] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateProfileField = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('address.')) {
      const key = name.slice('address.'.length);
      setProfile((current) => ({ ...current, address: { ...current.address, [key]: value } }));
      return;
    }
    setProfile((current) => ({ ...current, [name]: value }));
  };
  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      toast.success('Your contact details have been updated.');
    } catch (error) {
      toast.error(error.message || 'Could not update your contact details.');
    } finally {
      setSavingProfile(false);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('The new passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const result = await api.auth.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      localStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new CustomEvent('lifenet:token-refreshed', { detail: result.accessToken }));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Your password has been changed.');
    } catch (error) {
      toast.error(error.message || 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
    { name: 'newPassword', label: 'New password', autoComplete: 'new-password', minLength: 12 },
    { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password', minLength: 12 },
  ];

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Security settings</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Change your password to keep your LifeNet account secure.</p>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6"><h2 className="font-semibold text-gray-900 dark:text-white">Contact details</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update the details LifeNet uses to identify and contact your account.</p></div>
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          {[['name', 'Full name'], ['phone', 'Phone'], ['address.street', 'Street'], ['address.city', 'City'], ['address.state', 'State'], ['address.zipCode', 'Postal code'], ['address.country', 'Country']].map(([name, label]) => {
            const value = name.startsWith('address.') ? profile.address[name.slice(8)] : profile[name];
            return <div key={name}>
              <label htmlFor={`profile-${name}`} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
              <input id={`profile-${name}`} name={name} value={value} onChange={updateProfileField} required={name === 'name'} maxLength={name === 'name' ? 100 : 160} autoComplete={name === 'name' ? 'name' : name === 'phone' ? 'tel' : 'street-address'} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
            </div>;
          })}
          <div className="sm:col-span-2"><Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save contact details'}</Button></div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><ShieldCheck aria-hidden="true" className="h-5 w-5" /></div>
          <div><h2 className="font-semibold text-gray-900 dark:text-white">Change password</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Use at least 12 characters. You’ll stay signed in on this device.</p></div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {fields.map(({ name, label, autoComplete, minLength }) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
              <input id={name} name={name} type="password" autoComplete={autoComplete} minLength={minLength} required value={form[name]} onChange={update} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <KeyRound aria-hidden="true" className="h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Other sessions will need to sign in again when their current access token expires.</p>
          </div>
          <Button type="submit" disabled={saving} className="mt-2">{saving ? 'Updating…' : 'Update password'}</Button>
        </form>
      </div>
    </section>
  );
}
