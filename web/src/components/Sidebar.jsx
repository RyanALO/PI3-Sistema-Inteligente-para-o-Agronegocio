import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout, getUser } from '../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  const NavLink = ({ to, label, emoji }) => {
    const active = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        style={{
          textDecoration: 'none',
          color: active ? 'var(--primary)' : 'var(--text-muted)',
          fontWeight: active ? '700' : '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: active ? 'rgba(27, 94, 32, 0.08)' : 'transparent',
          marginBottom: '8px',
          transition: 'var(--transition)'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{emoji}</span> 
        <span className="sidebar-link-text">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="navbar-logo" style={{ borderRadius: '8px', width: '36px', height: '36px', fontSize: '1.2rem' }}>🌱</div>
        <span className="navbar-title sidebar-title">AgroTech</span>
      </div>

      <div className="sidebar-links">
        <NavLink to="/dashboard" label="Início" emoji="🏠" />
        <NavLink to="/metricas" label="Métricas" emoji="📊" />
        <NavLink to="/fazenda" label="Fazenda" emoji="🚜" />
        <NavLink to="/talhoes" label="Talhões" emoji="🌱" />
        <NavLink to="/configuracoes" label="Configurações" emoji="⚙️" />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="navbar-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>{initials}</div>
          <div className="sidebar-user-info">
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>{user?.name || 'Usuário'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} style={{ width: '100%', marginTop: '12px', padding: '0.6rem' }}>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
