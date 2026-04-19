import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/authSlice';
import { Heart, Mail, Lock, User, Building2, ArrowRight, Loader2 } from 'lucide-react';

const ROLES = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'BLOOD_BANK', label: 'Blood Bank' },
  { value: 'PROCUREMENT_CENTER', label: 'Procurement Center' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'HOSPITAL', organization: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Join LifeNet</h1>
          <p className="text-text-muted text-sm">Create your account</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input id="register-name" type="text" className="input-dark pl-10" placeholder="Dr. Jane Doe" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input id="register-email" type="email" className="input-dark pl-10" placeholder="you@hospital.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input id="register-password" type="password" className="input-dark pl-10" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
              <select id="register-role" className="input-dark" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Organization</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input id="register-org" type="text" className="input-dark pl-10" placeholder="Hospital / Blood Bank name" value={form.organization} onChange={(e) => setForm({...form, organization: e.target.value})} />
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account? <Link to="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
