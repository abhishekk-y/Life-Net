import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../socket';
import { AlertTriangle, Zap, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyPage() {
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ type: 'BLOOD', bloodGroup: 'O-', message: '', location: '' });
  const [sent, setSent] = useState(false);

  const handleBroadcast = () => {
    const socket = getSocket();
    if (!socket) {
      toast.error('Socket not connected');
      return;
    }

    socket.emit('emergency:broadcast', {
      type: form.type,
      bloodGroup: form.bloodGroup,
      message: form.message || `🚨 EMERGENCY: ${form.type} (${form.bloodGroup}) needed immediately!`,
      location: form.location,
      senderName: user?.organization || user?.name,
      senderRole: user?.role,
    });

    toast.success('Emergency alert broadcasted!');
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 emergency-pulse">
          <AlertTriangle className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Emergency Alert System</h1>
        <p className="text-text-muted mt-2">Broadcast urgent requests to all connected centers instantly</p>
      </div>

      {/* Emergency Form */}
      <div className="glass-card p-8">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Emergency Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['BLOOD', 'ORGAN'].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({...form, type: t})}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    form.type === t
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-border-light'
                  }`}
                >
                  <Zap className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Blood Group Needed</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setForm({...form, bloodGroup: bg})}
                  className={`p-2.5 rounded-xl border text-sm font-bold transition-all ${
                    form.bloodGroup === bg
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-border-light'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Location</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Hospital / City"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Additional Message</label>
            <textarea
              className="input-dark min-h-[80px] resize-none"
              placeholder="Describe the emergency situation..."
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
            />
          </div>

          <button
            onClick={handleBroadcast}
            disabled={sent}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              sent
                ? 'bg-green/20 text-green border border-green/30'
                : 'bg-gradient-to-r from-accent to-rose-600 text-white hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.01]'
            }`}
          >
            {sent ? (
              <><Radio className="w-5 h-5 animate-pulse" /> Alert Broadcasted!</>
            ) : (
              <><AlertTriangle className="w-5 h-5" /> 🚨 BROADCAST EMERGENCY ALERT</>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-text-muted">
          This alert will be instantly sent to <span className="text-text-primary font-medium">all connected hospitals, blood banks, and procurement centers</span> via real-time WebSocket.
        </p>
      </div>
    </div>
  );
}
