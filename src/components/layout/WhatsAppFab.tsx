// src/components/layout/WhatsAppFab.tsx

import { MessageCircle } from 'lucide-react';

interface WhatsAppFabProps {
  phoneNumber?: string;
}

export function WhatsAppFab({ phoneNumber = '258834569225' }: WhatsAppFabProps) {
  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="whatsapp-fab"
      aria-label="Suporte via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
