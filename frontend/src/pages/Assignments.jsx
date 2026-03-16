import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { User, X, Plus, Save } from 'lucide-react';

const INITIAL_FORM = {
  assetId: '', baseId: '', personnelName: '', personnelId: '',
  quantity: '', type: 'assigned', date: '', notes: ''
};

export default function Assignments() {
  const { user }                        = useAuth();
  const [assignments, setAssignments]   = useState([]);
  const [bases,       setBases]         = useState([]);
  const [assets,      setAssets]        = useState([]);
  const [personnel,   setPersonnel]     = useState([]);
  const [form,        setForm]          = useState(INITIAL_FORM);
  const [showForm,    setShowForm]      = useState(false);
  const [filters,     setFilters]       = useState({ type: '', startDate: '', endDate: '' });
  const [submitting,  setSubmitting]    = useState(false);

  const load = () => {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    api.get(`/assignments?${p}`)
      .then(r => setAssignments(r.data.assignments || []))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/bases').then(r => setBases(r.data)).catch(() => {});
    api.get('/bases/assets').then(r => setAssets(r.data)).catch(() => {});
    api.get('/bases/personnel').then(r => setPersonnel(r.data)).catch(() => {});
  }, []);

  const filteredPersonnel = useMemo(() => {
    if (!form.baseId) return [];
    return personnel.filter(p => p.baseId === form.baseId);
  }, [personnel, form.baseId]);

  useEffect(load, [filters]);

  const submit = async () => {
    if (!form.assetId || !form.personnelName || !form.quantity) {
      toast.error('Asset, personnel name, and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/assignments', form);
      toast.success(`${form.type === 'assigned' ? 'Assignment' : 'Expenditure'} recorded`);
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to record assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"><User size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Assignments & Expenditures</h1>
          <p className="page-subtitle">Track asset allocation to personnel and expenditure records</p>
        </div>
        <button
          id="new-assignment-btn"
          className="btn btn-primary"
          onClick={() => setShowForm(s => !s)}
        >
          {showForm ? <><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cancel</> : <><Plus size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> New Record</>}
        </button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3 className="form-box-title">Record Assignment / Expenditure</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Asset *</label>
              <select id="asgn-asset" className="form-select" value={form.assetId}
                onChange={e => setForm({ ...form, assetId: e.target.value })}>
                <option value="">Select Asset</option>
                {assets.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Base</label>
              <select id="asgn-base" className="form-select" value={form.baseId}
                onChange={e => setForm({ ...form, baseId: e.target.value })}>
                <option value="">Select Base</option>
                {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Personnel *</label>
              <select id="asgn-personnel" className="form-select" value={form.personnelId}
                disabled={!form.baseId}
                onChange={e => {
                  const p = filteredPersonnel.find(p => p.personnelId === e.target.value);
                  setForm({ ...form, personnelId: p?.personnelId || '', personnelName: p?.name || '' });
                }}>
                <option value="">{form.baseId ? 'Select Personnel' : 'Select Base first'}</option>
                {filteredPersonnel.map(p => (
                  <option key={p.personnelId} value={p.personnelId}>{p.name} ({p.personnelId})</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Quantity *</label>
              <input id="asgn-qty" className="form-input" type="number" min="1" placeholder="e.g. 1"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Type *</label>
              <select id="asgn-type" className="form-select" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="assigned">Assigned</option>
                <option value="expended">Expended</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Date</label>
              <input id="asgn-date" className="form-input" type="date"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Notes</label>
              <input id="asgn-notes" className="form-input" placeholder="Optional notes"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button id="asgn-submit" className="btn btn-primary" onClick={submit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            {submitting ? 'Saving…' : <><Save size={16} /> Submit Record</>}
          </button>
        </div>
      )}

      <div className="filter-bar">
        <select className="form-select" value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="assigned">Assigned</option>
          <option value="expended">Expended</option>
        </select>
        <input className="form-input" type="date" title="Start Date"
          value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        <input className="form-input" type="date" title="End Date"
          value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        {(filters.type || filters.startDate || filters.endDate) && (
          <button className="btn btn-secondary"
            onClick={() => setFilters({ type: '', startDate: '', endDate: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['Date', 'Asset', 'Base', 'Personnel', 'ID', 'Qty', 'Type', 'Assigned By', 'Notes'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><User size={48} /></div>
                    <div className="empty-state-text">No records yet. Add your first assignment above.</div>
                  </div>
                </td>
              </tr>
            ) : assignments.map(a => (
              <tr key={a._id}>
                <td>{a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—'}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.assetId?.name || '—'}</td>
                <td>{a.baseId?.name || '—'}</td>
                <td>{a.personnelName}</td>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                  {a.personnelId || '—'}
                </td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--accent-light)' }}>
                  {a.quantity}
                </td>
                <td>
                  <span className={`badge badge-${a.type}`}>{a.type}</span>
                </td>
                <td>{a.assignedBy?.name || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontStyle: a.notes ? 'normal' : 'italic' }}>
                  {a.notes || 'No notes'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
