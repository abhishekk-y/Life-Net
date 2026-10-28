import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { getSocket } from "../../socket";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      
      const result = await api.dashboard.notifications("limit=100");
      const items = Array.isArray(result) ? result : result?.notifications || [];
      setNotifications(items);
    } catch (error) {
      toast.error(error.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onNotification = (notification) => {
      if (!notification?._id) {
        fetchNotifications();
        return;
      }
      setNotifications((current) => current.some((item) => item._id === notification._id)
        ? current
        : [notification, ...current].slice(0, 100));
    };
    socket.on("notification", onNotification);
    return () => socket.off("notification", onNotification);
  }, [fetchNotifications]);

  const markRead = async (ids) => {
    try {
      setActionLoading(true);
      await api.dashboard.markNotificationsRead(ids);
      const selected = new Set(ids);
      setNotifications((current) => current.map((item) => ids.length === 0 || selected.has(item._id)
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item));
    } catch (error) {
      toast.error(error.message || "Could not update notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Updates for your account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">Notifications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">Request changes and workflow updates delivered to your account.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {unreadCount > 0 && <Button onClick={() => markRead([])} disabled={actionLoading}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>}
        </div>
      </header>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Badge variant="outline">{unreadCount} unread</Badge>
        <span>{notifications.length} recent notifications</span>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading notifications
        </div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((item) => {
            const internalLink = item.link?.startsWith("/") && !item.link.startsWith("//") ? item.link : null;
            return (
              <Card key={item._id} className={`rounded-2xl transition-colors ${item.isRead ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"}`}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.isRead ? "bg-gray-100 text-gray-500 dark:bg-gray-800" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"}`}>
                    <Bell className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-950 dark:text-white">{item.title}</h2>
                      {!item.isRead && <span className="h-2 w-2 rounded-full bg-emerald-600" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.message}</p>
                    <time className="mt-2 block text-xs text-gray-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                    {internalLink && <Link to={internalLink} className="mt-2 inline-flex rounded font-medium text-sm text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300">View related workflow</Link>}
                  </div>
                  {!item.isRead && <Button variant="outline" size="sm" disabled={actionLoading} onClick={() => markRead([item._id])}>
                    <Check className="mr-2 h-4 w-4" /> Mark read
                  </Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed bg-white dark:bg-gray-900">
          <CardContent className="py-16 text-center">
            <Bell className="mx-auto h-8 w-8 text-gray-400" />
            <h2 className="mt-3 font-semibold text-gray-900 dark:text-white">You’re all caught up</h2>
            <p className="mt-1 text-sm text-gray-500">New workflow updates will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
