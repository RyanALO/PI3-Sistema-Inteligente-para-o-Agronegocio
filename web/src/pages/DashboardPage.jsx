import { useState, useEffect } from 'react';
import { getDashboardSummary, getAlertas, acionarIrrigacaoManual } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [isIrrigating, setIsIrrigating] = useState(false);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await getDashboardSummary();
      setData(result);
      const alrts = await getAlertas();
      setAlertas(Array.isArray(alrts) ? alrts : result.recent_alerts || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar dashboard');
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleIrrigacao = async () => {
    if(window.confirm("Deseja forçar o acionamento manual da irrigação em toda a fazenda? (Simulando Válvula 1 do Talhão 1)")) {
      setIsIrrigating(true);
      try {
        await acionarIrrigacaoManual(1, 1, 60, 500); // Talhão 1, Dispositivo 1
        setActionFeedback("🚿 Irrigação iniciada com sucesso!");
      } catch (err) {
        setActionFeedback("❌ Erro ao acionar irrigação. " + err.message);
      } finally {
        setIsIrrigating(false);
        setTimeout(() => setActionFeedback(''), 5000);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
          <h1>🏠 Painel de Monitoramento</h1>
          <p>Visão geral da lavoura em tempo real • Atualizado a cada 30 segundos</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {actionFeedback && (
          <div style={{ padding: '1rem', background: '#E8F5E9', color: '#2E7D32', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500', boxShadow: 'var(--shadow-sm)' }}>
            {actionFeedback}
          </div>
        )}

        {/* Primary Emphasis KPI */}
        <div className="card" style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Umidade do Solo Atual</p>
          <div style={{ fontSize: '4.5rem', fontWeight: '800', color: 'var(--info)', lineHeight: '1', margin: '0.5rem 0' }}>
            {kpis.soil_moisture || 0}<span style={{ fontSize: '2rem' }}>%</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Média de leitura baseada nos sensores ativos no campo</p>
        </div>

        {/* Action Button */}
        <button onClick={handleIrrigacao} disabled={isIrrigating} className="btn" style={{ 
            width: '100%', background: isIrrigating ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))', 
            color: 'white', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '12px', marginBottom: '2rem',
            boxShadow: isIrrigating ? 'none' : '0 4px 12px rgba(27,94,32,0.2)',
            cursor: isIrrigating ? 'not-allowed' : 'pointer'
        }}>
          {isIrrigating ? 'Enviando comando...' : '🚿 ACIONAR IRRIGAÇÃO MANUAL AGORA'}
        </button>

        {/* KPI Grid */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="kpi-card temperature">
            <div className="kpi-icon">🌡️</div>
            <div className="kpi-label">Temperatura Média</div>
            <div className="kpi-value">{kpis.temperature || 0}<span className="kpi-unit">°C</span></div>
          </div>

          <div className="kpi-card devices">
            <div className="kpi-icon">📡</div>
            <div className="kpi-label">Dispositivos Ativos</div>
            <div className="kpi-value">{kpis.active_devices || 0}<span className="kpi-unit">/{kpis.total_devices || 0}</span></div>
          </div>

          <div className="kpi-card alerts">
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-label">Alertas Ativos</div>
            <div className="kpi-value">{kpis.active_alerts || 0}</div>
          </div>
        </div>

        {/* Alerts card full width here */}
        <div className="alerts-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>⚠️ Alertas Recentes</h3>
            <a href="/talhoes" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Ver Talhões Afetados</a>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {alertas.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                Nenhum alerta ativo no momento ✅ Tudo dentro do controle.
              </p>
            ) : (
              alertas.slice(0, 5).map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className={`alert-dot ${alert.severity}`} />
                  <div className="alert-content">
                    <h4>{alert.title} {alert.talhao ? `- ${alert.talhao}` : ''}</h4>
                    <p>{alert.message}</p>
                    <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{new Date(alert.created_at || Date.now()).toLocaleString()}</small>
                  </div>
                  <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'white', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>Baixa</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
