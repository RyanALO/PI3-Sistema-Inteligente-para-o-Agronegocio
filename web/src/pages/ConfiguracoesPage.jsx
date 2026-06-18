import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getUser, logout } from '../services/api';

export default function ConfiguracoesPage() {
  const user = getUser();
  const [settings, setSettings] = useState({
    irrigacaoAutomatica: true,
    notificacoes: true,
    umidadeMinima: 30,
    umidadeMaxima: 80
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  return (
    <>
      <Sidebar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>⚙️ Configurações</h1>
            <p style={styles.subtitle}>Ajuste as preferências do sistema</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{initials}</div>
              <div>
                <p style={styles.userName}>{user?.name || 'Usuário'}</p>
                <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.settingsContainer}>
          <div style={styles.settingGroup}>
            <h3 style={styles.groupTitle}>💧 Irrigação</h3>
            <div style={styles.settingItem}>
              <div>
                <label style={styles.label}>Irrigação Automática</label>
                <p style={styles.description}>Controlar automaticamente o sistema de irrigação</p>
              </div>
              <input
                type="checkbox"
                checked={settings.irrigacaoAutomatica}
                onChange={(e) => handleChange('irrigacaoAutomatica', e.target.checked)}
                style={styles.checkbox}
              />
            </div>
          </div>

          <div style={styles.settingGroup}>
            <h3 style={styles.groupTitle}>🔔 Notificações</h3>
            <div style={styles.settingItem}>
              <div>
                <label style={styles.label}>Ativar Notificações</label>
                <p style={styles.description}>Receber alertas sobre sensores e eventos importantes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificacoes}
                onChange={(e) => handleChange('notificacoes', e.target.checked)}
                style={styles.checkbox}
              />
            </div>
          </div>

          <div style={styles.settingGroup}>
            <h3 style={styles.groupTitle}>📊 Limites de Umidade</h3>
            <div style={styles.settingItem}>
              <div>
                <label style={styles.label}>Umidade Mínima (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.umidadeMinima}
                  onChange={(e) => handleChange('umidadeMinima', parseInt(e.target.value))}
                  style={styles.numberInput}
                />
              </div>
            </div>
            <div style={styles.settingItem}>
              <div>
                <label style={styles.label}>Umidade Máxima (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.umidadeMaxima}
                  onChange={(e) => handleChange('umidadeMaxima', parseInt(e.target.value))}
                  style={styles.numberInput}
                />
              </div>
            </div>
          </div>

          <button style={styles.saveButton}>💾 Salvar Configurações</button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginLeft: '200px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: '#fff',
    padding: '1.5rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    marginLeft: '2rem'
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#1b5e20',
    fontSize: '1.8rem'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1b5e20',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },
  userName: {
    margin: '0 0 0.25rem 0',
    fontWeight: '600',
    color: '#333'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#e74c3c',
    cursor: 'pointer',
    padding: 0,
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'underline'
  },
  settingsContainer: {
    maxWidth: '600px',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  settingGroup: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #eee'
  },
  groupTitle: {
    margin: '0 0 1rem 0',
    color: '#1b5e20',
    fontSize: '1.1rem'
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem',
    display: 'block'
  },
  description: {
    color: '#999',
    fontSize: '0.85rem',
    margin: '0.25rem 0 0 0'
  },
  checkbox: {
    width: '24px',
    height: '24px',
    cursor: 'pointer'
  },
  numberInput: {
    width: '80px',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    marginTop: '0.5rem'
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background 0.3s'
  }
};
