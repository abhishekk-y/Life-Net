import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, KeyRound, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../ui/button';

export function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (token && password !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (token) {
        await api.auth.resetPassword({ token, newPassword: password });
        setComplete(true);
      } else {
        await api.auth.requestPasswordReset(email);
        setSubmitted(true);
      }
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f5f7f6] p-4 text-gray-900 dark:bg-gray-950 dark:text-white">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-7 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><Heart className="h-5 w-5 text-teal-700 dark:text-teal-300" fill="currentColor" /> LifeNet</Link>
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><KeyRound aria-hidden="true" className="h-5 w-5" /></div>
        <h1 className="text-2xl font-semibold">{complete ? 'Password updated' : token ? 'Choose a new password' : 'Reset your password'}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {complete ? 'Your password is reset. Sign in with the new password.' : token ? 'Enter a new password with at least 12 characters.' : submitted ? 'If an active account exists for that email, reset instructions will arrive shortly.' : 'Enter your account email and we’ll send a secure reset link if an active account matches.'}
        </p>
        {!submitted && !complete && <form onSubmit={submit} className="mt-7 space-y-4">
          {token ? <>
            <label className="block text-sm font-medium" htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950" />
            <label className="block text-sm font-medium" htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950" />
          </> : <>
            <label className="block text-sm font-medium" htmlFor="reset-email">Email</label>
            <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950" />
          </>}
          {error && <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loading ? 'Please wait…' : token ? 'Set new password' : 'Send reset link'}</Button>
        </form>}
        <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to sign in</Link>
      </section>
    </main>
  );
}
