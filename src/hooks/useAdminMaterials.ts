// src/hooks/useAdminMaterials.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminActions } from './useAdminActions';

export function useAdminMaterials() {
  const queryClient = useQueryClient();
  const { logAction } = useAdminActions();

  // Listar materiais
  const { data: materials, isLoading } = useQuery({
    queryKey: ['admin-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*, course:courses(name), module:course_modules(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Upload de arquivo
  const uploadMaterialMutation = useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      courseId,
      moduleId,
    }: {
      file: File;
      title: string;
      description?: string;
      courseId?: string;
      moduleId?: string;
    }) => {
      // 1. Upload do arquivo para Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: urlData } = supabase.storage
        .from('materials')
        .getPublicUrl(fileName);

      // 3. Salvar no banco
      const { error: dbError } = await supabase.from('materials').insert({
        title,
        description,
        file_url: urlData.publicUrl,
        file_type: file.type.split('/')[0], // 'image', 'application', 'audio', 'video'
        file_size: file.size,
        course_id: courseId,
        module_id: moduleId,
      });

      if (dbError) throw dbError;

      await logAction('upload_material', 'material', fileName, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
      toast.success('Material enviado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao enviar material');
    },
  });

  // Deletar material
  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      await logAction('delete_material', 'material', materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
      toast.success('Material deletado!');
    },
    onError: () => {
      toast.error('Erro ao deletar material');
    },
  });

  return {
    materials,
    isLoading,
    uploadMaterial: uploadMaterialMutation.mutate,
    deleteMaterial: deleteMaterialMutation.mutate,
  };
}
