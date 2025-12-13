import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronDown, ChevronRight, PlayCircle, Circle, Loader2, Lock } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-medium text-zinc-100 truncate">{courseName}</h1>
          </div>
        </div>
      </header>

      {/* ========== MAIN ========== */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-3">
        {modules.map((mod, modIndex) => (
          <div key={mod.id} className="overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/30">
            <Collapsible open={expandedModules.has(mod.id)} onOpenChange={() => toggleModule(mod.id)}>
              <CollapsibleTrigger className="w-full p-5 text-left flex items-center gap-4 hover:bg-zinc-900/50">
                {expandedModules.has(mod.id) ? (
                  <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-wider text-zinc-500">
                    Módulo {modIndex + 1}
                  </span>
                  <h3 className="mt-0.5 font-medium text-zinc-100">{mod.name}</h3>
                </div>
                <span className="text-sm tabular-nums text-zinc-400 flex-shrink-0">
                  {mod.lessons.length} aulas
                </span>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="border-t border-zinc-800/50">
                  {mod.lessons.map((lesson, i) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/aula/${lesson.id}`)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-900/50 border-b border-zinc-800/30 last:border-0 group"
                    >
                      <Circle className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-zinc-500 tabular-nums">
                            {modIndex + 1}.{i + 1}
                          </span>
                          {lesson.is_bonus && (
                            <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-medium">
                              BÔNUS
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-200 group-hover:text-zinc-100">
                          {lesson.title}
                        </p>
                      </div>
                      <PlayCircle className="h-4 w-4 text-zinc-600 flex-shrink-0 group-hover:text-zinc-400" />
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="mt-auto border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <p className="text-center text-xs text-zinc-600">
            © 2024 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
