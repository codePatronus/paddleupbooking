import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  booking_id: string | null;
  read: boolean;
  created_at: string;
}

const BROWSER_PUSH_KEY = "paddleup_browser_push_enabled";

export function isBrowserPushSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserPushEnabled() {
  if (!isBrowserPushSupported()) return false;
  return localStorage.getItem(BROWSER_PUSH_KEY) === "true" && Notification.permission === "granted";
}

export async function requestBrowserPush(): Promise<boolean> {
  if (!isBrowserPushSupported()) {
    toast.error("Your browser doesn't support notifications");
    return false;
  }
  if (Notification.permission === "denied") {
    toast.error("Notifications are blocked. Enable them in your browser settings.");
    return false;
  }
  const perm =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (perm === "granted") {
    localStorage.setItem(BROWSER_PUSH_KEY, "true");
    new Notification("Paddle Up Manipal", { body: "Browser notifications enabled!" });
    return true;
  }
  return false;
}

export function disableBrowserPush() {
  localStorage.setItem(BROWSER_PUSH_KEY, "false");
}

function showBrowserNotification(n: AppNotification) {
  if (!getBrowserPushEnabled()) return;
  if (document.visibilityState === "visible") return; // avoid double with in-app toast
  try {
    const notif = new Notification(n.title, {
      body: n.body ?? undefined,
      icon: "/paddleup-logo.jpg",
      tag: n.id,
    });
    notif.onclick = () => {
      window.focus();
      if (n.link) window.location.href = n.link;
      notif.close();
    };
  } catch {
    /* noop */
  }
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications((data as AppNotification[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setNotifications((prev) => [n, ...prev].slice(0, 30));
          toast(n.title, { description: n.body ?? undefined });
          showBrowserNotification(n);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }, [userId, notifications]);

  const markOneRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, []);

  return { notifications, unreadCount, loading, refresh, markAllRead, markOneRead };
}
