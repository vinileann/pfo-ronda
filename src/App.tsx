import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import RondaAlunos from './pages/RondaAlunos';
import RondaUtis from './pages/RondaUtis';
import Rondas from './pages/Rondas';
import ProtectedRoute from './components/ProtectedRoute';

// Detecta automaticamente o basename
// Em desenvolvimento: sem basename (raiz)
// Em produção: /pfo-ronda
const basename = import.meta.env.DEV ? '/' : '/pfo-ronda';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/app/alunos"
            element={
              <ProtectedRoute>
                <RondaAlunos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/utis"
            element={
              <ProtectedRoute>
                <RondaUtis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/rondas"
            element={
              <ProtectedRoute>
                <Rondas />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
