import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Páginas públicas
import Login from './pages/Login';
import AutoLogin from './pages/AutoLogin';
import NotFound from './pages/NotFound';

// Páginas do aluno
import Dashboard from './pages/Dashboard';
import Cursos from './pages/Cursos';
import CursoDetalhe from './pages/CursoDetalhe';
import Aula from './pages/Aula';

// Páginas admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCursos from './pages/admin/AdminCursos';
import AdminCursoDetalhe from './pages/admin/AdminCursoDetalhe';
import AdminAlunos from './pages/admin/AdminAlunos';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';

// Outras páginas
import TestPlyr from './pages/TestPlyr';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auto-login" element={<AutoLogin />} />
              <Route path="/test-plyr" element={<TestPlyr />} />

              {/* Rotas do Aluno */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/curso/:courseSlug" element={<CursoDetalhe />} />
              <Route path="/aula/:lessonId" element={<Aula />} />
              
              {/* ===== ROTAS ADICIONADAS ===== */}
              <Route path="/materiais" element={<Dashboard />} />
              <Route path="/meu-plano" element={<Dashboard />} />
              <Route path="/comunidade" element={<Dashboard />} />
              <Route path="/perfil" element={<Dashboard />} />

              {/* Rotas Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/cursos" element={<AdminCursos />} />
              <Route path="/admin/cursos/:courseId" element={<AdminCursoDetalhe />} />
              <Route path="/admin/alunos" element={<AdminAlunos />} />
              <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
