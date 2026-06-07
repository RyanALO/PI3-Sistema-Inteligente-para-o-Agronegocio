import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getConfiguracoes, updateConfiguracoes } from '../services/api';

export default function ConfiguracoesPage() {
  const [irrigacaoAutomatica, setIrrigacaoAutomatica] = useState(true);
  const [notifCriticas, setNotifCriticas] = useState(true);
  const [notifInfo, setNotifInfo] = useState(false);
  const [umidadeMin, setUmidadeMin] = useState('30');
  const [umidadeMax, setUmidadeMax] = useState('60');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfigs();
  }, []);

  const carregarConfigs = async () => {
    try {
      const { data } = await getConfiguracoes();
      if (data) {
        setIrrigacaoAutomatica(data.irrigacao_automatica);
        setUmidadeMin(data.umidade_minima);
        setUmidadeMax(data.umidade_maxima);
      }
    } catch (e) {
      console.error("Erro ao ler configuracoes do backend", e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (Number(umidadeMin) < 0 || Number(umidadeMax) > 100 || Number(umidadeMin) >= Number(umidadeMax)) {
      setFeedback('❌ Limites de umidade inválidos.');
      return;
    }
    
    setLoading(true);
    try {
      await updateConfiguracoes({
        irrigacao_automatica: irrigacaoAutomatica,
        umidade_minima: Number(umidadeMin),
        umidade_maxima: Number(umidadeMax)
      });
      setFeedback('✅ Configurações salvas e aplicadas na Inteligência Autônoma!');
    } catch (err) {
      setFeedback('❌ Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const Switch = ({ checked, onChange }) => (
    <div style={{
      width: '44px', height: '24px', background: checked ? 'var(--primary)' : 'var(--border)',
      borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s'
    }} onClick={() => onChange(!checked)}>
      <div style={{
        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: '0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>⚙️ Configurações</h1>
          <p>Personalize os limites de irrigação e comportamento do sistema</p>
        </div>

        <form onSubmit={handleSave} className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          {feedback && <div style={{ padding: '1rem', background: feedback.includes('✅') ? '#E8F5E9' : '#FFEBEE', color: feedback.includes('✅') ? '#2E7D32' : '#C62828', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' }}>{feedback}</div>}
          
          <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Irrigação Automatizada</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text-dark)', marginBottom: '4px' }}>Ativar Algoritmo Autônomo</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>O sistema irá irrigar automaticamente baseado nos sensores de umidade</p>
            </div>
            <Switch checked={irrigacaoAutomatica} onChange={setIrrigacaoAutomatica} />
          </div>

          {irrigacaoAutomatica && (
            <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '1rem' }}>Limites de Umidade Padrão (%)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Mínima (Ligar Irrigação)</label>
                  <input type="number" className="form-input" value={umidadeMin} onChange={e => setUmidadeMin(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Máxima (Desligar Irrigação)</label>
                  <input type="number" className="form-input" value={umidadeMax} onChange={e => setUmidadeMax(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Notificações e Alertas</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Alertas Críticos (E-mail / Push)</p>
            <Switch checked={notifCriticas} onChange={setNotifCriticas} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Informativos (Resumos diários)</p>
            <Switch checked={notifInfo} onChange={setNotifInfo} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Salvar Configurações</button>
          </div>
        </form>
      </div>
    </div>
  );
}
