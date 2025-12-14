// src/components/NotificationsPanel.tsx

import { useNotifications } from '@/hooks/useNotifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  alert: AlertCircle,
};

const typeColors = {
  info: 'bg-blue-500/20 text-blue-400',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  alert: 'bg-red-500/20 text-red-400',
};

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-noir-900 border-white/10 p-0">
        <SheetHeader className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-gold" />
              Notificações
              {unreadCount > 0 && (
                <span className="bg-gold text-noir-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-gray-400 hover:text-white text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma notificação</p>
              <p className="text-gray-500 text-sm mt-1">
                Você será notificada sobre novidades aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Info;
                const colorClass = typeColors[notification.type] || typeColors.info;
                const isUnread = !notification.read_at;

                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                      isUnread ? 'bg-gold/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
