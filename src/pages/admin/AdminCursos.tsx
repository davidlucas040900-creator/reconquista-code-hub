// src/pages/admin/AdminCursos.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, GripVertical, BookOpen } from 'lucide-react';
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
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  _count?: {
    modules: number;
    lessons: number;
  };
}

const emptyCourse = {
  name: '',
  slug: '',
  description: '',
  thumbnail: '',
  price: 0,
  is_active: true,
};

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');

    if (coursesData) {
      // Buscar contagem de módulos e aulas para cada curso
      const coursesWithCounts = await Promise.all(
        coursesData.map(async (course) => {
          const { count: modulesCount } = await supabase
            .from('course_modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          const { data: modules } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id);

          let lessonsCount = 0;
          if (modules && modules.length > 0) {
            const moduleIds = modules.map((m) => m.id);
            const { count } = await supabase
              .from('course_lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds);
            lessonsCount = count || 0;
          }

          return {
            ...course,
            _count: {
              modules: modulesCount || 0,
              lessons: lessonsCount,
            },
          };
        })
      );

      setCourses(coursesWithCounts);
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

  const openCreateDialog = () => {
    setSelectedCourse(null);
    setFormData(emptyCourse);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      slug: course.slug,
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price || 0,
      is_active: course.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);

    const slug = formData.slug || generateSlug(formData.name);
    const data = {
      name: formData.name,
      slug,
      description: formData.description || null,
      thumbnail: formData.thumbnail || null,
      price: formData.price || null,
      is_active: formData.is_active,
    };

    if (selectedCourse) {
      // Atualizar
      const { error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', selectedCourse.id);

      if (error) {
        toast.error('Erro ao atualizar curso');
      } else {
        toast.success('Curso atualizado');
        setIsDialogOpen(false);
        fetchCourses();
      }
    } else {
      // Criar
      const { error } = await supabase.from('courses').insert({
        ...data,
        order_index: courses.length,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um curso com este slug');
        } else {
          toast.error('Erro ao criar curso');
        }
      } else {
        toast.success('Curso criado');
        setIsDialogOpen(false);
        fetchCourses();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', selectedCourse.id);

    if (error) {
      toast.error('Erro ao excluir curso');
    } else {
      toast.success('Curso excluído');
      setIsDeleteOpen(false);
      fetchCourses();
    }
  };

  const toggleActive = async (course: Course) => {
    await supabase
      .from('courses')
      .update({ is_active: !course.is_active })
      .eq('id', course.id);

    fetchCourses();
  };

  return (
    <AdminLayout title="Cursos" breadcrumb={[{ label: 'Cursos' }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* Courses List */}
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : courses.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum curso</h3>
          <p className="text-muted-foreground mb-4">Crie seu primeiro curso para começar.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Curso
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                {/* Thumbnail */}
                <div className="h-16 w-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">{course.name}</h3>
                    {!course.is_active && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course._count?.modules || 0} módulos • {course._count?.lessons || 0} aulas
                    {course.price && ` • ${course.price} MZN`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={course.is_active}
                    onCheckedChange={() => toggleActive(course)}
                  />
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/cursos/${course.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(course)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Novo Curso'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Curso *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="Ex: O Código da Reconquista"
              />
            </div>

            <div className="space-y-2">
              
