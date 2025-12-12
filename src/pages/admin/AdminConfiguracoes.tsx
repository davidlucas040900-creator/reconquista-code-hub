// src/pages/admin/AdminConfiguracoes.tsx

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';

interface Settings {
  site_name: string;
  site_description: string;
  support_email: string;
  support_whatsapp: string;
  welcome_message: string;
  maintenance_mode: boolean;
  allow_registrations: boolean;
}

const defaultSettings: Settings = {
  site_name: 'Código da Reconquista',
  site_description: 'Área de Membros',
  support_email: '',
  support_whatsapp: '',
  welcome_message: 'Bem-vinda à sua jornada de transformação!',
  maintenance_mode: false,
  allow_registrations: true,
};

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('key, value');

    if (data) {
      const settingsObj: any = { ...defaultSettings };
      data.forEach((item) => {
        if (item.key in settingsObj) {
          settingsObj[item.key] = item.value;
        }
      });
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Upsert cada configuração
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('system_settings')
          .upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
      }

      toast.success('Configurações salvas');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }

    setSaving(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast.info('Configurações restauradas para o padrão');
  };

  if (loading) {
    return (
      <AdminLayout title="Configurações" breadcrumb={[{ label: 'Configurações' }]}>
        <p className="text-muted-foreground">Carregando...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações" breadcrumb={[{ label: 'Configurações' }]}>
      <div className="max-w-2xl space-y-6">
        {/* Informações do Site */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações do Site
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                placeholder="Código da Reconquista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Descrição</Label>
              <Input
                id="site_description"
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                placeholder="Área de Membros"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={settings.welcome_message}
                onChange={(e) =>
                  setSettings({ ...settings, welcome_message: e.target.value })
                }
                placeholder="Bem-vinda à sua jornada..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Suporte */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Suporte</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support_email">Email de Suporte</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
                placeholder="suporte@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_whatsapp">WhatsApp de Suporte</Label>
              <Input
                id="support_whatsapp"
                value={settings.support_whatsapp}
                onChange={(e) =>
                  setSettings({ ...settings, support_whatsapp: e.target.value })
                }
                placeholder="+258..."
              />
            </div>
          </div>
        </Card>

        {/* Opções do Sistema */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Opções do Sistema
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_registrations">Permitir Novos Cadastros</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que novos usuários se cadastrem
                </p>
              </div>
              <Switch
                id="allow_registrations"
                checked={settings.allow_registrations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allow_registrations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Modo Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Bloqueia acesso de alunos temporariamente
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
