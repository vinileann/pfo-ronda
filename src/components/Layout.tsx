import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Building2, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-secundaria border-t border-primaria/30 h-20">
        <div className="max-w-screen-xl mx-auto h-full grid grid-cols-3 items-center px-4">
          {/* Ícones da esquerda - Rondas */}
          <div className="flex gap-2 justify-start">
            <button
              onClick={() => navigate('/app/alunos')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                isActive('/app/alunos')
                  ? 'bg-primaria text-fundo'
                  : 'text-texto hover:bg-primaria/20'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs mt-1">Alunos</span>
            </button>

            <button
              onClick={() => navigate('/app/utis')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                isActive('/app/utis')
                  ? 'bg-primaria text-fundo'
                  : 'text-texto hover:bg-primaria/20'
              }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-xs mt-1">UTIs</span>
            </button>
          </div>

          {/* Logo no centro */}
          <div className="flex justify-center">
            <img
              src="/pfo-ronda/logo-vinho.svg"
              alt="Logo"
              className="h-14 w-auto"
              onError={(e) => {
                // Fallback se a imagem não existir
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Ícones da direita - Rondas e Sair */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => navigate('/app/rondas')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                isActive('/app/rondas')
                  ? 'bg-primaria text-fundo'
                  : 'text-texto hover:bg-primaria/20'
              }`}
            >
              <History className="w-6 h-6" />
              <span className="text-xs mt-1">Rondas</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs mt-1">Sair</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
