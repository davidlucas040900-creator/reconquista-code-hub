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
      } else 
