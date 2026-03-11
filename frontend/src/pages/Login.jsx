import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'Admin',             email: 'admin@mams.mil',       password: 'admin123' },
  { role: 'Commander Alpha',   email: 'alpha@mams.mil',       password: 'alpha123' },
  { role: 'Commander Bravo',   email: 'bravo@mams.mil',       password: 'bravo123' },
  { role: 'Logistics Officer', email: 'logistics@mams.mil',   password: 'logistics123' },
];

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch {
      toast.error('Invalid credentials. Try the demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acct) => {
    setForm({ email: acct.email, password: acct.password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🪖</div>
        <h1 className="login-title">MAMS</h1>
        <p className="login-subtitle">Military Asset Management System</p>

        <form onSubmit={handleSubmit}>
          <input
            id="login-email"
            className="login-input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
          <input
            id="login-password"
            className="login-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
          <button
            id="login-submit"
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating…' : '🔐 Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <div className="login-demo-title">Quick Access — Demo Accounts</div>
          {DEMO_ACCOUNTS.map(acct => (
            <div
              key={acct.email}
              className="login-demo-cred"
              onClick={() => fillDemo(acct)}
              title="Click to fill"
            >
              <span>{acct.email}</span>
              <span className="login-demo-role">{acct.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
