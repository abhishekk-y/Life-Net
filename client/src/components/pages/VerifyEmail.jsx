import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, MailCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../ui/button';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (token) {
        const result = await api.auth.verifyEmail(token);
        setMessage(result.message || 'Email verified. You can now sign in.');
        setVerified(true);
      } else {
        const result = await api.auth.resendEmailVerification(email);
        setMessage(result.message || 'If the account needs email verification, instructions will be sent shortly.');
      }
    } catch (requestError) {
      setError(requestError.message || 'We could not verify that email. Request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f5f7f6] p-4 text-gray-900 dark:bg-gray-950 dark:text-white">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-7 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><Heart className="h-5 w-5 text-teal-700 dark:text-teal-300" fill="currentColor" /> LifeNet</Link>
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><MailCheck aria-hidden="true" className="h-5 w-5" /></div>
        <h1 className="text-2xl font-semibold">{verified ? 'Email verified' : token ? 'Verify your email' : 'Resend verification email'}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{verified ? 'Your email is confirmed. You can sign in now.' : message || (token ? 'Confirm the email address you used to register.' : 'Enter your registration email and we’ll send another verification link if needed.')}</p>
        {!verified && !message && <form onSubmit={submit} className="mt-7 space-y-4">
          {!token && <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="verification-email">Email</label>
            <input id="verification-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-gray-700 dark:bg-gray-950" />
          </div>}
          {error && <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loading ? 'Please wait…' : token ? 'Verify email' : 'Send verification link'}</Button>
        </form>}
        <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to sign in</Link>
      </section>
    </main>
  );
}
