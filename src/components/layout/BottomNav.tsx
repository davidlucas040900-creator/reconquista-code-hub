// src/components/layout/BottomNav.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, User, Users } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: FileText, label: 'Materiais', path: '/materiais' },
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: Users, label: 'Comunidade', path: '/comunidade', external: 'https://chat.whatsapp.com/xyz' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (item: typeof navItems[0]) => {
    if (item.external) {
      window.open(item.external, '_blank');
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleClick(item)}
              className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
