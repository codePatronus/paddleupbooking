import { useState, useEffect, useRef } from "react";
import { BackButton } from "@/components/BackButton";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatHour } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, UserPlus, Check, X, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string; display_name: string };
};

type JoinRequest = {
  id: string;
  player_id: string;
  status: string;
  message: string | null;
  created_at: string;
  profiles: { username: string; display_name: string; skill_level: string };
};

type BookingInfo = {
  id: string;
  booking_date: string;
  slot_hour: number;
  court_number: number;
  customer_name: string;
  user_id: string | null;
};

type MatchRequestInfo = {
  id: string;
  players_needed: number;
  skill_filter: string | null;
  play_mode: string;
  is_active: boolean;
};

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [matchRequest, setMatchRequest] = useState<MatchRequestInfo | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showPanel, setShowPanel] = useState<"chat" | "requests" | "add">("chat");
  const [searchUuid, setSearchUuid] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; username: string; display_name: string; skill_level: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isHost = booking?.user_id === user?.id;

  useEffect(() => {
    if (!roomId) return;
    loadBooking();
    loadMessages();
    loadJoinRequests();

    const msgChannel = supabase
      .channel(`chat-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    const reqChannel = supabase
      .channel(`requests-${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "join_requests",
      }, () => loadJoinRequests())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reqChannel);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadBooking() {
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_date, slot_hour, court_number, customer_name, user_id")
      .eq("id", roomId)
      .single();
    setBooking(data as BookingInfo | null);

    if (data) {
      const { data: mr } = await supabase
        .from("match_requests")
        .select("id, players_needed, skill_filter, play_mode, is_active")
        .eq("booking_id", data.id)
        .maybeSingle();
      setMatchRequest(mr as MatchRequestInfo | null);
    }
  }

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(username, display_name)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data as unknown as Message[]) || []);
  }

  async function loadJoinRequests() {
    if (!matchRequest?.id) {
      // Try loading via booking
      const { data: mr } = await supabase
        .from("match_requests")
        .select("id")
        .eq("booking_id", roomId!)
        .maybeSingle();
      if (!mr) return;
      const { data } = await supabase
        .from("join_requests")
        .select("*, profiles(username, display_name, skill_level)")
        .eq("match_request_id", mr.id)
        .order("created_at", { ascending: false });
      setJoinRequests((data as unknown as JoinRequest[]) || []);
    } else {
      const { data } = await supabase
        .from("join_requests")
        .select("*, profiles(username, display_name, skill_level)")
        .eq("match_request_id", matchRequest.id)
        .order("created_at", { ascending: false });
      setJoinRequests((data as unknown as JoinRequest[]) || []);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !user || !roomId) return;
    setSending(true);
    await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: user.id,
      content: newMsg.trim(),
    });
    setNewMsg("");
    setSending(false);
  }

  async function handleRequest(requestId: string, action: "accepted" | "declined") {
    const { error } = await supabase
      .from("join_requests")
      .update({ status: action })
      .eq("id", requestId);
    if (error) toast.error("Failed to update request");
    else toast.success(action === "accepted" ? "Player accepted! 🎉" : "Request declined");
    loadJoinRequests();
  }

  async function searchPlayer() {
    if (!searchUuid.trim()) return;
    setSearching(true);
    setSearchResult(null);
    const query = searchUuid.trim().toLowerCase();
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, skill_level")
      .or(`username.eq.${query},id.eq.${query}`)
      .limit(1)
      .maybeSingle();
    setSearchResult(data as typeof searchResult);
    setSearching(false);
    if (!data) toast.error("Player not found");
  }

  async function invitePlayer(playerId: string) {
    // Send a system message inviting them
    if (!roomId || !user) return;
    await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: user.id,
      content: `📩 Invited a player to join this room. Player, check the booking and join!`,
    });
    toast.success("Invite sent via chat!");
    setSearchResult(null);
    setSearchUuid("");
    setShowPanel("chat");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please log in to chat</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  const pendingRequests = joinRequests.filter((r) => r.status === "pending");

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-2">
          <BackButton />
          <div className="flex-1 min-w-0">
            {booking ? (
              <div>
                <p className="font-heading text-sm font-bold text-foreground truncate">
                  Court {booking.court_number} • {formatHour(booking.slot_hour)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(booking.booking_date), "dd MMM yyyy")}
                </p>
              </div>
            ) : (
              <p className="font-heading text-sm font-bold text-foreground truncate">Chat Room</p>
            )}
          </div>
          {isHost && (
            <div className="flex gap-1">
              <Button
                variant={showPanel === "requests" ? "default" : "ghost"}
                size="icon"
                className="relative"
                onClick={() => setShowPanel(showPanel === "requests" ? "chat" : "requests")}
              >
                <Check className="h-4 w-4" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </Button>
              <Button
                variant={showPanel === "add" ? "default" : "ghost"}
                size="icon"
                onClick={() => setShowPanel(showPanel === "add" ? "chat" : "add")}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Requests panel */}
      {showPanel === "requests" && isHost && (
        <div className="border-b bg-card p-3 space-y-2 max-h-[40vh] overflow-y-auto animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Join Requests</p>
          {joinRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No requests yet</p>
          ) : (
            joinRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{req.profiles.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">@{req.profiles.username} • {req.profiles.skill_level}</p>
                </div>
                {req.status === "pending" ? (
                  <div className="flex gap-1">
                    <Button size="icon" className="h-7 w-7" onClick={() => handleRequest(req.id, "accepted")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleRequest(req.id, "declined")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant={req.status === "accepted" ? "default" : "secondary"} className="text-[10px]">
                    {req.status}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add player panel */}
      {showPanel === "add" && isHost && (
        <div className="border-b bg-card p-3 space-y-2 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Add Player by Username / UUID</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter username or UUID..."
              value={searchUuid}
              onChange={(e) => setSearchUuid(e.target.value)}
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && searchPlayer()}
            />
            <Button size="icon" onClick={searchPlayer} disabled={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {searchResult && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                {searchResult.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{searchResult.display_name}</p>
                <p className="text-[10px] text-muted-foreground">@{searchResult.username} • {searchResult.skill_level}</p>
              </div>
              <Button size="sm" onClick={() => invitePlayer(searchResult.id)}>
                Invite
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border rounded-bl-md"
              }`}>
                {!isOwn && (
                  <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                    {msg.profiles?.display_name || "Player"}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[9px] mt-0.5 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {format(new Date(msg.created_at), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t bg-card p-3 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !newMsg.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatRoomPage;
