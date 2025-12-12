import TestPlyr from './pages/TestPlyr';
// src/App.tsx

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// PÃ¡ginas pÃºblicas
import Login from './pages/Login';
import AutoLogin from './pages/AutoLogin';
import NotFound from './pages/NotFound';

// PÃ¡ginas do aluno
import Dashboard from './pages/Dashboard';
import Cursos from './pages/Cursos';
import CursoDetalhe from './pages/CursoDetalhe';
import Aula from './pages/Aula';

// PÃ¡ginas admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCursos from './pages/admin/AdminCursos';
import AdminCursoDetalhe from './pages/admin/AdminCursoDetalhe';
import AdminAlunos from './pages/admin/AdminAlunos';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';

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
              {/* Rotas PÃºblicas */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/test-plyr" element={<TestPlyr />} />
          <Route path="/login" element={<Login />} />
              <Route path="/auto-login" element={<AutoLogin />} />

              {/* Rotas do Aluno */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/curso/:courseSlug" element={<CursoDetalhe />} />
              <Route path="/aula/:lessonId" element={<Aula />} />

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

