import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../services/api';
import Navbar from '../components/Navbar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await getDashboardSummary();
      setData(result);
      setError('');
    } catch (err) {
      setError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
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
  const tempHistory = data?.temperature_history || [];
  const alerts = data?.recent_alerts || [];
  const productivity = data?.productivity || { average: 0, fields: [] };
  const stock = data?.stock || { total: '0t', items: [] };

  const barColors = ['#1B5E20', '#2E7D32', '#43A047'];

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 Análise de Métricas</h1>
          <p>Dados em tempo real da sua fazenda • Atualizado a cada 30 segundos</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card moisture">
            <div className="kpi-icon">💧</div>
            <div className="kpi-label">Umidade do Solo</div>
            <div className="kpi-value">{kpis.soil_moisture || 0}<span className="kpi-unit">%</span></div>
          </div>

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

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Variação Climática</h3>
            <p className="chart-subtitle">Resumo das últimas 24h</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={tempHistory}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6D00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6D00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#42A5F5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="time_label" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
                <Area type="monotone" dataKey="avg_temp" stroke="#FF6D00" fill="url(#colorTemp)" name="Temperatura (°C)" strokeWidth={2} />
                <Area type="monotone" dataKey="avg_humidity" stroke="#42A5F5" fill="url(#colorHum)" name="Umidade (%)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Produtividade</h3>
            <p className="chart-subtitle">Sacas por hectare (sc/ha) • Média: {productivity.average}</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productivity.fields} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} width={110} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
                <Bar dataKey="value" name="Produtividade (%)" radius={[0, 6, 6, 0]} barSize={20}>
                  {productivity.fields.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom section: Alerts + Stock */}
        <div className="bottom-grid">
          <div className="alerts-card">
            <h3>⚠️ Alertas Recentes</h3>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                Nenhum alerta ativo no momento ✅
              </p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className={`alert-dot ${alert.severity}`} />
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="stock-card">
            <h3>📦 Estoque de Insumos <span className="stock-total">Total: {stock.total}</span></h3>
            {stock.items.map((item) => (
              <div key={item.name} className="stock-item">
                <div className="stock-item-header">
                  <span className="stock-item-name">{item.name}</span>
                  <span className="stock-item-pct">{item.percentage}%</span>
                </div>
                <div className="stock-bar">
                  <div
                    className={`stock-bar-fill ${item.name.toLowerCase()}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
