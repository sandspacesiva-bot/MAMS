import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, Plus, X, Save, Trash2 } from 'lucide-react';

const INITIAL_FORM = { name: '', personnelId: '', baseId: '' };

export default function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [bases, setBases] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, bRes] = await Promise.all([
        api.get('/bases/personnel'),
        api.get('/bases')
      ]);
      setPersonnel(pRes.data);
      setBases(bRes.data);
    } catch (e) {
      toast.error('Failed to load personnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.personnelId || !form.baseId) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/bases/personnel', form);
      toast.success('Personnel added successfully');
      setForm(INITIAL_FORM);
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add personnel');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Users size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Personnel Management</h1>
          <p className="page-subtitle">Manage military personnel and their base assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Personnel</>}
        </button>
      </div>

      {showForm && (
        <form className="form-box" onSubmit={handleSubmit}>
          <h3 className="form-box-title">Add New Personnel</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Full Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Sgt. John Smith"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Personnel ID *</label>
              <input 
                className="form-input" 
                placeholder="e.g. US-XXXX"
                value={form.personnelId}
                onChange={e => setForm({ ...form, personnelId: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Base Assignment *</label>
              <select 
                className="form-select"
                value={form.baseId}
                onChange={e => setForm({ ...form, baseId: e.target.value })}
              >
                <option value="">Select Base</option>
                {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> Save Personnel
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Personnel ID</th>
              <th>Name</th>
              <th>Base</th>
              <th>Added On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading personnel...</td></tr>
            ) : personnel.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={48} /></div>
                    <div className="empty-state-text">No personnel found. Add your first member above.</div>
                  </div>
                </td>
              </tr>
            ) : (
              personnel.map(p => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--accent-light)' }}>
                    {p.personnelId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{bases.find(b => b._id === p.baseId)?.name || 'Unknown'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
