import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string;
  read: boolean;
  booking_id: string | null;
  created_at: string;
};

const PERMISSION_KEY = "paddleup_notif_prompted";

export function browserNotificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!browserNotificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    const result = await Notification.requestPermission();
    localStorage.setItem(PERMISSION_KEY, "1");
    return result;
  } catch {
    return "denied";
  }
}

function showBrowserNotification(n: AppNotification) {
  if (!browserNotificationsSupported() || Notification.permission !== "granted") return;
  try {
    const notif = new Notification(n.title, {
      body: n.body ?? undefined,
      icon: "/paddleup-logo.jpg",
      badge: "/paddleup-logo.jpg",
      tag: n.id,
    });
    notif.onclick = () => {
      window.focus();
      if (n.link) window.location.href = n.link;
      notif.close();
    };
  } catch {
    /* ignore */
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const seen = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = (data ?? []) as AppNotification[];
    rows.forEach((r) => seen.current.add(r.id));
    setNotifications(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as AppNotification;
          if (seen.current.has(n.id)) return;
          seen.current.add(n.id);
          setNotifications((prev) => [n, ...prev].slice(0, 30));
          showBrowserNotification(n);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  }, [notifications, user]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, []);

  return { notifications, unreadCount, loading, markAllRead, markRead, reload: load };
}
