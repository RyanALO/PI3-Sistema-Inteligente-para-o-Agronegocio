import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../services/api';
import Sidebar from '../components/Sidebar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function MetricasPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('Hoje');

  useEffect(() => {
    loadDashboard();
  }, [periodo]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await getDashboardSummary();
      setData(result);
      setError('');
    } catch (err) {
      setError('Erro ao carregar métricas históricas');
    } finally {
      setLoading(false);
    }
  };

  const tempHistory = data?.temperature_history || [];
  const productivity = data?.productivity || { average: 0, fields: [] };
  const stock = data?.stock || { total: '0t', items: [] };
  const barColors = ['#1B5E20', '#2E7D32', '#43A047'];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>📊 Análise de Métricas</h1>
            <p>Dados históricos, produtividade e acompanhamento de estoque</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Hoje', '7 dias', 'Este mês'].map(f => (
              <button 
                key={f} 
                onClick={() => setPeriodo(f)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500',
                  background: periodo === f ? 'var(--primary)' : 'white',
                  color: periodo === f ? 'white' : 'var(--text-muted)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="loading-container" style={{ minHeight: '50vh' }}>
            <div className="spinner" />
            <p>Carregando análises...</p>
          </div>
        ) : (
          <>
            <div className="charts-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
              <div className="chart-card">
                <h3>Variação Climática</h3>
                <p className="chart-subtitle">Resumo ({periodo})</p>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="time_label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Area type="monotone" dataKey="avg_temp" stroke="#FF6D00" fill="url(#colorTemp)" name="Temperatura (°C)" strokeWidth={3} />
                    <Area type="monotone" dataKey="avg_humidity" stroke="#42A5F5" fill="url(#colorHum)" name="Umidade (%)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Produtividade Estimada</h3>
                <p className="chart-subtitle">Média: {productivity.average}</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={productivity.fields} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" name="Prod. (%)" radius={[0, 6, 6, 0]} barSize={20}>
                      {productivity.fields.map((_, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bottom-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
              <div className="stock-card" style={{ height: '100%' }}>
                <h3>📦 Estoque de Insumos <span className="stock-total">Total: {stock.total}</span></h3>
                <div style={{ marginTop: '1.5rem' }}>
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

              <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🧠</span> Insight da IA
                </h3>
                <div style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <p style={{ color: 'var(--text-dark)', lineHeight: '1.7' }}>
                    <strong>Recomendação:</strong> Analisando o histórico dos últimos 7 dias, nota-se uma tendência de queda na umidade no Talhão Norte. Sugerimos ativar o modo de irrigação antecipada para essa zona evitando perdas no período da tarde (13h-16h) onde a radiação solar está no pico.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
