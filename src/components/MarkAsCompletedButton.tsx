import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { useModuleProgress } from '@/hooks/useModuleProgress';
import { toast } from 'sonner';

interface MarkAsCompletedButtonProps {
  moduleId: number;
  lessonId: number;
}

export const MarkAsCompletedButton = ({ moduleId, lessonId }: MarkAsCompletedButtonProps) => {
  const { isLessonCompleted, markLessonComplete } = useModuleProgress();
  const [isLoading, setIsLoading] = useState(false);
  const completed = isLessonCompleted(moduleId, lessonId);

  const handleMarkComplete = async () => {
    setIsLoading(true);
    try {
      await markLessonComplete(moduleId, lessonId);
      toast.success('Aula marcada como concluída! 🎉');
    } catch (error) {
      toast.error('Erro ao marcar aula como concluída');
    } finally {
      setIsLoading(false);
    }
  };

  if (completed) {
    return (
      <Button
        disabled
        className="w-full bg-green-500 hover:bg-green-500 text-white gap-2"
      >
        <Check className="w-5 h-5" />
        ✓ Aula Concluída
      </Button>
    );
  }

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={isLoading}
      className="w-full gap-2"
    >
      {isLoading ? 'A marcar...' : 'Marcar como Concluída'}
    </Button>
  );
};
