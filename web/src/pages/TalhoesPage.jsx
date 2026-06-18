import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getUser, logout } from '../services/api';

export default function TalhoesPage() {
  const user = getUser();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  const talhoes = [
    { id: 1, nome: 'Talhão 1', cultura: 'Soja', area: 150, status: 'Saudável' },
    { id: 2, nome: 'Talhão 2', cultura: 'Milho', area: 200, status: 'Atenção' },
    { id: 3, nome: 'Talhão 3', cultura: 'Soja', area: 180, status: 'Saudável' },
  ];

  return (
    <>
      <Sidebar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>🌱 Talhões</h1>
            <p style={styles.subtitle}>Informações de cada área da fazenda</p>
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
          {talhoes.map(talhao => (
            <div key={talhao.id} style={styles.talhoesCard}>
              <div style={styles.talhoesHeader}>
                <h3 style={styles.talhoesName}>{talhao.nome}</h3>
                <span style={{
                  ...styles.talhoesStatus,
                  backgroundColor: talhao.status === 'Saudável' ? '#e8f5e9' : '#fff3cd',
                  color: talhao.status === 'Saudável' ? '#1b5e20' : '#cc8800'
                }}>
                  {talhao.status}
                </span>
              </div>

              <div style={styles.talhoesInfo}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Cultura</span>
                  <span style={styles.infoValue}>{talhao.cultura}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Área</span>
                  <span style={styles.infoValue}>{talhao.area} ha</span>
                </div>
              </div>
            </div>
          ))}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  talhoesCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s'
  },
  talhoesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  talhoesName: {
    margin: 0,
    color: '#1b5e20',
    fontSize: '1.1rem'
  },
  talhoesStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  talhoesInfo: {
    display: 'flex',
    gap: '1rem'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLabel: {
    color: '#999',
    fontSize: '0.85rem',
    marginBottom: '0.25rem'
  },
  infoValue: {
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: '600'
  }
};
