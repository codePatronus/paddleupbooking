import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import {
  useNotifications,
  requestBrowserNotificationPermission,
  browserNotificationsSupported,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const canPrompt =
    browserNotificationsSupported() && typeof Notification !== "undefined" && Notification.permission === "default";

  async function enablePush() {
    const result = await requestBrowserNotificationPermission();
    if (result === "granted") toast.success("Browser notifications enabled");
    else toast.error("Browser notifications blocked");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notifications">
          {unreadCount > 0 ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary flex items-center gap-1">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {canPrompt && (
          <button
            onClick={enablePush}
            className="w-full text-left px-3 py-2 text-xs bg-primary/5 text-primary border-b hover:bg-primary/10"
          >
            🔔 Enable browser notifications for booking updates
          </button>
        )}

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.map((n) => {
              const content = (
                <div
                  className={`px-3 py-2.5 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                    n.read ? "" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );

              const handle = () => {
                if (!n.read) markRead(n.id);
                setOpen(false);
              };

              return n.link ? (
                <Link key={n.id} to={n.link} onClick={handle} className="block">
                  {content}
                </Link>
              ) : (
                <div key={n.id} onClick={handle} className="cursor-pointer">
                  {content}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
