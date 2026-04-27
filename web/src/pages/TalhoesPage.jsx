import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getTalhoesByFazenda } from '../services/api';

export default function TalhoesPage() {
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    carregarTalhoes();
  }, []);

  const carregarTalhoes = async () => {
    try {
      const response = await getTalhoesByFazenda(1); // Mocado Fazenda ID=1 para o protótipo
      setTalhoes(response.data || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar talhões.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    if (status === 'ativo' || status === 'Saudável') return 'Saudável';
    if (status === 'alerta' || status === 'Atenção') return 'Atenção';
    if (status === 'critico' || status === 'Crítico') return 'Crítico';
    return status || 'Saudável';
  };

  const filtered = talhoes.filter(t => filtro === 'Todos' || getStatusDisplay(t.status) === filtro);

  const getStatusColor = (status) => {
    const s = getStatusDisplay(status);
    if (s === 'Saudável') return 'var(--success)';
    if (s === 'Atenção') return 'var(--warning)';
    return 'var(--danger)';
  };

  // Calcula um progresso artificial baseado na data do banco ou fixo, se nulo
  const calculateProgress = (t) => {
    if (t.progresso) return t.progresso;
    if (t.data_plantio && t.data_colheita) {
      const plantio = new Date(t.data_plantio).getTime();
      const colheita = new Date(t.data_colheita).getTime();
      const hoje = new Date().getTime();
      if (hoje < plantio) return 0;
      if (hoje > colheita) return 100;
      return Math.round(((hoje - plantio) / (colheita - plantio)) * 100);
    }
    // fake aleatorio baseado no ID se não tiver
    return Math.min(10 + (t.id * 15), 100);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🌱 Meus Talhões</h1>
            <p>Gerencie as áreas de plantio, progresso e status individual</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>+ Novo Talhão</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {['Todos', 'Saudável', 'Atenção', 'Crítico'].map(f => (
            <button 
              key={f} 
              onClick={() => setFiltro(f)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500',
                background: filtro === f ? 'var(--primary)' : 'white',
                color: filtro === f ? 'white' : 'var(--text-muted)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container" style={{ minHeight: '300px' }}>
            <div className="spinner" />
            <p>Carregando talhões da sua fazenda...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(item => (
              <div key={item.id} className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>{item.nome}</h3>
                  <span style={{ 
                    background: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status), 
                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' 
                  }}>
                    {getStatusDisplay(item.status)}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {item.cultura || 'Cultura indefinida'} • {item.area ? `${item.area} ha` : 'Área ind.'} • Plantio: {item.data_plantio ? new Date(item.data_plantio).toLocaleDateString() : 'N/A'}
                </p>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    <span>Progresso do Ciclo</span>
                    <span>{calculateProgress(item)}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${calculateProgress(item)}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>Nenhum talhão encontrado correspondente ao filtro.</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg) !important; }
      `}</style>
    </div>
  );
}
