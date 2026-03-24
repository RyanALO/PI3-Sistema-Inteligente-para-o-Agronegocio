import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!terms) {
      setError('Você precisa aceitar os Termos de Uso');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
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

          <h1>Criar Conta</h1>
          <p className="subtitle">Crie sua conta para começar a monitorar</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail Profissional</label>
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                Eu aceito os <a href="#" onClick={(e) => e.preventDefault()}>Termos de Uso</a>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar →'}
            </button>
          </form>

          <p className="form-footer">
            Já possui cadastro? <Link to="/">Entrar</Link>
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
          <h2>Integração Vertical e Horizontal</h2>
          <p>Do sensor ao relatório executivo. Conecte toda a cadeia produtiva com tecnologia IoT e dashboards em tempo real.</p>
        </div>
      </div>
    </div>
  );
}
