// src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, PlayCircle, TrendingUp } from 'lucide-react';

interface Stats {
  totalAlunos: number;
  alunosAtivos: number;
  totalCursos: number;
  totalAulas: number;
  aulasCompletas: number;
  acessosHoje: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    alunosAtivos: 0,
    totalCursos: 0,
    totalAulas: 0,
    aulasCompletas: 0,
    acessosHoje: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Total de alunos
      const { count: totalAlunos } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // Alunos com acesso
      const { count: alunosAtivos } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('has_full_access', true);

      // Total de cursos
      const { count: totalCursos } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total de aulas
      const { count: totalAulas } = await supabase
        .from('course_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Aulas completadas (total)
      const { count: aulasCompletas } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // Acessos hoje
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

      // Atividade recente
      const { data: activity } = await supabase
        .from('access_logs')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(activity || []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total de Alunos', value: stats.totalAlunos, icon: Users, color: 'text-blue-600' },
    { label: 'Alunos Ativos', value: stats.alunosAtivos, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Cursos', value: stats.totalCursos, icon: BookOpen, color: 'text-purple-600' },
    { label: 'Aulas', value: stats.totalAulas, icon: PlayCircle, color: 'text-orange-600' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-md bg-accent p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Aulas Completadas</p>
          <p className="text-3xl font-semibold text-foreground">{stats.aulasCompletas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Acessos Hoje</p>
          <p className="text-3xl font-semibold text-foreground">{stats.acessosHoje}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-semibold text-foreground">
            {stats.totalAlunos > 0 
              ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100) 
              : 0}%
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Atividade Recente</h2>
        
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma atividade registrada.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {log.profiles?.full_name || log.profiles?.email || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground">{log.action}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
