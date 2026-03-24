import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🌱</div>
        <span className="navbar-title">AgroTech</span>
      </div>

      <div className="navbar-actions">
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <span>{user?.name || 'Usuário'}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
}
