// src/components/layout/Header.tsx

import { useState } from 'react';
import { Search, Bell, RefreshCw } from 'lucide-react';
import { SearchDialog } from '@/components/SearchDialog';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeaderProps {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export function Header({ onSearchClick, onNotificationClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [showClearButton, setShowClearButton] = useState(false);

  // Detectar se há problemas de cache (apenas mostrar botão se necessário)
  useState(() => {
    try {
      const keys = Object.keys(localStorage);
      const hasOldSessions = keys.some(k => k.includes('supabase.auth.token'));
      setShowClearButton(hasOldSessions);
    } catch {}
  });

  const handleClearCache = async () => {
    if (!confirm('Limpar cache e sair? Você precisará fazer login novamente.')) {
      return;
    }

    try {
      // Logout
      await supabase.auth.signOut();
      
      // Limpar tudo
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cache do service worker
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      toast.success('Cache limpo!');
      
      // Redirecionar
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao limpar cache');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="font-playfair text-xl font-bold text-gold tracking-wide">
                RECONQUISTA
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-icon"
                aria-label="Pesquisar"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="btn-icon relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-noir-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showClearButton && (
                <button
                  onClick={handleClearCache}
                  className="btn-icon text-red-400 hover:text-red-300"
                  aria-label="Limpar Cache"
                  title="Limpar cache (use se a área não carregar)"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dialogs */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}
