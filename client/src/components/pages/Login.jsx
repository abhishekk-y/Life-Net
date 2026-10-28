import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Loader2, Moon, ShieldCheck, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeProvider';

export function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      await login(String(formData.get('email')).trim(), String(formData.get('password')));
      toast.success('You are signed in.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] p-4 text-gray-900 dark:bg-gray-950 dark:text-white sm:p-8">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_26px_90px_-50px_rgba(15,35,31,.45)] dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#102f34] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -right-32 -top-24 h-96 w-96 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-10 top-12 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Heart size={21} fill="currentColor" /></span>
            <span className="text-xl font-semibold tracking-tight">LifeNet</span>
          </div>
          <div className="relative max-w-md pb-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-100">
              <ShieldCheck size={14} /> A reviewed care network
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Coordination that keeps the next step clear.</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-emerald-50/75">Patients reach providers approved for LifeNet. Care organizations keep inventory, appointments, and requests moving.</p>
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-emerald-50/70">
              <span>Reviewed providers</span><span>Inventory freshness</span><span>Recorded actions</span>
            </div>
          </div>
          <p className="relative text-xs text-emerald-50/50">LifeNet supports coordination. Clinical decisions remain with qualified professionals.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-14 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white"><Heart size={18} fill="currentColor" /></span> LifeNet
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-800 dark:text-blue-300">LifeNet account</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Use the email and password you registered with. Provider accounts need approval before sign-in.</p>

            <Card className="mt-8 rounded-2xl border-gray-200 shadow-none dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="p-6 sm:p-7">
                {errorMessage && (
                  <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required className="h-11 rounded-xl" />
                    <div className="text-right"><Link to="/reset-password" className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300">Forgot password?</Link></div>
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-xl bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Sign in
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              New to LifeNet? <Link to="/register" className="font-semibold text-blue-700 hover:underline dark:text-blue-300">Create an account</Link>
            </p>
            <p className="mt-3 text-center text-sm"><Link to="/verify-email" className="font-semibold text-blue-700 hover:underline dark:text-blue-300">Resend email verification</Link></p>
            <p className="mt-7 text-center text-xs leading-5 text-gray-400">Verify your email before signing in. Provider accounts also need administrator approval.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
