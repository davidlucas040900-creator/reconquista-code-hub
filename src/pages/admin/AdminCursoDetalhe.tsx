// src/pages/admin/AdminCursoDetalhe.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  slug: string;
}

interface Module {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  is_bonus: boolean;
  is_active: boolean;
}

const emptyModule = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
};

const emptyLesson = {
  title: '',
  description: '',
  video_url: '',
  duration_minutes: 0,
  is_free: false,
  is_bonus: false,
  is_active: true,
};

export default function AdminCursoDetalhe() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Module dialog
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState(emptyModule);

  // Lesson dialog
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  // Delete dialogs
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchModules();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data } = await supabase
      .from('courses')
      .select('id, name, slug')
      .eq('id', courseId)
      .single();

    if (data) {
      setCourse(data);
    } else {
      navigate('/admin/cursos');
    }
  };

  const fetchModules = async () => {
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (data) {
      setModules(data);
      // Fetch lessons for each module
      const lessonsMap: Record<string, Lesson[]> = {};
      for (const mod of data) {
        const { data: lessonData } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('order_index');
        lessonsMap[mod.id] = lessonData || [];
      }
      setLessons(lessonsMap);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // ============ MODULE HANDLERS ============

  const openCreateModule = () => {
    setSelectedModule(null);
    setModuleForm(emptyModule);
    setIsModuleDialogOpen(true);
  };

  const openEditModule = (mod: Module) => {
    setSelectedModule(mod);
    setModuleForm({
      name: mod.name,
      slug: mod.slug,
      description: mod.description || '',
      is_active: mod.is_active,
    });
    setIsModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);
    const slug = moduleForm.slug || generateSlug(moduleForm.name);

    if (selectedModule) {
      const { error } = await supabase
        .from('course_modules')
        .update({
          name: moduleForm.name,
          slug,
          description: moduleForm.description || null,
          is_active: moduleForm.is_active,
        })
        .eq('id', selectedModule.id);

      if (error) {
        toast.error('Erro ao atualizar módulo');
      } else {
        toast.success('Módulo atualizado');
        setIsModuleDialogOpen(false);
        fetchModules();
      }
    } else {
      const { error } = await supabase.from('course_modules').insert({
        course_id: courseId,
        name: moduleForm.name,
        slug,
        description: moduleForm.description || null,
        is_active: moduleForm.is_active,
        order_index: modules.length,
      });

      if (error) {
        toast.error('Erro ao criar módulo');
      } else {
        toast.success('Módulo criado');
        setIsModuleDialogOpen(false);
        fetchModules();
      }
    }

    setSaving(false);
  };

  const handleDeleteModule = async () => {
    if (!deleteModuleId) return;

    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', deleteModuleId);

    if (error) {
      toast.error('Erro ao excluir módulo');
    } else {
      toast.success('Módulo excluído');
      setDeleteModuleId(null);
      fetchModules();
    }
  };

  // ============ LESSON HANDLERS ============

  const openCreateLesson = (moduleId: string) => {
    setSelectedLesson(null);
    setLessonModuleId(moduleId);
    setLessonForm(emptyLesson);
    setIsLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonModuleId(lesson.module_id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || 0,
      is_free: lesson.is_free,
      is_bonus: lesson.is_bonus,
      is_active: lesson.is_active,
    });
    setIsLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);

    const lessonData = {
      title: lessonForm.title,
      description: lessonForm.description || null,
      video_url: lessonForm.video_url || null,
      duration_minutes: lessonForm.duration_minutes || null,
      is_free: lessonForm.is_free,
      is_bonus: lessonForm.is_bonus,
      is_active: lessonForm.is_active,
    };

    if (selectedLesson) {
      const { error } = await supabase
        .from('course_lessons')
        .update(lessonData)
        .eq('id', selectedLesson.id);

      if (error) {
        toast.error('Erro ao atualizar aula');
      } else {
        toast.success('Aula atualizada');
        setIsLessonDialogOpen(false);
        fetchModules();
      }
    } else {
      const moduleLessons = lessons[lessonModuleId!] || [];
      const { error } = await supabase.from('course_lessons').insert({
        module_id: lessonModuleId,
        ...lessonData,
        order_index: moduleLessons.length,
      });

      if (error) {
        toast.error('Erro ao criar aula');
      } else {
        toast.success('Aula criada');
        setIsLessonDialogOpen(false);
        fetchModules();
      }
    }

    setSaving(false);
  };

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;

    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', deleteLessonId);

    if (error) {
      toast.error('Erro ao excluir aula');
    } else {
      toast.success('Aula excluída');
      setDeleteLessonId(null);
      fetchModules();
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Carregando...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={course?.name || 'Curso'}
      breadcrumb={[
        { label: 'Cursos', href: '/admin/cursos' },
        { label: course?.name || 'Curso' },
      ]}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}
        </p>
        <Button onClick={openCreateModule}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhum módulo criado ainda.</p>
          <Button onClick={openCreateModule}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Módulo
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, modIndex) => (
            <Card key={mod.id} className="overflow-hidden">
              <Collapsible
                open={expandedModules.has(mod.id)}
                onOpenChange={() => toggleModule(mod.id)}
              >
                {/* Module Header */}
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                    {expandedModules.has(mod.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Módulo {modIndex + 1}
                        </span>
                        {!mod.is_active && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-foreground">{mod.name}</h3>
                    </div>
                  </CollapsibleTrigger>

                  <span className="text-sm text-muted-foreground">
                    {lessons[mod.id]?.length || 0} aulas
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModule(mod);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModuleId(mod.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Lessons List */}
                <CollapsibleContent>
                  <div className="border-t border-border bg-muted/30 p-4 space-y-2">
                    {(lessons[mod.id] || []).map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-background rounded-md border border-border"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                        <PlayCircle className="h-4 w-4 text-muted-foreground" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {modIndex + 1}.{lessonIndex + 1}
                            </span>
                            <span className="font-medium text-sm text-foreground truncate">
                              {lesson.title}
                            </span>
                            {lesson.is_bonus && (
                              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">
                                Bônus
                              </span>
                            )}
                            {lesson.is_free && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                                Grátis
                              </span>
                            )}
                          </div>
                        </div>

                        {lesson.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration_minutes} min
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditLesson(lesson)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteLessonId(lesson.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => openCreateLesson(mod.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Aula
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mod-name">Nome do Módulo *</Label>
              <Input
                id="mod-name"
                value={moduleForm.name}
                onChange={(e) =>
                  setModuleForm({
                    ...moduleForm,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }
                placeholder="Ex: Reset Emocional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mod-description">Descrição</Label>
              <Textarea
                id="mod-description"
                value={moduleForm.description}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, description: e.target.value })
                }
                placeholder="Descrição do módulo..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mod-active">Módulo Ativo</Label>
              <Switch
                id="mod-active"
                checked={moduleForm.is_active}
                onCheckedChange={(checked) =>
                  setModuleForm({ ...moduleForm, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModule} disabled={saving}>
              {saving ? 'Salvando...' : selectedModule ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Título da Aula *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
                placeholder="Ex: Os Homens Sempre Voltam"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Descrição</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, description: e.target.value })
                }
                placeholder="Descrição da aula..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-video">ID do Vídeo (YouTube)</Label>
              <Input
                id="lesson-video"
                value={lessonForm.video_url}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, video_url: e.target.value })
                }
                placeholder="Ex: dQw4w9WgXcQ"
              />
              <p className="text-xs text-muted-foreground">
                Cole apenas o ID do vídeo do YouTube (a parte depois de v=)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duração (minutos)</Label>
              <Input
                id="lesson-duration"
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    duration_minutes: Number(e.target.value),
                  })
                }
                placeholder="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lesson-free">Aula Gratuita</Label>
              <Switch
                id="lesson-free"
                checked={lessonForm.is_free}
                onCheckedChange={(checked) =>
                  setLessonForm({ ...lessonForm, is_free: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lesson-bonus">Aula Bônus</Label>
              <Switch
                id="lesson-bonus"
                checked={lessonForm.is_bonus}
                onCheckedChange={(checked) =>
                  setLessonForm({ ...lessonForm, is_bonus: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lesson-active">Aula Ativa</Label>
              <Switch
                id="lesson-active"
                checked={lessonForm.is_active}
                onCheckedChange={(checked) =>
                  setLessonForm({ ...lessonForm, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson} disabled={saving}>
              {saving ? 'Salvando...' : selectedLesson ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Confirmation */}
      <AlertDialog open={!!deleteModuleId} onOpenChange={() => setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as aulas deste módulo também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Confirmation */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={() => setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
