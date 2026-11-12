import React from 'react';
import { Bell, CheckCheck, AlertTriangle, Calendar, Award, Sparkles, X } from 'lucide-react';
import { NotificationItem } from '../types/index.ts';

interface NotificationPopoverProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: NotificationItem) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'EVENT_CHANGE':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'REGISTRATION_CONFIRMED':
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case 'DEADLINE_ALERT':
        return <Calendar className="w-4 h-4 text-rose-600" />;
      case 'FEEDBACK_INVITE':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <Award className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      role="dialog"
      aria-label="Notifications panel"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800 text-sm">Notifications & Alerts</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              aria-label="Mark all notifications as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification?.(notif)}
              className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex gap-3 ${
                !notif.read ? 'bg-indigo-50/50' : ''
              }`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 h-fit">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                {notif.changeDetails?.reason && (
                  <div className="mt-2 text-[11px] p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                    <span className="font-semibold">Reason: </span>
                    {notif.changeDetails.reason}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-500">
          Instant alerts sent whenever events are postponed, rescheduled, or cancelled
        </p>
      </div>
    </div>
  );
};
