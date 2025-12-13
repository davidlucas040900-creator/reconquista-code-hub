// src/components/layout/Header.tsx

import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export function Header({ onSearchClick, onNotificationClick }: HeaderProps) {
  return (
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
              onClick={onSearchClick}
              className="btn-icon"
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onNotificationClick}
              className="btn-icon relative"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-royal rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
