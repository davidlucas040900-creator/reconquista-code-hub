// src/pages/admin/AdminAlunos.tsx

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Aluno {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  has_full_access: boolean;
  created_at: string;
  purchase_date: string | null;
}

interface AlunoProgress {
  lessonTitle: string;
  completed: boolean;
  watchPercentage: number;
}

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [alunoProgress, setAlunoProgress] = useState<AlunoProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchAlunos();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = alunos.filter(
        (a) =>
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.full_name?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAlunos(filtered);
    } else {
      setFilteredAlunos(alunos);
    }
  }, [search, alunos]);

  const fetchAlunos = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    setAlunos(data || []);
    setFilteredAlunos(data || []);
    setLoading(false);
  };

  const viewProgress = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setProgressLoading(true);

    const { data } = await supabase
      .from('user_lesson_progress')
      .select(`
        *,
        course_lessons:lesson_id (title)
      `)
      .eq('user_id', aluno.id);

    const progress: AlunoProgress[] = (data || []).map((p: any) => ({
      lessonTitle: p.course_lessons?.title || 'Aula',
      completed: p.is_completed,
      watchPercentage: p.watch_percentage || 0,
    }));

    setAlunoProgress(progress);
    setProgressLoading(false);
  };

  const toggleAccess = async (aluno: Aluno) => {
    await supabase
      .from('profiles')
      .update({ has_full_access: !aluno.has_full_access })
      .eq('id', aluno.id);

    fetchAlunos();
  };

  return (
    <AdminLayout title="Alunos" breadcrumb={[{ label: 'Alunos' }]}>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de Alunos</p>
          <p className="text-2xl font-semibold">{alunos.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Com Acesso</p>
          <p className="text-2xl font-semibold text-green-600">
            {alunos.filter((a) => a.has_full_access).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Sem Acesso</p>
          <p className="text-2xl font-semibold text-red-600">
            {alunos.filter((a) => !a.has_full_access).length}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">WhatsApp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acesso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cadastro</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                filteredAlunos.map((aluno) => (
                  <tr key={aluno.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {aluno.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{aluno.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {aluno.whatsapp || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {aluno.has_full_access ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="h-4 w-4" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(aluno.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewProgress(aluno)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={aluno.has_full_access ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleAccess(aluno)}
                        >
                          {aluno.has_full_access ? 'Revogar' : 'Liberar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Progress Modal */}
      <Dialog open={!!selectedAluno} onOpenChange={() => setSelectedAluno(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Progresso de {selectedAluno?.full_name || selectedAluno?.email}</DialogTitle>
          </DialogHeader>

          {progressLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : alunoProgress.length === 0 ? (
            <p className="text-muted-foreground">Nenhum progresso registrado.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alunoProgress.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {p.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm">{p.lessonTitle}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.watchPercentage}%</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
