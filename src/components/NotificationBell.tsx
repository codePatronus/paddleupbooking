import { useNavigate } from "react-router-dom";
import { Bell, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import {
  useNotifications,
  isBrowserPushSupported,
  getBrowserPushEnabled,
  requestBrowserPush,
  disableBrowserPush,
} from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications(user?.id);
  const [pushOn, setPushOn] = useState(false);

  useEffect(() => {
    setPushOn(getBrowserPushEnabled());
  }, []);

  if (!user) return null;

  const togglePush = async (checked: boolean) => {
    if (checked) {
      const ok = await requestBrowserPush();
      setPushOn(ok);
    } else {
      disableBrowserPush();
      setPushOn(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-primary" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
              <Check className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>

        {isBrowserPushSupported() && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
            <div className="text-xs">
              <div className="font-medium">Browser notifications</div>
              <div className="text-muted-foreground">Get alerts even when the tab is closed</div>
            </div>
            <Switch checked={pushOn} onCheckedChange={togglePush} />
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8 px-4">
              You're all caught up 🎉
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markOneRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
