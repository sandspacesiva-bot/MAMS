import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Package, X, Save, Plus } from 'lucide-react';

const INITIAL_FORM = { assetId: '', baseId: '', quantity: '', unitCost: '', purchaseDate: '', notes: '' };

export default function Purchases() {
  const { user }                      = useAuth();
  const [purchases, setPurchases]     = useState([]);
  const [bases,     setBases]         = useState([]);
  const [assets,    setAssets]        = useState([]);
  const [filters,   setFilters]       = useState({ startDate: '', endDate: '', assetType: '' });
  const [form,      setForm]          = useState(INITIAL_FORM);
  const [showForm,  setShowForm]      = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const load = () => {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    api.get(`/purchases?${p}`)
      .then(r => setPurchases(r.data.purchases || []))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/bases').then(r => setBases(r.data)).catch(() => {});
    api.get('/bases/assets').then(r => setAssets(r.data)).catch(() => {});
  }, []);

  useEffect(load, [filters]);

  const submit = async () => {
    if (!form.assetId || !form.quantity) {
      toast.error('Asset and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/purchases', form);
      toast.success('Purchase recorded successfully');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const badgeClass = (type) => `badge badge-${type}`;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Package size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Purchases</h1>
          <p className="page-subtitle">Record and track asset acquisitions</p>
        </div>
        <button
          id="new-purchase-btn"
          className="btn btn-primary"
          onClick={() => setShowForm(s => !s)}
        >
          {showForm ? <><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cancel</> : <><Plus size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> New Purchase</>}
        </button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3 className="form-box-title">Record Asset Purchase</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Asset *</label>
              <select id="pur-asset" className="form-select" value={form.assetId}
                onChange={e => setForm({ ...form, assetId: e.target.value })}>
                <option value="">Select Asset</option>
                {assets.map(a => (
                  <option key={a._id} value={a._id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
            {user.role === 'admin' && (
              <div className="form-field">
                <label className="form-label">Base *</label>
                <select id="pur-base" className="form-select" value={form.baseId}
                  onChange={e => setForm({ ...form, baseId: e.target.value })}>
                  <option value="">Select Base</option>
                  {bases.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field">
              <label className="form-label">Quantity *</label>
              <input id="pur-qty" className="form-input" type="number" min="1" placeholder="e.g. 50"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Unit Cost ($)</label>
              <input id="pur-cost" className="form-input" type="number" min="0" step="0.01" placeholder="e.g. 1200"
                value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Purchase Date *</label>
              <input id="pur-date" className="form-input" type="date"
                value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Notes</label>
              <input id="pur-notes" className="form-input" placeholder="Optional notes"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button id="pur-submit" className="btn btn-primary" onClick={submit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            {submitting ? 'Saving…' : <><Save size={16} /> Record Purchase</>}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <input className="form-input" type="date" title="Start Date"
          value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        <input className="form-input" type="date" title="End Date"
          value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        <select className="form-select" value={filters.assetType}
          onChange={e => setFilters({ ...filters, assetType: e.target.value })}>
          <option value="">All Asset Types</option>
          {['vehicle', 'weapon', 'ammunition', 'equipment'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        {(filters.startDate || filters.endDate || filters.assetType) && (
          <button className="btn btn-secondary"
            onClick={() => setFilters({ startDate: '', endDate: '', assetType: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['Date', 'Asset', 'Type', 'Base', 'Qty', 'Unit Cost', 'Total', 'Recorded By', 'Notes'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Package size={48} /></div>
                    <div className="empty-state-text">No purchases found. Record your first purchase above.</div>
                  </div>
                </td>
              </tr>
            ) : purchases.map(p => (
              <tr key={p._id}>
                <td>{p.purchaseDate ? format(new Date(p.purchaseDate), 'dd MMM yyyy') : '—'}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.asset?.name || '—'}</td>
                <td><span className={badgeClass(p.asset?.type)}>{p.asset?.type}</span></td>
                <td>{p.base?.name || '—'}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--accent-light)' }}>
                  {p.quantity?.toLocaleString()}
                </td>
                <td>${p.unitCost?.toLocaleString() ?? 0}</td>
                <td style={{ color: 'var(--success)' }}>
                  ${((p.quantity || 0) * (p.unitCost || 0)).toLocaleString()}
                </td>
                <td>{p.recorder?.name || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontStyle: p.notes ? 'normal' : 'italic' }}>
                  {p.notes || 'No notes'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
