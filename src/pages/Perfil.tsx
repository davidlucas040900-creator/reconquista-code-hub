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
  ChevronRight,
  BookOpen,
  Users,
  LayoutDashboard,
  ArrowLeft
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
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-silk-300 text-sm md:text-base">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-noir-950">
      <Header />
      
      <main className="pt-16 pb-24 md:pb-8 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back button mobile */}
        <div className="py-4 md:hidden">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Header do Perfil */}
        <div className="text-center mb-6 md:mb-8">
          <div className="relative inline-block mb-3 md:mb-4">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-gold/30">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-noir-800 text-gold text-xl md:text-2xl font-bold">
                {getInitials(profile?.full_name, profile?.email || '')}
              </AvatarFallback>
            </Avatar>
            {profile?.has_full_access && (
              <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1 md:p-1.5">
                <Crown className="w-3 h-3 md:w-4 md:h-4 text-noir-950" />
              </div>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-playfair font-bold text-silk-100">
            {profile?.full_name || 'Minha Conta'}
          </h1>
          <p className="text-silk-400 text-sm mt-1">{profile?.email}</p>
        </div>

        {/* Status de Acesso */}
        <Card className="bg-gradient-to-r from-gold/10 to-gold/5 border-gold/20 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.has_full_access ? (
                <>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-gold font-semibold text-sm md:text-base">Acesso Completo</p>
                    <p className="text-silk-400 text-xs">
                      Membro desde {formatDate(profile?.purchase_date || profile?.created_at)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-silk-400/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-silk-400" />
                  </div>
                  <div>
                    <p className="text-silk-300 font-semibold text-sm md:text-base">Acesso Limitado</p>
                    <p className="text-silk-400 text-xs">Adquira o acesso completo</p>
                  </div>
                </>
              )}
            </div>
            {isAdmin && (
              <span className="px-2 md:px-3 py-1 bg-royal/20 text-royal-light text-xs rounded-full font-semibold">
                ADMIN
              </span>
            )}
          </div>
        </Card>

        {/* Links Admin */}
        {isAdmin && (
          <div className="space-y-2 mb-4 md:mb-6">
            <p className="text-silk-400 text-xs uppercase tracking-wider px-1 mb-2">
              Administração
            </p>
            
            <Card 
              className="bg-noir-900/50 border-white/5 p-3 md:p-4 cursor-pointer hover:bg-noir-800/50 transition-colors"
              onClick={() => navigate('/admin')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-silk-100 font-semibold text-sm md:text-base">Dashboard Admin</p>
                    <p className="text-silk-400 text-xs">Estatísticas e visão geral</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-silk-400" />
              </div>
            </Card>

            <Card 
              className="bg-noir-900/50 border-white/5 p-3 md:p-4 cursor-pointer hover:bg-noir-800/50 transition-colors"
              onClick={() => navigate('/admin/cursos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-silk-100 font-semibold text-sm md:text-base">Gerenciar Cursos</p>
                    <p className="text-silk-400 text-xs">Adicionar/editar cursos e aulas</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-silk-400" />
              </div>
            </Card>

            <Card 
              className="bg-noir-900/50 border-white/5 p-3 md:p-4 cursor-pointer hover:bg-noir-800/50 transition-colors"
              onClick={() => navigate('/admin/alunos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-silk-100 font-semibold text-sm md:text-base">Gerenciar Alunos</p>
                    <p className="text-silk-400 text-xs">Ver progresso e liberar acesso</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-silk-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Informações do Perfil */}
        <Card className="bg-noir-900/50 border-white/5 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-silk-100 flex items-center gap-2">
              <User className="w-4 h-4 md:w-5 md:h-5 text-gold" />
              Informações Pessoais
            </h2>
            {!editMode ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditMode(true)}
                className="text-gold hover:text-gold-light hover:bg-gold/10 text-xs md:text-sm"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Editar
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditMode(false)}
                className="text-silk-400 hover:text-silk-100 text-xs md:text-sm"
              >
                Cancelar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <Label className="text-silk-400 text-xs md:text-sm flex items-center gap-2 mb-2">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                Nome Completo
              </Label>
              {editMode ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-noir-800 border-white/10 text-silk-100 focus:border-gold text-sm md:text-base"
                />
              ) : (
                <p className="text-silk-100 py-2 text-sm md:text-base">{profile?.full_name || 'Não informado'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-silk-400 text-xs md:text-sm flex items-center gap-2 mb-2">
                <Mail className="w-3 h-3 md:w-4 md:h-4" />
                Email
              </Label>
              <p className="text-silk-100 py-2 text-sm md:text-base">{profile?.email}</p>
            </div>

            {/* WhatsApp */}
            <div>
              <Label className="text-silk-400 text-xs md:text-sm flex items-center gap-2 mb-2">
                <Phone className="w-3 h-3 md:w-4 md:h-4" />
                WhatsApp
              </Label>
              {editMode ? (
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+258 84 123 4567"
                  className="bg-noir-800 border-white/10 text-silk-100 focus:border-gold text-sm md:text-base"
                />
              ) : (
                <p className="text-silk-100 py-2 text-sm md:text-base">{profile?.whatsapp || 'Não informado'}</p>
              )}
            </div>

            {/* Data de Cadastro */}
            <div>
              <Label className="text-silk-400 text-xs md:text-sm flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                Membro desde
              </Label>
              <p className="text-silk-100 py-2 text-sm md:text-base">{formatDate(profile?.created_at || null)}</p>
            </div>
          </div>

          {editMode && (
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full mt-4 md:mt-6 btn-gold text-sm md:text-base"
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

        {/* Botão de Logout */}
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 text-sm md:text-base"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
