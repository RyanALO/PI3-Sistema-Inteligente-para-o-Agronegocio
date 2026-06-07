import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getFazendas } from '../services/api';

export default function FazendaPage() {
  const [fazenda, setFazenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarFazenda();
  }, []);

  const carregarFazenda = async () => {
    try {
      const response = await getFazendas();
      const dados = response.data;
      if (dados && dados.length > 0) {
        setFazenda(dados[0]); // Pega a primeira fazenda cadastrada
      } else {
        setError('Nenhuma fazenda cadastrada.');
      }
    } catch (err) {
      setError('Erro ao carregar dados da fazenda.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content loading-container">
          <div className="spinner" />
          <p>Carregando perfil da fazenda...</p>
        </div>
      </div>
    );
  }

  // Dados provisórios da equipe enquanto o BD não tem uma tabela `membros`
  const equipeMock = [
    { id: 1, nome: 'Você', iniciais: 'ME' },
    { id: 2, nome: 'Engenheiro Agrônomo', iniciais: 'EA' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🚜 Perfil da Fazenda</h1>
            <p>Gerencie as informações principais e equipe da sua propriedade</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Editar Perfil</button>
        </div>

        {error ? (
          <div className="form-error">{error}</div>
        ) : (
          <div className="card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                🌾
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>{fazenda?.nome || 'Fazenda AgroTech'}</h2>
                <p style={{ color: 'var(--success)', fontWeight: '600' }}>✔️ Fazenda Ativa</p>
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Visão Geral</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Localização</p>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-dark)' }}>{fazenda?.localizacao || 'Não informada'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quantidade de Talhões</p>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-dark)' }}>{fazenda?.total_talhoes || 0}</p>
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Equipe Vinculada</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {equipeMock.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '30px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: m.nome === 'Você' ? 'var(--primary)' : 'var(--border)', color: m.nome === 'Você' ? 'white' : 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                    {m.iniciais}
                  </div>
                  <span style={{ fontWeight: '500' }}>{m.nome}</span>
                </div>
              ))}
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px dashed var(--text-muted)', borderRadius: '30px', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '1.2rem' }}>+</span> Adicionar Membro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
