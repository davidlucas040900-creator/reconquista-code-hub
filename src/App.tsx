import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Paginas publicas
import Login from './pages/Login';
import AutoLogin from './pages/AutoLogin';
import SemAcesso from './pages/SemAcesso';
import NotFound from './pages/NotFound';

// Paginas do aluno
import Dashboard from './pages/Dashboard';
import Cursos from './pages/Cursos';
import CursoDetalhe from './pages/CursoDetalhe';
import Aula from './pages/Aula';
import Perfil from './pages/Perfil';
import Materiais from './pages/Materiais';

// Paginas admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCursos from './pages/admin/AdminCursos';
import AdminCursoDetalhe from './pages/admin/AdminCursoDetalhe';
import AdminAlunos from './pages/admin/AdminAlunos';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';
import AdminNotificacoes from './pages/admin/AdminNotificacoes';

// Outras paginas
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
              {/* ==================== ROTAS PUBLICAS ==================== */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auto-login" element={<AutoLogin />} />
              <Route path="/sem-acesso" element={<SemAcesso />} />
              <Route path="/test-plyr" element={<TestPlyr />} />

              {/* ==================== ROTAS PROTEGIDAS (ALUNO) ==================== */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/cursos" element={
                <ProtectedRoute>
                  <Cursos />
                </ProtectedRoute>
              } />
              
              <Route path="/curso/:courseSlug" element={
                <ProtectedRoute>
                  <CursoDetalhe />
                </ProtectedRoute>
              } />
              
              <Route path="/aula/:lessonId" element={
                <ProtectedRoute>
                  <Aula />
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } />
              
              <Route path="/materiais" element={
                <ProtectedRoute>
                  <Materiais />
                </ProtectedRoute>
              } />

              {/* ==================== ROTAS ADMIN ==================== */}
              <Route path="/admin" element={
                <ProtectedRoute requiresAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/cursos" element={
                <ProtectedRoute requiresAdmin>
                  <AdminCursos />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/cursos/:courseId" element={
                <ProtectedRoute requiresAdmin>
                  <AdminCursoDetalhe />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/alunos" element={
                <ProtectedRoute requiresAdmin>
                  <AdminAlunos />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/configuracoes" element={
                <ProtectedRoute requiresAdmin>
                  <AdminConfiguracoes />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/notificacoes" element={
                <ProtectedRoute requiresAdmin>
                  <AdminNotificacoes />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/materiais" element={
                <ProtectedRoute requiresAdmin>
                  <AdminConfiguracoes />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/drip-content" element={
                <ProtectedRoute requiresAdmin>
                  <AdminConfiguracoes />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/acessos" element={
                <ProtectedRoute requiresAdmin>
                  <AdminAlunos />
                </ProtectedRoute>
              } />

              {/* ==================== 404 ==================== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
