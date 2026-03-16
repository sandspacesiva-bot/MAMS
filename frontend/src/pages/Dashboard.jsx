import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import api from '../api/axios';
import NetMovementModal from '../components/NetMovementModal';
import { Flag, Pin, TrendingUp, User, Flame, LayoutDashboard, X, TrendingDown } from 'lucide-react';

const BAR_COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#a78bfa'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', baseId: '', assetType: '' });
  const [bases,   setBases]   = useState([]);
  const [modal,   setModal]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bases').then(r => setBases(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    api.get(`/dashboard/metrics?${params}`)
      .then(r => setMetrics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const chartData = useMemo(() => metrics ? [
    { name: 'Purchases',    value: metrics.breakdown?.purchases  ?? 0 },
    { name: 'Transfer In',  value: metrics.breakdown?.transferIn  ?? 0 },
    { name: 'Transfer Out', value: metrics.breakdown?.transferOut ?? 0 },
    { name: 'Assigned',     value: metrics.assigned ?? 0 },
    { name: 'Expended',     value: metrics.expended ?? 0 },
  ] : [], [metrics]);

  const metricCards = useMemo(() => [
    { title: 'Opening Balance', value: metrics?.openingBalance ?? 0, color: '#94a3b8', icon: <Flag size={18} />, help: null },
    { title: 'Closing Balance', value: metrics?.closingBalance ?? 0, color: '#22d3ee', icon: <Pin size={18} />, help: null },
    { title: 'Net Movement',    value: metrics?.netMovement    ?? 0, color: '#f59e0b', icon: <TrendingUp size={18} />, help: 'Click to see breakdown', onClick: () => setModal(true) },
    { title: 'Assigned',        value: metrics?.assigned       ?? 0, color: '#10b981', icon: <User size={18} />, help: null },
    { title: 'Expended',        value: metrics?.expended       ?? 0, color: '#ef4444', icon: <Flame size={18} />, help: null },
  ], [metrics]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Dashboard</h1>
          <p className="page-subtitle">Real-time asset movement metrics across all bases</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          id="dash-start-date"
          className="form-input"
          type="date"
          title="Start Date"
          value={filters.startDate}
          onChange={e => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          id="dash-end-date"
          className="form-input"
          type="date"
          title="End Date"
          value={filters.endDate}
          onChange={e => setFilters({ ...filters, endDate: e.target.value })}
        />
        <select
          id="dash-base-filter"
          className="form-select"
          value={filters.baseId}
          onChange={e => setFilters({ ...filters, baseId: e.target.value })}
        >
          <option value="">All Bases</option>
          {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select
          id="dash-type-filter"
          className="form-select"
          value={filters.assetType}
          onChange={e => setFilters({ ...filters, assetType: e.target.value })}
        >
          <option value="">All Asset Types</option>
          {['vehicle', 'weapon', 'ammunition', 'equipment'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        {(filters.startDate || filters.endDate || filters.baseId || filters.assetType) && (
          <button
            className="btn btn-secondary"
            onClick={() => setFilters({ startDate: '', endDate: '', baseId: '', assetType: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="metric-cards">
        {metricCards.map(card => (
          <div
            key={card.title}
            className="metric-card"
            style={{ '--card-color': card.color, cursor: card.onClick ? 'pointer' : 'default' }}
            onClick={card.onClick}
            title={card.help || ''}
          >
            <div className="metric-label">{card.icon} {card.title}</div>
            <div className="metric-value">
              {loading ? '…' : card.value.toLocaleString()}
            </div>
            {card.help && (
              <div className="metric-sub">{card.help}</div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-container">
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingDown size={20} /> Asset Movement Overview</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading chart…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,48,80,0.7)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #1f3050',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: 13,
                }}
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={60}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {modal && (
        <NetMovementModal data={metrics?.breakdown} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
