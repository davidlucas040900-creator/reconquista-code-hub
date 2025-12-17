// src/pages/admin/AdminDripContent.tsx

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminDripContent } from '@/hooks/useAdminDripContent';
import { useAdminStudents } from '@/hooks/useAdminStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Unlock,
  Plus,
  Trash2,
  Search,
  BookOpen,
  PlayCircle,
  Filter,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Constante para valor "todos" - evita string vazia no Select
const ALL_STUDENTS_VALUE = '__all__';

export default function AdminDripContent() {
  // Hooks
  const {
    moduleReleases,
    lessonReleases,
    isLoading,
    scheduleModule,
    scheduleLesson,
    releaseModuleNow,
    releaseLessonNow,
    deleteModuleRelease,
    deleteLessonRelease,
    isSchedulingModule,
    isSchedulingLesson,
  } = useAdminDripContent();

  const { students } = useAdminStudents();
  const { data: courses } = useCourses();

  // Estado do Dialog de Agendamento
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleType, setScheduleType] = useState<'module' | 'lesson'>('module');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [notes, setNotes] = useState('');

  // Estado do Dialog de Confirmação
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'module' | 'lesson';
    id: string;
    name: string;
  }>({ open: false, type: 'module', id: '', name: '' });

  // Filtros - usa valor especial ao invés de string vazia
  const [filterStudent, setFilterStudent] = useState(ALL_STUDENTS_VALUE);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados derivados com proteção contra valores vazios
  const validStudents = useMemo(() => {
    return (students || []).filter(s => s.id && s.id.trim() !== '');
  }, [students]);

  const validCourses = useMemo(() => {
    return (courses || []).filter(c => c.id && c.id.trim() !== '');
  }, [courses]);

  // Filtrar módulos do curso selecionado (com proteção)
  const availableModules = useMemo(() => {
    if (!selectedCourseId || !validCourses.length) return [];
    const course = validCourses.find(c => c.id === selectedCourseId);
    return (course?.course_modules || []).filter(m => m.id && m.id.trim() !== '');
  }, [selectedCourseId, validCourses]);

  // Filtrar aulas do módulo selecionado (com proteção)
  const availableLessons = useMemo(() => {
    if (!selectedModuleId || !availableModules.length) return [];
    const module = availableModules.find(m => m.id === selectedModuleId);
    return (module?.course_lessons || []).filter(l => l.id && l.id.trim() !== '');
  }, [selectedModuleId, availableModules]);

  // Resetar formulário
  const resetForm = () => {
    setSelectedUserId('');
    setSelectedCourseId('');
    setSelectedModuleId('');
    setSelectedLessonId('');
    setReleaseDate('');
    setNotes('');
  };

  // Handler de agendamento
  const handleSchedule = () => {
    if (!selectedUserId || !releaseDate) return;

    if (scheduleType === 'module' && selectedModuleId) {
      scheduleModule({
        userId: selectedUserId,
        moduleId: selectedModuleId,
        releaseDate,
      });
    } else if (scheduleType === 'lesson' && selectedLessonId) {
      scheduleLesson({
        userId: selectedUserId,
        lessonId: selectedLessonId,
        releaseDate,
        notes,
      });
    }

    setShowScheduleDialog(false);
    resetForm();
  };

  // Handler de delete
  const handleDelete = () => {
    if (deleteDialog.type === 'module') {
      deleteModuleRelease(deleteDialog.id);
    } else {
      deleteLessonRelease(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: 'module', id: '', name: '' });
  };

  // Filtrar releases - corrigido para usar valor especial
  const filteredModuleReleases = useMemo(() => {
    return moduleReleases.filter(r => {
      // Filtro de estudante - ignora se for "todos"
      if (filterStudent !== ALL_STUDENTS_VALUE && r.user_id !== filterStudent) {
        return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchUser = r.user?.email?.toLowerCase().includes(search) ||
                         r.user?.full_name?.toLowerCase().includes(search);
        const matchModule = r.module?.name?.toLowerCase().includes(search);
        if (!matchUser && !matchModule) return false;
      }
      return true;
    });
  }, [moduleReleases, filterStudent, searchTerm]);

  const filteredLessonReleases = useMemo(() => {
    return lessonReleases.filter(r => {
      // Filtro de estudante - ignora se for "todos"
      if (filterStudent !== ALL_STUDENTS_VALUE && r.user_id !== filterStudent) {
        return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchUser = r.user?.email?.toLowerCase().includes(search) ||
                         r.user?.full_name?.toLowerCase().includes(search);
        const matchLesson = r.lesson?.title?.toLowerCase().includes(search);
        if (!matchUser && !matchLesson) return false;
      }
      return true;
    });
  }, [lessonReleases, filterStudent, searchTerm]);

  // Stats
  const pendingModules = moduleReleases.filter(r => !r.is_released).length;
  const pendingLessons = lessonReleases.filter(r => !r.is_released).length;
  const releasedModules = moduleReleases.filter(r => r.is_released).length;
  const releasedLessons = lessonReleases.filter(r => r.is_released).length;

  // Formatar data
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Verificar se está próximo de liberar (3 dias)
  const isNearRelease = (dateStr: string) => {
    const releaseDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Drip Content</h1>
            <p className="text-gray-400 mt-1">
              Configure liberação gradual de módulos e aulas por aluno
            </p>
          </div>
          <Button
            onClick={() => {
              setShowScheduleDialog(true);
              setScheduleType('module');
            }}
            className="bg-gold hover:bg-gold-light text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agendar Liberação
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Módulos Agendados</p>
                <h3 className="text-xl font-bold text-white">{pendingModules}</h3>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Aulas Agendadas</p>
                <h3 className="text-xl font-bold text-white">{pendingLessons}</h3>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Unlock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Módulos Liberados</p>
                <h3 className="text-xl font-bold text-white">{releasedModules}</h3>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Unlock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Aulas Liberadas</p>
                <h3 className="text-xl font-bold text-white">{releasedLessons}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar por aluno, módulo ou aula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={filterStudent} onValueChange={setFilterStudent}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por aluno" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {/* ✅ CORREÇÃO: Usar valor especial ao invés de string vazia */}
                  <SelectItem value={ALL_STUDENTS_VALUE}>Todos os alunos</SelectItem>
                  {validStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name || student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="modules" className="data-[state=active]:bg-zinc-800">
              <BookOpen className="w-4 h-4 mr-2" />
              Módulos ({moduleReleases.length})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="data-[state=active]:bg-zinc-800">
              <PlayCircle className="w-4 h-4 mr-2" />
              Aulas ({lessonReleases.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Módulos */}
          <TabsContent value="modules" className="space-y-4">
            {filteredModuleReleases.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma liberação de módulo
                </h3>
                <p className="text-gray-400 mb-4">
                  Configure quando os módulos serão liberados para os alunos
                </p>
                <Button
                  onClick={() => {
                    setScheduleType('module');
                    setShowScheduleDialog(true);
                  }}
                  variant="outline"
                  className="border-zinc-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Primeiro Módulo
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredModuleReleases.map((release) => (
                  <Card
                    key={release.id}
                    className={`bg-zinc-900 border-zinc-800 p-4 ${
                      isNearRelease(release.release_date) && !release.is_released
                        ? 'border-l-4 border-l-yellow-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant={release.is_released ? 'default' : 'secondary'}
                            className={
                              release.is_released
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {release.is_released ? 'LIBERADO' : 'AGENDADO'}
                          </Badge>
                          {isNearRelease(release.release_date) && !release.is_released && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              EM BREVE
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-white truncate">
                          {release.module?.name || 'Módulo'}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                          <span>👤 {release.user?.full_name || release.user?.email}</span>
                          <span>
                            📅 {release.is_released
                              ? `Liberado em ${formatDate(release.released_at || release.release_date)}`
                              : `Libera em ${formatDate(release.release_date)}`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!release.is_released && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => releaseModuleNow({
                              userId: release.user_id,
                              moduleId: release.module_id,
                            })}
                            className="border-zinc-700 hover:bg-green-500/10 hover:text-green-400"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({
                            open: true,
                            type: 'module',
                            id: release.id,
                            name: release.module?.name || 'Módulo',
                          })}
                          className="border-zinc-700 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab Aulas */}
          <TabsContent value="lessons" className="space-y-4">
            {filteredLessonReleases.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma liberação de aula
                </h3>
                <p className="text-gray-400 mb-4">
                  Configure quando aulas específicas serão liberadas
                </p>
                <Button
                  onClick={() => {
                    setScheduleType('lesson');
                    setShowScheduleDialog(true);
                  }}
                  variant="outline"
                  className="border-zinc-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Primeira Aula
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLessonReleases.map((release) => (
                  <Card
                    key={release.id}
                    className={`bg-zinc-900 border-zinc-800 p-4 ${
                      isNearRelease(release.release_date) && !release.is_released
                        ? 'border-l-4 border-l-orange-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant={release.is_released ? 'default' : 'secondary'}
                            className={
                              release.is_released
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }
                          >
                            {release.is_released ? 'LIBERADO' : 'AGENDADO'}
                          </Badge>
                          <Badge variant="outline" className="border-zinc-700 text-gray-400">
                            AULA
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-white truncate">
                          {release.lesson?.title || 'Aula'}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                          <span>👤 {release.user?.full_name || release.user?.email}</span>
                          <span>
                            📅 {release.is_released
                              ? `Liberado em ${formatDate(release.released_at || release.release_date)}`
                              : `Libera em ${formatDate(release.release_date)}`
                            }
                          </span>
                        </div>

                        {release.notes && (
                          <p className="mt-2 text-xs text-gray-500 italic">
                            📝 {release.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!release.is_released && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => releaseLessonNow({
                              userId: release.user_id,
                              lessonId: release.lesson_id,
                            })}
                            className="border-zinc-700 hover:bg-green-500/10 hover:text-green-400"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({
                            open: true,
                            type: 'lesson',
                            id: release.id,
                            name: release.lesson?.title || 'Aula',
                          })}
                          className="border-zinc-700 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Agendamento */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar Liberação</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure quando o conteúdo será liberado para o aluno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de liberação */}
            <div>
              <Label>Tipo de Liberação</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={scheduleType === 'module' ? 'default' : 'outline'}
                  onClick={() => {
                    setScheduleType('module');
                    setSelectedLessonId('');
                  }}
                  className={scheduleType === 'module' ? 'bg-gold text-black' : 'border-zinc-700'}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Módulo
                </Button>
                <Button
                  type="button"
                  variant={scheduleType === 'lesson' ? 'default' : 'outline'}
                  onClick={() => setScheduleType('lesson')}
                  className={scheduleType === 'lesson' ? 'bg-gold text-black' : 'border-zinc-700'}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Aula
                </Button>
              </div>
            </div>

            {/* Selecionar Aluno */}
            <div>
              <Label>Selecionar Aluno *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue placeholder="Escolha um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {validStudents.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Nenhum aluno encontrado
                    </div>
                  ) : (
                    validStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name || student.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Curso */}
            <div>
              <Label>Selecionar Curso *</Label>
              <Select
                value={selectedCourseId}
                onValueChange={(val) => {
                  setSelectedCourseId(val);
                  setSelectedModuleId('');
                  setSelectedLessonId('');
                }}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue placeholder="Escolha um curso" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {validCourses.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Nenhum curso encontrado
                    </div>
                  ) : (
                    validCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Módulo */}
            <div>
              <Label>Selecionar Módulo *</Label>
              <Select
                value={selectedModuleId}
                onValueChange={(val) => {
                  setSelectedModuleId(val);
                  setSelectedLessonId('');
                }}
                disabled={!selectedCourseId}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue placeholder={selectedCourseId ? "Escolha um módulo" : "Selecione um curso primeiro"} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {availableModules.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      {selectedCourseId ? 'Nenhum módulo encontrado' : 'Selecione um curso primeiro'}
                    </div>
                  ) : (
                    availableModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Aula (só para tipo lesson) */}
            {scheduleType === 'lesson' && (
              <div>
                <Label>Selecionar Aula *</Label>
                <Select
                  value={selectedLessonId}
                  onValueChange={setSelectedLessonId}
                  disabled={!selectedModuleId}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                    <SelectValue placeholder={selectedModuleId ? "Escolha uma aula" : "Selecione um módulo primeiro"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {availableLessons.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        {selectedModuleId ? 'Nenhuma aula encontrada' : 'Selecione um módulo primeiro'}
                      </div>
                    ) : (
                      availableLessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data de Liberação */}
            <div>
              <Label>Data de Liberação *</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>

            {/* Notas (só para aulas) */}
            {scheduleType === 'lesson' && (
              <div>
                <Label>Notas (opcional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Liberação especial após mentoria"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleDialog(false);
                resetForm();
              }}
              className="border-zinc-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={
                !selectedUserId ||
                !releaseDate ||
                (scheduleType === 'module' && !selectedModuleId) ||
                (scheduleType === 'lesson' && !selectedLessonId) ||
                isSchedulingModule ||
                isSchedulingLesson
              }
              className="bg-gold hover:bg-gold-light text-black"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isSchedulingModule || isSchedulingLesson ? 'Agendando...' : 'Agendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Agendamento</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja remover o agendamento de "{deleteDialog.name}"?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}