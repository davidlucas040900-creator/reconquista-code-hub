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
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
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
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');

    setCourses(data || []);
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
      const { error } = await supabase.from('courses').insert({
        ...data,
        order_index: courses.length,
      });

      if (error) {
        toast.error('Erro ao criar curso');
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : courses.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum curso</h3>
          <p className="text-muted-foreground mb-4">Crie seu primeiro curso.</p>
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
                <div className="h-16 w-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">{course.name}</h3>
                    {!course.is_active && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.price ? `${course.price} MZN` : 'Sem preço'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={course.is_active} onCheckedChange={() => toggleActive(course)} />
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/cursos/${course.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(course)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Curso *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Ex: O Código da Reconquista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="codigo-da-reconquista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do curso..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">URL da Thumbnail</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (MZN)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="197"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Curso Ativo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : selectedCourse ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os módulos e aulas também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}