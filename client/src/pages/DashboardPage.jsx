import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchActivity, fetchAnalytics } from '../redux/dashboardSlice';
import { Heart, Droplets, FileText, Activity, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#a78bfa'];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, activity, analytics, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchActivity());
    if (user?.role === 'ADMIN') {
      dispatch(fetchAnalytics());
    }
  }, [dispatch, user]);

  const statCards = stats ? [
    { label: 'Available Organs', value: stats.organs?.available || 0, total: stats.organs?.total, icon: Heart, color: 'stat-card-red', iconColor: 'text-accent' },
    { label: 'Blood Units', value: stats.blood?.available || 0, total: stats.blood?.total, icon: Droplets, color: 'stat-card-blue', iconColor: 'text-blue' },
    { label: 'Pending Requests', value: stats.requests?.pending || 0, total: stats.requests?.total, icon: FileText, color: 'stat-card-amber', iconColor: 'text-amber' },
    { label: 'Success Rate', value: `${stats.requests?.successRate || 0}%`, icon: TrendingUp, color: 'stat-card-green', iconColor: 'text-green' },
    { label: 'Emergency Active', value: stats.requests?.emergency || 0, icon: AlertTriangle, color: 'stat-card-red', iconColor: 'text-accent' },
    { label: 'Active Users', value: stats.users?.total || 0, icon: Users, color: 'stat-card-purple', iconColor: 'text-purple' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card p-3 text-xs border border-border">
          <p className="text-text-primary font-medium">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="mt-1">{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`glass-card p-5 ${card.color}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              {card.total !== undefined && (
                <span className="text-xs text-text-muted">/ {card.total}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            <p className="text-xs text-text-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Trend Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Request Trends (30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.requestsTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Total" stroke="#e11d48" fill="url(#colorCount)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#colorCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Blood Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Blood Group Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.bloodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Units" radius={[6, 6, 0, 0]}>
                  {analytics.bloodDistribution?.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Request Status Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Request Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {analytics.statusBreakdown?.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {analytics.statusBreakdown?.map((item, i) => (
                <span key={i} className="flex items-center gap-1 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {item._id}
                </span>
              ))}
            </div>
          </div>

          {/* Organ Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Organ Availability</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.organDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="available" name="Available" fill="#10b981" radius={[0, 6, 6, 0]} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[0, 6, 6, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activity.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No recent activity</p>
          )}
          {activity.map((log, i) => (
            <div key={log._id || i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{log.performedBy?.name || 'System'}</span>{' '}
                  <span className="text-text-muted">{formatAction(log.action)}</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="badge badge-info text-[10px]">{log.action?.split('_')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatAction(action) {
  const map = {
    USER_REGISTER: 'registered a new account',
    USER_LOGIN: 'logged in',
    USER_LOGOUT: 'logged out',
    ORGAN_CREATED: 'added a new organ',
    ORGAN_UPDATED: 'updated an organ record',
    BLOOD_CREATED: 'added blood units',
    BLOOD_UPDATED: 'updated blood inventory',
    REQUEST_CREATED: 'created a new request',
    REQUEST_APPROVED: 'approved a request',
    REQUEST_REJECTED: 'rejected a request',
    REQUEST_COMPLETED: 'completed a request',
    EMERGENCY_BROADCAST: 'sent an emergency alert',
  };
  return map[action] || action?.toLowerCase().replace(/_/g, ' ');
}
