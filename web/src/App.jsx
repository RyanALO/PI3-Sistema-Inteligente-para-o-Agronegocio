import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MetricasPage from './pages/MetricasPage';
import FazendaPage from './pages/FazendaPage';
import TalhoesPage from './pages/TalhoesPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/metricas" element={<ProtectedRoute><MetricasPage /></ProtectedRoute>} />
        <Route path="/fazenda" element={<ProtectedRoute><FazendaPage /></ProtectedRoute>} />
        <Route path="/talhoes" element={<ProtectedRoute><TalhoesPage /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
