import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getUser, logout } from '../services/api';

export default function FazendaPage() {
  const user = getUser();
  const [fazenda, setFazenda] = useState({
    nome: 'Fazenda Exemplo',
    area: '1,250 ha',
    localizacao: 'Goiás, BR',
    culturas: 'Soja/Milho',
    proprietario: user?.name || 'Proprietário'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      setFazenda(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      setIsEditModalOpen(false);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingField(null);
    setEditValue('');
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
            <h1 style={styles.title}>🚜 Fazenda</h1>
            <p style={styles.subtitle}>Informações gerais da fazenda</p>
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

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🏡</div>
            <h3 style={styles.cardTitle}>Nome da Fazenda</h3>
            <p style={styles.cardValue}>{fazenda.nome}</p>
            <button 
              onClick={() => handleEditField('nome', fazenda.nome)}
              style={styles.editBtn}
            >
              ✏️ Editar
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📏</div>
            <h3 style={styles.cardTitle}>Área Total</h3>
            <p style={styles.cardValue}>{fazenda.area}</p>
            <button 
              onClick={() => handleEditField('area', fazenda.area)}
              style={styles.editBtn}
            >
              ✏️ Editar
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📍</div>
            <h3 style={styles.cardTitle}>Localização</h3>
            <p style={styles.cardValue}>{fazenda.localizacao}</p>
            <button 
              onClick={() => handleEditField('localizacao', fazenda.localizacao)}
              style={styles.editBtn}
            >
              ✏️ Editar
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🌾</div>
            <h3 style={styles.cardTitle}>Culturas</h3>
            <p style={styles.cardValue}>{fazenda.culturas}</p>
            <button 
              onClick={() => handleEditField('culturas', fazenda.culturas)}
              style={styles.editBtn}
            >
              ✏️ Editar
            </button>
          </div>

          <div style={{...styles.card, gridColumn: '1 / -1'}}>
            <div style={styles.cardIcon}>👤</div>
            <h3 style={styles.cardTitle}>Proprietário</h3>
            <p style={styles.cardValue}>{fazenda.proprietario}</p>
            <button 
              onClick={() => handleEditField('proprietario', fazenda.proprietario)}
              style={styles.editBtn}
            >
              ✏️ Editar
            </button>
          </div>
        </div>

        {isEditModalOpen && (
          <div style={styles.modalOverlay} onClick={handleCancelEdit}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Editar {editingField}</h2>
              <input 
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={styles.modalInput}
                placeholder="Digite o novo valor"
                autoFocus
              />
              <div style={styles.modalButtons}>
                <button 
                  onClick={handleSaveEdit}
                  style={styles.saveBtn}
                >
                  Salvar
                </button>
                <button 
                  onClick={handleCancelEdit}
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s'
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  cardTitle: {
    margin: '1rem 0 0.5rem 0',
    color: '#1b5e20',
    fontSize: '1rem'
  },
  cardValue: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#333',
    fontWeight: '600'
  },
  editBtn: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#1b5e20',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.3s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    maxWidth: '400px',
    width: '90%'
  },
  modalTitle: {
    margin: '0 0 1rem 0',
    color: '#1b5e20',
    fontSize: '1.3rem',
    textTransform: 'capitalize'
  },
  modalInput: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1b5e20',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'background-color 0.3s'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'background-color 0.3s'
  }
};
