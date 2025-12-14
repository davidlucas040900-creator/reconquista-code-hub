// src/pages/Perfil.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  LogOut, 
  Save,
  Crown,
  CheckCircle,
  Settings,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  role: string;
  has_full_access: boolean;
  purchase_date: string | null;
  created_at: string;
}

export default function Perfil() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } else {
      setProfile(data);
      setFullName(data.full_name || '');
      setWhatsapp(data.whatsapp || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        whatsapp: whatsapp,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao salvar alterações');
    } else {
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
      fetchProfile();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-silk-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      <Header />
      
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Header do Perfil */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 border-4 border-gold/30">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-noir-800 text-gold text-2xl font-bold">
                {getInitials(profile?.full_name, profile?.email || '')}
              </AvatarFallback>
            </Avatar>
            {profile?.has_full_access && (
              <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1.5">
                <Crown className="w-4 h-4 text-noir-950" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-playfair font-bold text-silk-100">
            {profile?.full_name || 'Minha Conta'}
          </h1>
          <p className="text-silk-400 text-sm mt-1">{profile?.email}</p>
        </div>

        {/* Status de Acesso */}
        <Card className="bg-gradient-to-r from-gold/10 to-gold/5 border-gold/20 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.has_full_access ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-gold font-semibold">Acesso Completo</p>
                    <p className="text-silk-400 text-xs">
                      Membro desde {formatDate(profile?.purchase_date || profile?.created_at)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-silk-400/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-silk-400" />
                  </div>
                  <div>
                    <p className="text-silk-300 font-semibold">Acesso Limitado</p>
                    <p className="text-silk-400 text-xs">Adquira o acesso completo</p>
                  </div>
                </>
              )}
            </div>
            {profile?.role === 'admin' && (
              <span className="px-3 py-1 bg-royal/20 text-royal-light text-xs rounded-full font-semibold">
                ADMIN
              </span>
            )}
          </div>
        </Card>

        {/* Informações do Perfil */}
        <Card className="bg-noir-900/50 border-white/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-silk-100 flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              Informações Pessoais
            </h2>
            {!editMode ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditMode(true)}
                className="text-gold hover:text-gold-light hover:bg-gold/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditMode(false)}
                className="text-silk-400 hover:text-silk-100"
              >
                Cancelar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <Label className="text-silk-400 text-sm flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Nome Completo
              </Label>
              {editMode ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-noir-800 border-white/10 text-silk-100 focus:border-gold"
                />
              ) : (
                <p className="text-silk-100 py-2">{profile?.full_name || 'Não informado'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-silk-400 text-sm flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-silk-100 py-2">{profile?.email}</p>
            </div>

            {/* WhatsApp */}
            <div>
              <Label className="text-silk-400 text-sm flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Label>
              {editMode ? (
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+258 84 123 4567"
                  className="bg-noir-800 border-white/10 text-silk-100 focus:border-gold"
                />
              ) : (
                <p className="text-silk-100 py-2">{profile?.whatsapp || 'Não informado'}</p>
              )}
            </div>

            {/* Data de Cadastro */}
            <div>
              <Label className="text-silk-400 text-sm flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Membro desde
              </Label>
              <p className="text-silk-100 py-2">{formatDate(profile?.created_at || null)}</p>
            </div>
          </div>

          {editMode && (
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full mt-6 btn-gold"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-noir-950 border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          )}
        </Card>

        {/* Link para Admin (se for admin) */}
        {profile?.role === 'admin' && (
          <Card 
            className="bg-noir-900/50 border-white/5 p-4 mb-6 cursor-pointer hover:bg-noir-800/50 transition-colors"
            onClick={() => navigate('/admin')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-royal/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-royal-light" />
                </div>
                <div>
                  <p className="text-silk-100 font-semibold">Painel Administrativo</p>
                  <p className="text-silk-400 text-xs">Gerenciar cursos e alunos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-silk-400" />
            </div>
          </Card>
        )}

        {/* Botão de Logout */}
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
