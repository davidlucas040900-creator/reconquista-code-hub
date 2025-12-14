// src/pages/admin/AdminDripContent.tsx

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminDripContent } from '@/hooks/useAdminDripContent';
import { useAdminStudents } from '@/hooks/useAdminStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Unlock, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminDripContent() {
  const { releases, isLoading, scheduleRelease, releaseModule } = useAdminDripContent();
  const { students } = useAdminStudents();
  const { data: courses } = useCourses();

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [releaseDate, setReleaseDate] = useState('');

  const handleSchedule = () => {
    if (!selectedUserId || !selectedModuleId || !releaseDate) return;

    scheduleRelease({
      userId: selectedUserId,
      moduleId: selectedModuleId,
      releaseDate,
    });

    setShowScheduleDialog(false);
    setSelectedUserId('');
    setSelectedModuleId('');
    setReleaseDate('');
  };

  const handleReleaseNow = (userId: string, moduleId: string) => {
    if (confirm('Liberar este módulo agora?')) {
      releaseModule({ userId, moduleId });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Carregando liberações...</div>
        </div>
      </AdminLayout>
    );
  }

  // Agrupar por status
  const pendingReleases = releases?.filter((r) => !r.is_released) || [];
  const completedReleases = releases?.filter((r) => r.is_released) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Drip Content</h1>
            <p className="text-gray-400 mt-1">
              Configure liberação gradual de módulos
            </p>
          </div>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar Liberação
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Agendadas</p>
                <h3 className="text-2xl font-bold text-white">
                  {pendingReleases.length}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Unlock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Liberadas</p>
                <h3 className="text-2xl font-bold text-white">
                  {completedReleases.length}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <h3 className="text-2xl font-bold text-white">
                  {releases?.length || 0}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Releases */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Liberações Agendadas ({pendingReleases.length})
          </h2>
          <div className="space-y-4">
            {pendingReleases.map((release) => (
              <Card key={release.id} className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        AGENDADO
                      </span>
                      <h3 className="font-semibold text-white">
                        {release.module?.name || 'Módulo'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Aluno: {release.user?.email || 'Desconhecido'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Data de liberação: {new Date(release.release_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReleaseNow(release.user_id, release.module_id)}
                    className="border-zinc-700"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Liberar Agora
                  </Button>
                </div>
              </Card>
            ))}

            {pendingReleases.length === 0 && (
              <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma liberação agendada
                </h3>
                <p className="text-gray-400">
                  Configure quando os módulos serão liberados para os alunos
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Completed Releases */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Liberações Concluídas ({completedReleases.length})
          </h2>
          <div className="space-y-4">
            {completedReleases.slice(0, 10).map((release) => (
              <Card key={release.id} className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        LIBERADO
                      </span>
                      <h3 className="font-semibold text-white">
                        {release.module?.name || 'Módulo'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Aluno: {release.user?.email || 'Desconhecido'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Liberado em: {release.released_at ? new Date(release.released_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {completedReleases.length === 0 && (
              <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
                <p className="text-gray-400">Nenhuma liberação concluída ainda</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Agendar Liberação de Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar Aluno *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Escolha um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name || student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Selecionar Módulo *</Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Escolha um módulo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  {courses?.flatMap((c) => c.course_modules || []).map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data de Liberação *</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!selectedUserId || !selectedModuleId || !releaseDate}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
