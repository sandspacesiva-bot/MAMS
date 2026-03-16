import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, RefreshCw, User, Users, LogOut, Shield } from 'lucide-react';

const links = [
  { to: '/',            icon: <LayoutDashboard size={18} />, label: 'Dashboard',          roles: ['admin','base_commander','logistics_officer'] },
  { to: '/purchases',   icon: <Package size={18} />, label: 'Purchases',           roles: ['admin','base_commander','logistics_officer'] },
  { to: '/transfers',   icon: <RefreshCw size={18} />, label: 'Transfers',           roles: ['admin','base_commander','logistics_officer'] },
  { to: '/assignments', icon: <User size={18} />, label: 'Assignments',         roles: ['admin','base_commander'] },
  { to: '/personnel',   icon: <Users size={18} />, label: 'Personnel',           roles: ['admin','base_commander'] },
];

const roleLabels = {
  admin:             'System Admin',
  base_commander:    'Base Commander',
  logistics_officer: 'Logistics Officer',
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon"><Shield size={24} /></span>
        <span>MAMS</span>
      </div>
      <div className="sidebar-role-tag">
        {roleLabels[user?.role] || user?.role}
      </div>

      {user?.assignedBase && (
        <div style={{ marginBottom: '1rem', padding: '8px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.12)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Base</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 600 }}>
            {user.assignedBase?.name || 'N/A'}
          </div>
        </div>
      )}

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        {links
          .filter(l => l.roles.includes(user?.role))
          .map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="sidebar-nav-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', padding: '0 4px' }}>
          {user?.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0 4px', marginBottom: '0.75rem' }}>
          {user?.email}
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <span><LogOut size={16} /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
