import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../redux/authSlice';
import { Heart, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1">LifeNet</h1>
          <p className="text-text-muted text-sm">Smart Organ & Blood Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h2>
          <p className="text-sm text-text-muted mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="login-email"
                  type="email"
                  className="input-dark pl-10"
                  placeholder="admin@lifenet.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="login-password"
                  type="password"
                  className="input-dark pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 glass-card p-4">
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
            <button onClick={() => setForm({ email: 'admin@lifenet.com', password: 'admin123' })} className="text-left p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="badge badge-danger text-[10px]">Admin</span>
            </button>
            <button onClick={() => setForm({ email: 'hospital@lifenet.com', password: 'hospital123' })} className="text-left p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="badge badge-info text-[10px]">Hospital</span>
            </button>
            <button onClick={() => setForm({ email: 'bloodbank@lifenet.com', password: 'bloodbank123' })} className="text-left p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="badge badge-success text-[10px]">Blood Bank</span>
            </button>
            <button onClick={() => setForm({ email: 'procurement@lifenet.com', password: 'procurement123' })} className="text-left p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="badge badge-purple text-[10px]">Procurement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
