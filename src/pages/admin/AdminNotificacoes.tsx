// src/pages/admin/AdminNotificacoes.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Bell, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const notificationTypes = [
  { value: 'info', label: 'Informação', icon: Info, color: 'text-blue-400' },
  { value: 'success', label: 'Sucesso', icon: CheckCircle, color: 'text-green-400' },
  { value: 'warning', label: 'Aviso', icon: AlertTriangle, color: 'text-yellow-400' },
  { value: 'alert', label: 'Alerta', icon: AlertCircle, color: 'text-red-400' },
];

export default function AdminNotificacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target_type: 'all',
  });

  // Buscar notificações
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Criar notificação
  const createNotification = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notifications').insert({
        ...formData,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notificação enviada com sucesso!');
      setIsDialogOpen(false);
      setFormData({ title: '', message: '', type: 'info', target_type: 'all' });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => {
      toast.error('Erro ao enviar notificação');
    },
  });

  // Deletar notificação
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notificação removida');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const getTypeIcon = (type: string) => {
    const found = notificationTypes.find(t => t.value === type);
    return found ? found.icon : Info;
  };

  const getTypeColor = (type: string) => {
    const found = notificationTypes.find(t => t.value === type);
    return found ? found.color : 'text-blue-400';
  };

  return (
    <AdminLayout title="Notificações" breadcrumb={[{ label: 'Notificações' }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          {notifications?.length || 0} notificações enviadas
        </p>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gold hover:bg-gold-light text-noir-950">
          <Send className="w-4 h-4 mr-2" />
          Nova Notificação
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : notifications?.length === 0 ? (
        <Card className="p-8 text-center bg-noir-900/50 border-white/10">
          <Bell className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nenhuma notificação enviada</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            const colorClass = getTypeColor(notification.type);

            return (
              <Card key={notification.id} className="p-4 bg-noir-900/50 border-white/10">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{notification.title}</h3>
                      <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded">
                        {notification.target_type === 'all' ? 'Todos' : 'Específico'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-noir-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Notificação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da notificação"
                className="bg-noir-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Mensagem</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Mensagem da notificação..."
                className="bg-noir-800 border-white/10 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger className="bg-noir-800 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-noir-800 border-white/10">
                    {notificationTypes.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Destinatário</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(v) => setFormData({ ...formData, target_type: v })}
                >
                  <SelectTrigger className="bg-noir-800 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-noir-800 border-white/10">
                    <SelectItem value="all" className="text-white">Todos os usuários</SelectItem>
                    <SelectItem value="course" className="text-white">Por curso</SelectItem>
                    <SelectItem value="user" className="text-white">Usuário específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/10">
              Cancelar
            </Button>
            <Button 
              onClick={() => createNotification.mutate()}
              disabled={!formData.title || !formData.message}
              className="bg-gold hover:bg-gold-light text-noir-950"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
