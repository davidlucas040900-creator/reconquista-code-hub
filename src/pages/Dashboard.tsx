// src/pages/Dashboard.tsx

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Play, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const topics = [
  { id: 'all', name: 'Todos', icon: '' },
  { id: 'reconquista', name: 'Reconquista', icon: '' },
  { id: 'seducao', name: 'Sedução', icon: '' },
  { id: 'sexo', name: 'Sexo', icon: '' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: courses, isLoading, error } = useCourses();
  const [activeTopic, setActiveTopic] = useState('all');

  console.log('[Dashboard] Renderizando... isLoading:', isLoading, 'courses:', courses?.length);

  if (error) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center p-4">
        <div className="text-center text-red-400">
          <p>Erro ao carregar</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      <Header />

      <main className="pt-16 pb-20 px-4">
        {/* Saudação Simples */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Bem-vinda de volta!
          </h1>
          <p className="text-gray-400 text-sm">
            Escolha um curso para continuar
          </p>
        </div>

        {/* Lista Simples de Cursos */}
        <div className="space-y-4">
          {(courses || []).map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/curso/${course.slug}`)}
              className="bg-noir-900 rounded-xl p-4 border border-white/10 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {course.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {course.course_modules?.length || 0} módulos
                  </p>
                </div>
                <Play className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
