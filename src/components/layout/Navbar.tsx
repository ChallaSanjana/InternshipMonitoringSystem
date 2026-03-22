import { Bell, CheckCircle2, LogOut, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../lib/api';

interface NavbarProps {
  userName: string;
  onLogout: () => Promise<void> | void;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  internshipId?: string;
  type:
    | 'internship_approved'
    | 'internship_rejected'
    | 'new_internship_submitted'
    | 'new_report_submitted'
    | 'new_file_uploaded'
    | 'report_feedback_added'
    | 'general';
  isRead: boolean;
  createdAt: string;
}

function getTimeAgo(date: string) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSeconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      setError('');
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }

      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, []);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return;
    }

    try {
      const response = await notificationAPI.markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      );
      setUnreadCount(response.data.unreadCount ?? Math.max(0, unreadCount - 1));

      if (notification.type === 'report_feedback_added') {
        const internshipId = notification.internshipId;
        const destination = internshipId ? `/reports?internshipId=${internshipId}` : '/reports';
        navigate(destination);
        setOpen(false);
      }
    } catch {
      setError('Failed to mark notification as read');
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 md:text-2xl">Internship Monitoring System</h2>
          <p className="text-xs text-slate-500 md:text-sm">Track internships and progress reports in one place</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="mb-2 flex items-center justify-between px-2 py-1">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <span className="text-xs text-slate-500">Unread: {unreadCount}</span>
                </div>

                {error && <p className="mb-2 rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">{error}</p>}
                {loading && <p className="px-2 py-3 text-xs text-slate-500">Loading...</p>}

                {!loading && sortedNotifications.length === 0 && (
                  <p className="px-2 py-3 text-xs text-slate-500">No notifications yet.</p>
                )}

                {!loading && sortedNotifications.length > 0 && (
                  <div className="max-h-80 space-y-1 overflow-y-auto">
                    {sortedNotifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                          notification.isRead
                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-blue-200 bg-blue-50 text-slate-900 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            {notification.type === 'internship_approved' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : notification.type === 'internship_rejected' ? (
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            ) : notification.type === 'new_internship_submitted' ? (
                              <Bell className="h-3.5 w-3.5 text-indigo-600" />
                            ) : notification.type === 'new_report_submitted' ? (
                              <Bell className="h-3.5 w-3.5 text-violet-600" />
                            ) : notification.type === 'new_file_uploaded' ? (
                              <Bell className="h-3.5 w-3.5 text-sky-600" />
                            ) : notification.type === 'report_feedback_added' ? (
                              <Bell className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <Bell className="h-3.5 w-3.5 text-slate-600" />
                            )}
                            <span>{notification.title}</span>
                          </div>
                          <span className="whitespace-nowrap text-[11px] text-slate-500">{getTimeAgo(notification.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed">{notification.message}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 md:inline">
            {userName}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
