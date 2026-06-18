import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logo}>🌱</div>
        <span style={styles.title}>AgroTech</span>
      </div>

      <nav style={styles.nav}>
        <a href="/dashboard" style={{...styles.navLink, ...(isActive('/dashboard') ? styles.navLinkActive : {})}}>
          <span style={styles.navIcon}>📊</span>
          Dashboard
        </a>
        <a href="/fazenda" style={{...styles.navLink, ...(isActive('/fazenda') ? styles.navLinkActive : {})}}>
          <span style={styles.navIcon}>🚜</span>
          Fazenda
        </a>
        <a href="/talhoes" style={{...styles.navLink, ...(isActive('/talhoes') ? styles.navLinkActive : {})}}>
          <span style={styles.navIcon}>🌱</span>
          Talhões
        </a>
        <a href="/configuracoes" style={{...styles.navLink, ...(isActive('/configuracoes') ? styles.navLinkActive : {})}}>
          <span style={styles.navIcon}>⚙️</span>
          Configurações
        </a>
      </nav>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '200px',
    height: '100vh',
    backgroundColor: '#1b5e20',
    color: '#fff',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
    zIndex: 1000
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  logo: {
    fontSize: '1.8rem'
  },
  title: {
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '6px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'background 0.3s',
    cursor: 'pointer'
  },
  navLinkActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    fontWeight: '600'
  },
  navIcon: {
    fontSize: '1.2rem'
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.2)',
    paddingTop: '1rem'
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: '#c62828',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.3s'
  }
};
