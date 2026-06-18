import { useState, useEffect } from 'react';
import { getSensores, adicionarSensor, logout, getUser } from '../services/api';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';

export default function DashboardPage() {
  const user = getUser();
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensor, setNewSensor] = useState({ nome: '', tipo: 'umidade' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Sempre usar dados mock
    setSensores(getMockSensores());
    setLoading(false);
  }, []);

  const loadSensores = async () => {
    try {
      const response = await getSensores();
      console.log('Resposta da API /sensores:', response);
      setSensores(Array.isArray(response) ? response : response.data || []);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar sensores:', err);
      // Fallback: usar dados mock quando API falha
      setError('API indisponível - exibindo dados de simulação');
      setSensores(getMockSensores());
    } finally {
      setLoading(false);
    }
  };

  const getMockSensores = () => [
    {
      id: 1,
      nome: 'Umidade - Talhão 1',
      tipo: 'umidade',
      valor: 65,
      localizacao: 'Talhão 1 (Soja)',
      ultima_atualizacao: new Date().toISOString()
    },
    {
      id: 2,
      nome: 'Temperatura - Talhão 1',
      tipo: 'temperatura',
      valor: 28,
      localizacao: 'Talhão 1 (Soja)',
      ultima_atualizacao: new Date().toISOString()
    },
    {
      id: 3,
      nome: 'Umidade - Talhão 2',
      tipo: 'umidade',
      valor: 45,
      localizacao: 'Talhão 2 (Milho)',
      ultima_atualizacao: new Date().toISOString()
    },
    {
      id: 4,
      nome: 'Temperatura - Talhão 2',
      tipo: 'temperatura',
      valor: 32,
      localizacao: 'Talhão 2 (Milho)',
      ultima_atualizacao: new Date().toISOString()
    },
    {
      id: 5,
      nome: 'Umidade - Talhão 3',
      tipo: 'umidade',
      valor: 72,
      localizacao: 'Talhão 3 (Soja)',
      ultima_atualizacao: new Date().toISOString()
    },
    {
      id: 6,
      nome: 'Chuva',
      tipo: 'chuva',
      valor: 12,
      localizacao: 'Fazenda Central',
      ultima_atualizacao: new Date().toISOString()
    }
  ];

  const handleAddSensor = async (e) => {
    e.preventDefault();
    if (!newSensor.nome.trim()) {
      setError('Nome do sensor é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await adicionarSensor({
        nome: newSensor.nome,
        tipo: newSensor.tipo,
        localizacao: 'Talhão 1'
      });
      setNewSensor({ nome: '', tipo: 'umidade' });
      setShowAddForm(false);
      setError('');
      loadSensores();
    } catch (err) {
      setError('Erro ao adicionar sensor: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getValueColor = (tipo, value) => {
    if (!value) return '#999';
    const val = parseFloat(value);
    if (tipo === 'umidade') {
      if (val > 80) return '#e74c3c';
      if (val > 60) return '#27ae60';
      if (val > 40) return '#f39c12';
      return '#e74c3c';
    }
    if (tipo === 'temperatura') {
      if (val > 35) return '#e74c3c';
      if (val > 25) return '#27ae60';
      if (val > 15) return '#3498db';
      return '#3498db';
    }
    return '#999';
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  if (loading) {
    return (
      <>
        <Sidebar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Carregando sensores...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🌾 AgroTech Dashboard</h1>
          <p style={styles.subtitle}>Monitoramento de sensores em tempo real</p>
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

      {error && error !== 'API indisponível - exibindo dados de simulação' && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.actionBar}>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addBtn}
        >
          {showAddForm ? '✕ Cancelar' : '+ Novo Sensor'}
        </button>
      </div>

      {showAddForm && (
        <div style={styles.formContainer}>
          <h2 style={{ marginBottom: '1rem', color: '#1b5e20' }}>Adicionar Novo Sensor</h2>
          <form onSubmit={handleAddSensor} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome do Sensor</label>
              <input
                type="text"
                placeholder="Ex: Sensor Talhão 1"
                value={newSensor.nome}
                onChange={(e) => setNewSensor({ ...newSensor, nome: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Sensor</label>
              <select
                value={newSensor.tipo}
                onChange={(e) => setNewSensor({ ...newSensor, tipo: e.target.value })}
                style={styles.input}
              >
                <option value="umidade">Umidade do Solo</option>
                <option value="temperatura">Temperatura</option>
                <option value="chuva">Chuva</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitBtn,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Sensor'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {sensores.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>📭 Nenhum sensor adicionado ainda</p>
            <p style={styles.emptySubtext}>Clique em "+ Novo Sensor" para começar o monitoramento</p>
          </div>
        ) : (
          sensores.map((sensor) => (
            <div key={sensor.id} style={styles.sensorCard}>
              <div style={styles.sensorHeader}>
                <h3 style={styles.sensorName}>{sensor.nome}</h3>
                <span style={styles.sensorType}>{sensor.tipo}</span>
              </div>

              <div style={styles.sensorBody}>
                {sensor.tipo === 'umidade' && (
                  <div style={styles.metricContainer}>
                    <div style={styles.metricIcon}>💧</div>
                    <div style={styles.metricContent}>
                      <p style={styles.metricLabel}>Umidade</p>
                      <p style={{ ...styles.metricValue, color: getValueColor('umidade', sensor.valor) }}>
                        {sensor.valor || '--'}%
                      </p>
                    </div>
                  </div>
                )}

                {sensor.tipo === 'temperatura' && (
                  <div style={styles.metricContainer}>
                    <div style={styles.metricIcon}>🌡️</div>
                    <div style={styles.metricContent}>
                      <p style={styles.metricLabel}>Temperatura</p>
                      <p style={{ ...styles.metricValue, color: getValueColor('temperatura', sensor.valor) }}>
                        {sensor.valor || '--'}°C
                      </p>
                    </div>
                  </div>
                )}

                {sensor.tipo === 'chuva' && (
                  <div style={styles.metricContainer}>
                    <div style={styles.metricIcon}>🌧️</div>
                    <div style={styles.metricContent}>
                      <p style={styles.metricLabel}>Chuva</p>
                      <p style={{ ...styles.metricValue, color: '#3498db' }}>
                        {sensor.valor || '--'}mm
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.sensorFooter}>
                <small style={styles.sensorMeta}>
                  📍 {sensor.localizacao || 'Talhão 1'}
                </small>
                <small style={styles.sensorMeta}>
                  ⏱️ {sensor.ultima_atualizacao ? new Date(sensor.ultima_atualizacao).toLocaleTimeString('pt-BR') : '--:--'}
                </small>
              </div>
            </div>
          ))
        )}
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #1b5e20',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
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
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #ef5350'
  },
  actionBar: {
    marginBottom: '1.5rem'
  },
  addBtn: {
    backgroundColor: '#1b5e20',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(27,94,32,0.3)',
    transition: 'all 0.3s'
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #1b5e20'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '1rem',
    alignItems: 'flex-end'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit'
  },
  submitBtn: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyText: {
    fontSize: '1.5rem',
    color: '#333',
    margin: '0 0 0.5rem 0'
  },
  emptySubtext: {
    color: '#999',
    margin: 0
  },
  sensorCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  },
  sensorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  sensorName: {
    margin: 0,
    color: '#1b5e20',
    fontSize: '1.1rem'
  },
  sensorType: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  sensorBody: {
    marginBottom: '1rem'
  },
  metricContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  metricIcon: {
    fontSize: '2.5rem'
  },
  metricContent: {
    flex: 1
  },
  metricLabel: {
    margin: '0 0 0.25rem 0',
    color: '#666',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  metricValue: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '700'
  },
  sensorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
    fontSize: '0.8rem'
  },
  sensorMeta: {
    color: '#999',
    margin: 0
  }
};
