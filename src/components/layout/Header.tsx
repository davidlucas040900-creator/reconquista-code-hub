// src/components/layout/Header.tsx

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { SearchDialog } from '@/components/SearchDialog';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export function Header({ onSearchClick, onNotificationClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

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
