import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { RefreshCw, X, Plus, Truck } from 'lucide-react';

const INITIAL_FORM = { assetId: '', fromBaseId: '', toBaseId: '', quantity: '', transferDate: '', notes: '' };

export default function Transfers() {
  const [transfers, setTransfers]   = useState([]);
  const [bases,     setBases]       = useState([]);
  const [assets,    setAssets]      = useState([]);
  const [form,      setForm]        = useState(INITIAL_FORM);
  const [showForm,  setShowForm]    = useState(false);
  const [filters,   setFilters]     = useState({ startDate: '', endDate: '', baseId: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    api.get(`/transfers?${p}`)
      .then(r => setTransfers(r.data.transfers || []))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/bases').then(r => setBases(r.data)).catch(() => {});
    api.get('/bases/assets').then(r => setAssets(r.data)).catch(() => {});
  }, []);

  useEffect(load, [filters]);

  const submit = async () => {
    if (!form.assetId || !form.fromBaseId || !form.toBaseId || !form.quantity) {
      toast.error('All fields except notes are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transfers', form);
      toast.success('Transfer recorded successfully');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to record transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"><RefreshCw size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Transfers</h1>
          <p className="page-subtitle">Manage asset movement between bases</p>
        </div>
        <button
          id="new-transfer-btn"
          className="btn btn-primary"
          onClick={() => setShowForm(s => !s)}
        >
          {showForm ? <><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cancel</> : <><Plus size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> New Transfer</>}
        </button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3 className="form-box-title">Record Asset Transfer</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Asset *</label>
              <select id="tr-asset" className="form-select" value={form.assetId}
                onChange={e => setForm({ ...form, assetId: e.target.value })}>
                <option value="">Select Asset</option>
                {assets.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">From Base *</label>
              <select id="tr-from" className="form-select" value={form.fromBaseId}
                onChange={e => setForm({ ...form, fromBaseId: e.target.value, toBaseId: '' })}>
                <option value="">Select Source</option>
                {bases.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">To Base *</label>
              <select id="tr-to" className="form-select" value={form.toBaseId}
                onChange={e => setForm({ ...form, toBaseId: e.target.value })}>
                <option value="">Select Destination</option>
                {bases.filter(b => b._id !== form.fromBaseId).map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Quantity *</label>
              <input id="tr-qty" className="form-input" type="number" min="1" placeholder="e.g. 10"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Transfer Date</label>
              <input id="tr-date" className="form-input" type="date"
                value={form.transferDate} onChange={e => setForm({ ...form, transferDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Notes</label>
              <input id="tr-notes" className="form-input" placeholder="Optional notes"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button id="tr-submit" className="btn btn-primary" onClick={submit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            {submitting ? 'Saving…' : <><Truck size={16} /> Submit Transfer</>}
          </button>
        </div>
      )}

      <div className="filter-bar">
        <input className="form-input" type="date" title="Start Date"
          value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        <input className="form-input" type="date" title="End Date"
          value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        <select className="form-select" value={filters.baseId}
          onChange={e => setFilters({ ...filters, baseId: e.target.value })}>
          <option value="">All Bases</option>
          {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {(filters.startDate || filters.endDate || filters.baseId) && (
          <button className="btn btn-secondary"
            onClick={() => setFilters({ startDate: '', endDate: '', baseId: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['Date', 'Asset', 'From', 'To', 'Qty', 'Status', 'Initiated By', 'Notes'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><RefreshCw size={48} /></div>
                    <div className="empty-state-text">No transfers yet. Initiate your first transfer above.</div>
                  </div>
                </td>
              </tr>
            ) : transfers.map(t => (
              <tr key={t._id}>
                <td>{t.transferDate ? format(new Date(t.transferDate), 'dd MMM yyyy') : '—'}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.assetId?.name || '—'}</td>
                <td>{t.fromBaseId?.name || '—'}</td>
                <td>{t.toBaseId?.name || '—'}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--accent-light)' }}>
                  {t.quantity?.toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge-${t.status}`}>{t.status}</span>
                </td>
                <td>{t.initiatedBy?.name || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontStyle: t.notes ? 'normal' : 'italic' }}>
                  {t.notes || 'No notes'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
