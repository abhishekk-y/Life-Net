import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Heart, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'HOSPITAL',
  organization: '',
  phone: '',
  address: { city: '', state: '', country: 'India' },
  providerDetails: { specialty: '', qualification: '', registrationNumber: '' },
};

const REGISTRATION_LABELS = {
  DOCTOR: 'Medical registration number',
  HOSPITAL: 'Hospital / facility registration number',
  PHARMACY: 'Pharmacy drug license number',
  SUPPLIER: 'Supplier registration or business license number',
  BLOOD_BANK: 'Blood bank license / authorization number',
  PROCUREMENT_CENTER: 'Transplant center authorization number',
};

export function Register() {
  const [form, setForm] = useState(initialForm);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateAddress = (field, value) => setForm((current) => ({
    ...current,
    address: { ...current.address, [field]: value },
  }));
  const updateProvider = (field, value) => setForm((current) => ({
    ...current,
    providerDetails: { ...current.providerDetails, [field]: value },
  }));
  const isPatient = form.role === 'PATIENT';
  const isDoctor = form.role === 'DOCTOR';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      toast.success(isPatient ? 'Account created. Check your email to verify it before signing in.' : 'Application received. Verify your email, then wait for administrator review.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'We could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-700 dark:text-gray-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white"><Heart size={18} fill="currentColor" /></span>
          LifeNet
        </Link>
        <Card className="overflow-hidden rounded-3xl border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="grid gap-0 p-0 md:grid-cols-[0.8fr_1.2fr]">
            <section className="bg-[#eaf2ef] p-7 dark:bg-gray-800/80 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-800 dark:text-blue-300">Network onboarding</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">Join the LifeNet care network.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
                Patients can create an account directly. Healthcare providers submit their credentials for review before receiving access to operational tools.
              </p>
              <div className="mt-9 flex gap-3 rounded-2xl border border-blue-900/10 bg-white/70 p-4 text-sm leading-6 text-gray-700 dark:border-white/10 dark:bg-gray-900/50 dark:text-gray-200">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" />
                <span>{isPatient ? 'Confirm your email to activate the account. Do not add emergency or clinical details to your profile.' : 'Confirm your email first. Provider access then starts after an administrator reviews the organization and registration details you submit.'}</span>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-9">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Create your account</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All accounts confirm email first. Provider accounts also need organization and license details for admin review.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Contact name</Label>
                  <Input id="register-name" autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} required minLength={2} maxLength={100} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-role">Account type</Label>
                  <select id="register-role" value={form.role} onChange={(event) => update('role', event.target.value)} className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800">
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor / clinician</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="SUPPLIER">Healthcare supplier</option>
                    <option value="BLOOD_BANK">Blood bank</option>
                    <option value="PROCUREMENT_CENTER">Organ procurement center</option>
                  </select>
                </div>
                {!isPatient && <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="register-org">{isDoctor ? 'Practice or hospital' : 'Organization name'}</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input id="register-org" className="pl-9" value={form.organization} onChange={(event) => update('organization', event.target.value)} required minLength={2} maxLength={160} />
                  </div>
                </div>}
                {isDoctor && <>
                  <div className="space-y-2">
                    <Label htmlFor="register-specialty">Specialty</Label>
                    <Input id="register-specialty" value={form.providerDetails.specialty} onChange={(event) => updateProvider('specialty', event.target.value)} required maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-qualification">Qualification</Label>
                    <Input id="register-qualification" value={form.providerDetails.qualification} onChange={(event) => updateProvider('qualification', event.target.value)} required maxLength={160} />
                  </div>
                </>}
                {!isPatient && <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="register-registration">{REGISTRATION_LABELS[form.role] || 'License / registration number'}</Label>
                  <Input id="register-registration" value={form.providerDetails.registrationNumber} onChange={(event) => updateProvider('registrationNumber', event.target.value)} required maxLength={100} autoComplete="off" />
                  <p className="text-xs text-gray-500">LifeNet administrators review this identifier before enabling provider tools. It is not shown in public provider listings.</p>
                </div>}
                <div className="space-y-2">
                  <Label htmlFor="register-email">{isPatient ? 'Email' : 'Work email'}</Label>
                  <Input id="register-email" type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone</Label>
                  <Input id="register-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-city">City</Label>
                  <Input id="register-city" autoComplete="address-level2" value={form.address.city} onChange={(event) => updateAddress('city', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-state">State</Label>
                  <Input id="register-state" autoComplete="address-level1" value={form.address.state} onChange={(event) => updateAddress('state', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} required minLength={12} />
                  <p className="text-xs text-gray-500">Use at least 12 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirm password</Label>
                  <Input id="register-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={12} />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl bg-blue-700 hover:bg-blue-800">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isPatient ? 'Create patient account' : 'Submit provider application'}
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already approved? <Link to="/login" className="font-semibold text-blue-700 hover:underline dark:text-blue-300">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
