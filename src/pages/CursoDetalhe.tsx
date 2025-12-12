import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronDown, ChevronRight, PlayCircle, Circle, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Module {
  id: string;
  name: string;
  lessons: { id: string; title: string; is_bonus: boolean }[];
}

export default function CursoDetalhe() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && courseSlug) {
      fetchCourse();
    }
  }, [user, courseSlug]);

  const fetchCourse = async () => {
    const { data: course } = await supabase
      .from('courses')
      .select('id, name')
      .eq('slug', courseSlug)
      .single();

    if (!course) {
      navigate('/cursos');
      return;
    }

    setCourseName(course.name);

    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('id, name')
      .eq('course_id', course.id)
      .eq('is_active', true)
      .order('order_index');

    if (modulesData) {
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('id, title, is_bonus')
            .eq('module_id', mod.id)
            .eq('is_active', true)
            .order('order_index');
          return { ...mod, lessons: lessons || [] };
        })
      );
      setModules(modulesWithLessons);
      if (modulesWithLessons.length > 0) {
        setExpandedModules(new Set([modulesWithLessons[0].id]));
      }
    }

    setLoading(false);
  };

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedModules(newSet);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground truncate">{courseName}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-3">
        {modules.map((mod, modIndex) => (
          <Card key={mod.id} className="overflow-hidden">
            <Collapsible open={expandedModules.has(mod.id)} onOpenChange={() => toggleModule(mod.id)}>
              <CollapsibleTrigger className="w-full p-4 text-left flex items-center gap-3">
                {expandedModules.has(mod.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Módulo {modIndex + 1}</span>
                  <h3 className="font-medium text-foreground">{mod.name}</h3>
                </div>
                <span className="text-sm text-muted-foreground">{mod.lessons.length} aulas</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border">
                  {mod.lessons.map((lesson, i) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/aula/${lesson.id}`)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 border-b border-border last:border-0"
                    >
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {modIndex + 1}.{i + 1}
                          </span>
                          {lesson.is_bonus && (
                            <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">
                              Bônus
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground">{lesson.title}</p>
                      </div>
                      <PlayCircle className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </main>
    </div>
  );
}