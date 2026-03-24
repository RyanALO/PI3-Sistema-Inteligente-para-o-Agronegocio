import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">🌱</div>
            <span className="auth-logo-text">AgroTech</span>
          </div>

          <h1>Bem-vindo de volta</h1>
          <p className="subtitle">Entre com suas credenciais para acessar o painel</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-with-icon">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <p className="form-footer">
            Não possui conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80"
          alt="Agricultura"
          className="auth-bg-image"
        />
        <div className="auth-overlay-content">
          <h2>Sistema Inteligente para o Agronegócio</h2>
          <p>Monitore sua fazenda em tempo real com dados de sensores IoT, alertas inteligentes e dashboards interativos.</p>
        </div>
      </div>
    </div>
  );
}
