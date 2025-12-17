import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardStats {
  total_users: number;
  active_students: number;
  total_courses: number;
  total_lessons: number;
  completed_lessons: number;
  today_accesses: number;
  total_purchases: number;
  active_purchases: number;
  completion_rate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    active_students: 0,
    total_courses: 0,
    total_lessons: 0,
    completed_lessons: 0,
    today_accesses: 0,
    total_purchases: 0,
    active_purchases: 0,
    completion_rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // ========================================
      // USA A FUNÇÃO RPC admin_get_dashboard_stats
      // ========================================
      const { data, error } = await supabase.rpc('admin_get_dashboard_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast.error('Erro ao carregar estatísticas');
        return;
      }

      if (data) {
        setStats({
          total_users: data.total_users || 0,
          active_students: data.active_students || 0,
          total_courses: data.total_courses || 0,
          total_lessons: data.total_lessons || 0,
          completed_lessons: data.completed_lessons || 0,
          today_accesses: data.today_accesses || 0,
          total_purchases: data.total_purchases || 0,
          active_purchases: data.active_purchases || 0,
          completion_rate: data.completion_rate || 0
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.total_users,
      icon: Users,
      description: 'Usuários cadastrados',
      color: 'text-blue-600'
    },
    {
      title: 'Alunos Ativos',
      value: stats.active_students,
      icon: GraduationCap,
      description: 'Com acesso a cursos',
      color: 'text-green-600'
    },
    {
      title: 'Cursos Ativos',
      value: stats.total_courses,
      icon: BookOpen,
      description: 'Cursos disponíveis',
      color: 'text-purple-600'
    },
    {
      title: 'Total de Aulas',
      value: stats.total_lessons,
      icon: BookOpen,
      description: 'Aulas criadas',
      color: 'text-orange-600'
    },
    {
      title: 'Aulas Completas',
      value: stats.completed_lessons,
      icon: CheckCircle2,
      description: 'Aulas finalizadas',
      color: 'text-emerald-600'
    },
    {
      title: 'Acessos Hoje',
      value: stats.today_accesses,
      icon: Clock,
      description: 'Acessos nas últimas 24h',
      color: 'text-cyan-600'
    },
    {
      title: 'Compras Ativas',
      value: stats.active_purchases,
      icon: TrendingUp,
      description: `de ${stats.total_purchases} totais`,
      color: 'text-yellow-600'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats.completion_rate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Progresso médio',
      color: 'text-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-2">Visão geral da plataforma</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p> Sistema operacional com {stats.total_users} usuários cadastrados</p>
            <p> {stats.active_students} alunos têm acesso a {stats.total_courses} cursos ativos</p>
            <p> {stats.total_lessons} aulas disponíveis, {stats.completed_lessons} já foram concluídas</p>
            <p> {stats.active_purchases} compras ativas de {stats.total_purchases} totais</p>
            <p> Taxa de conclusão média: {stats.completion_rate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
