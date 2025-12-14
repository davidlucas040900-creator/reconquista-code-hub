// src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  BookOpen, 
  PlayCircle, 
  TrendingUp, 
  Bell, 
  Settings, 
  FileText,
  Lock,
  Unlock,
  Key,
  Palette,
  Calendar,
  Send
} from 'lucide-react';

interface Stats {
  totalAlunos: number;
  alunosAtivos: number;
  totalCursos: number;
  totalAulas: number;
  aulasCompletas: number;
  acessosHoje: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    alunosAtivos: 0,
    totalCursos: 0,
    totalAulas: 0,
    aulasCompletas: 0,
    acessosHoje: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: totalAlunos } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    const { count: alunosAtivos } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('has_full_access', true);

    const { count: totalCursos } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalAulas } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: aulasCompletas } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: acessosHoje } = await supabase
      .from('access_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    setStats({
      totalAlunos: totalAlunos || 0,
      alunosAtivos: alunosAtivos || 0,
      totalCursos: totalCursos || 0,
      totalAulas: totalAulas || 0,
      aulasCompletas: aulasCompletas || 0,
      acessosHoje: acessosHoje || 0,
    });
    setLoading(false);
  };

  const statCards = [
    { label: 'Total de Alunos', value: stats.totalAlunos, icon: Users, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'Alunos Ativos', value: stats.alunosAtivos, icon: TrendingUp, color: 'text-green-400 bg-green-500/20' },
    { label: 'Cursos', value: stats.totalCursos, icon: BookOpen, color: 'text-purple-400 bg-purple-500/20' },
    { label: 'Aulas', value: stats.totalAulas, icon: PlayCircle, color: 'text-orange-400 bg-orange-500/20' },
  ];

  const quickActions = [
    { label: 'Gerenciar Alunos', icon: Users, href: '/admin/alunos', color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' },
    { label: 'Gerenciar Cursos', icon: BookOpen, href: '/admin/cursos', color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400' },
    { label: 'Materiais', icon: FileText, href: '/admin/materiais', color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400' },
    { label: 'Enviar Notificação', icon: Send, href: '/admin/notificacoes', color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400' },
    { label: 'Drip Content', icon: Calendar, href: '/admin/drip-content', color: 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400' },
    { label: 'Controle de Acesso', icon: Lock, href: '/admin/acessos', color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400' },
    { label: 'Senha Universal', icon: Key, href: '/admin/configuracoes', color: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' },
    { label: 'Personalização', icon: Palette, href: '/admin/configuracoes', color: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4 bg-noir-900/50 border-white/10">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '' : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="p-4 bg-noir-900/50 border-white/10">
          <p className="text-sm text-gray-400 mb-1">Aulas Completadas</p>
          <p className="text-3xl font-bold text-white">{stats.aulasCompletas}</p>
        </Card>
        <Card className="p-4 bg-noir-900/50 border-white/10">
          <p className="text-sm text-gray-400 mb-1">Acessos Hoje</p>
          <p className="text-3xl font-bold text-white">{stats.acessosHoje}</p>
        </Card>
        <Card className="p-4 bg-noir-900/50 border-white/10">
          <p className="text-sm text-gray-400 mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-bold text-gold">
            {stats.totalAlunos > 0
              ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100)
              : 0}%
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${action.color} border border-white/5`}
          >
            <action.icon className="w-5 h-5" />
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </AdminLayout>
  );
}
