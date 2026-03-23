import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Users, Link as LinkIcon, Play, Settings, Share2, Check, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const subjects = [
  { id: "os", label: "OS" },
  { id: "dbms", label: "DBMS" },
  { id: "cn", label: "CN" },
  { id: "oops", label: "OOPs" },
  { id: "mixed", label: "Mixed" },
];

const durations = [
  { id: "60", label: "60s" },
  { id: "90", label: "90s" },
  { id: "120", label: "120s" },
];

const questionTypes = [
  { id: "mcq", label: "MCQ Only" },
  { id: "case_based", label: "Case Based" },
  { id: "mixed", label: "All Types" },
];

interface Player {
  name: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

interface RoomSettings {
  subject: string;
  duration: number;
  questionType: string;
  ratingImpact: boolean;
}

const CustomRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [tab, setTab] = useState<"create" | "join">(searchParams.get("code") ? "join" : "create");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState(searchParams.get("code") || "");
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [starting, setStarting] = useState(false);
  const [settings, setSettings] = useState<RoomSettings>({
    subject: "mixed",
    duration: 60,
    questionType: "mcq",
    ratingImpact: false,
  });

  // ── Socket event listeners ──
  useEffect(() => {
    if (!socket) return;

    // Room created (host response)
    const onRoomCreated = (data: { roomCode: string; settings: RoomSettings; players: Player[] }) => {
      setRoomCode(data.roomCode);
      setSettings(data.settings);
      setPlayers(data.players);
      setIsInRoom(true);
      setIsHost(true);
    };

    // Room joined (guest response)
    const onRoomJoined = (data: { roomCode: string; settings: RoomSettings; players: Player[]; isHost: boolean }) => {
      setRoomCode(data.roomCode);
      setSettings(data.settings);
      setPlayers(data.players);
      setIsInRoom(true);
      setIsHost(data.isHost);
    };

    // Player joined (broadcast to room)
    const onPlayerJoined = (data: { players: Player[] }) => {
      setPlayers(data.players);
      toast.success("Opponent has joined!");
    };

    // Player left
    const onPlayerLeft = (data: { players: Player[] }) => {
      setPlayers(data.players);
      toast.info("Opponent left the room.");
    };

    // Settings updated
    const onSettingsUpdated = (data: { settings: RoomSettings }) => {
      setSettings(data.settings);
    };

    // Room disbanded
    const onRoomDisbanded = (data: { message: string }) => {
      toast.error(data.message);
      resetRoom();
    };

    // Room error
    const onRoomError = (data: { message: string }) => {
      toast.error(data.message);
      setStarting(false);
    };

    // Match found (from start-room-match)
    const onMatchFound = (data: any) => {
      // CRITICAL: emit match-ready so the server creates the match in activeMatches.
      // Without this, submit-answer will have no match to validate against.
      socket.emit("match-ready", {
        roomId: data.roomId,
        opponent: data.opponent,
        mode: data.mode || "arena",
        isBot: false,
        customDuration: data.customDuration,
      });

      navigate("/match", {
        state: {
          roomId: data.roomId,
          questions: data.questions,
          opponent: data.opponent,
          isBot: false,
          botName: data.opponent.username,
          botElo: data.opponent.rating,
          mode: data.mode || "arena",
          subject: data.questions?.[0]?.subject || "mixed",
          customDuration: data.customDuration,
        },
      });
    };

    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("player-joined", onPlayerJoined);
    socket.on("player-left", onPlayerLeft);
    socket.on("settings-updated", onSettingsUpdated);
    socket.on("room-disbanded", onRoomDisbanded);
    socket.on("room-error", onRoomError);
    socket.on("match-found", onMatchFound);

    return () => {
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("player-joined", onPlayerJoined);
      socket.off("player-left", onPlayerLeft);
      socket.off("settings-updated", onSettingsUpdated);
      socket.off("room-disbanded", onRoomDisbanded);
      socket.off("room-error", onRoomError);
      socket.off("match-found", onMatchFound);
    };
  }, [socket, navigate]);

  const resetRoom = () => {
    setRoomCode(null);
    setIsInRoom(false);
    setIsHost(false);
    setPlayers([]);
    setStarting(false);
  };

  // ── Actions ──
  const handleCreateRoom = useCallback(() => {
    if (!socket) {
      toast.error("Not connected to server.");
      return;
    }
    socket.emit("create-room");
  }, [socket]);

  const handleJoinRoom = useCallback(() => {
    if (!socket) {
      toast.error("Not connected to server.");
      return;
    }
    if (joinCode.length < 6) {
      toast.error("Enter a valid 6-character room code.");
      return;
    }
    socket.emit("join-room", { roomCode: joinCode.toUpperCase() });
  }, [socket, joinCode]);

  const handleUpdateSettings = useCallback((newSettings: Partial<RoomSettings>) => {
    if (!socket || !roomCode || !isHost) return;
    const updated = { ...settings, ...newSettings };
    setSettings(updated); // Optimistic update
    socket.emit("room-settings", { roomCode, settings: updated });
  }, [socket, roomCode, isHost, settings]);

  const handleStartMatch = useCallback(() => {
    if (!socket || !roomCode || !isHost) return;
    setStarting(true);
    socket.emit("start-room-match", { roomCode });
  }, [socket, roomCode, isHost]);

  const handleLeaveRoom = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit("leave-room", { roomCode });
    resetRoom();
  }, [socket, roomCode]);

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRoom = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/room?code=${roomCode}`;
    if (navigator.share) {
      navigator.share({ title: "CSClash Room", text: `Join my CSClash battle! Code: ${roomCode}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1">
            Custom <span className="text-primary">Room</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">Create a private room or join one with a code.</p>
        </div>

        {/* If already in a room, show room view */}
        {isInRoom && roomCode ? (
          <>
            {/* Back button */}
            <button onClick={handleLeaveRoom} className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Leave Room
            </button>

            {/* Room Code */}
            <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Room Code</div>
                  <div className="font-mono text-2xl sm:text-4xl font-bold tracking-[0.3em] text-accent">{roomCode}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyCode} className="font-mono text-xs">
                    {copied ? <Check className="!size-3.5" /> : <Copy className="!size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareRoom} className="font-mono text-xs">
                    <Share2 className="!size-3.5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Room Settings (host only can edit) */}
            <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-primary" />
                Room Settings
                {!isHost && <span className="font-mono text-[9px] text-muted-foreground normal-case tracking-normal">(Host only)</span>}
              </h3>

              <div className="mb-4">
                <label className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button key={s.id} onClick={() => isHost && handleUpdateSettings({ subject: s.id })} disabled={!isHost} className={cn(
                      "px-3 py-1.5 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
                      settings.subject === s.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground",
                      !isHost && "cursor-default opacity-60"
                    )}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {durations.map((d) => (
                    <button key={d.id} onClick={() => isHost && handleUpdateSettings({ duration: parseInt(d.id) })} disabled={!isHost} className={cn(
                      "px-3 py-1.5 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
                      String(settings.duration) === d.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground",
                      !isHost && "cursor-default opacity-60"
                    )}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Question Type</label>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((t) => (
                    <button key={t.id} onClick={() => isHost && handleUpdateSettings({ questionType: t.id })} disabled={!isHost} className={cn(
                      "px-3 py-1.5 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
                      settings.questionType === t.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground",
                      !isHost && "cursor-default opacity-60"
                    )}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border border-border p-3">
                <div>
                  <div className="font-mono text-xs font-bold">Rating Impact</div>
                  <div className="font-mono text-[10px] text-muted-foreground">Affects ELO rating</div>
                </div>
                <button
                  onClick={() => isHost && handleUpdateSettings({ ratingImpact: !settings.ratingImpact })}
                  disabled={!isHost}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    settings.ratingImpact ? "bg-accent" : "bg-secondary",
                    !isHost && "cursor-default opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-foreground rounded-full absolute top-0.5 transition-all",
                    settings.ratingImpact ? "left-5.5 sm:left-[22px]" : "left-0.5"
                  )} />
                </button>
              </div>
            </div>

            {/* Players in Room */}
            <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                Players ({players.length}/2)
              </h3>

              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center justify-between border border-border p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.name}`}
                        alt=""
                        className="w-7 h-7 sm:w-8 sm:h-8 border border-accent"
                      />
                      <div>
                        <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                          {p.name}
                          {p.isHost && <span className="text-[9px] text-primary font-normal">(HOST)</span>}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">{p.rating} ELO</div>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5",
                      p.ready ? "text-accent bg-accent/10 border border-accent/30" : "text-muted-foreground bg-secondary"
                    )}>
                      {p.ready ? "Ready" : "Waiting"}
                    </span>
                  </div>
                ))}

                {players.length < 2 && (
                  <div className="flex items-center justify-center border border-dashed border-border p-4 sm:p-6">
                    <div className="text-center">
                      <Users className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
                      <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">Waiting for opponent...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isHost ? (
              <Button variant="battle" size="xl" className="w-full" disabled={players.length < 2 || starting} onClick={handleStartMatch}>
                {starting ? (
                  <><Loader2 className="!size-4 sm:!size-5 animate-spin" /> Starting...</>
                ) : (
                  <><Play className="!size-4 sm:!size-5" /> {players.length < 2 ? "Waiting for Opponent" : "Start Battle"}</>
                )}
              </Button>
            ) : (
              <div className="border border-accent/30 bg-accent/5 p-4 text-center">
                <span className="font-mono text-xs text-accent">Waiting for host to start the match...</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setTab("create")}
                className={cn(
                  "py-2.5 sm:py-3 border font-mono text-xs sm:text-sm uppercase tracking-wider transition-all",
                  tab === "create" ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                Create Room
              </button>
              <button
                onClick={() => setTab("join")}
                className={cn(
                  "py-2.5 sm:py-3 border font-mono text-xs sm:text-sm uppercase tracking-wider transition-all",
                  tab === "join" ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <LinkIcon className="w-3.5 h-3.5 inline mr-1.5" />
                Join Room
              </button>
            </div>

            {tab === "create" ? (
              <div className="border border-border bg-card p-4 sm:p-6">
                <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider mb-3">Create a Private Room</h3>
                <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-6">
                  Create a room and share the code with your friend to battle.
                </p>
                <Button variant="battle" size="lg" className="w-full" onClick={handleCreateRoom}>
                  <Plus className="!size-4" />
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="border border-border bg-card p-4 sm:p-6">
                <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">Enter Room Code</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="flex-1 bg-background border border-border px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-sm sm:text-lg tracking-[0.3em] text-center uppercase text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button variant="battle" size="lg" className="w-full" disabled={joinCode.length < 6} onClick={handleJoinRoom}>
                  <LinkIcon className="!size-4" />
                  Join Room
                </Button>
                <p className="font-mono text-[10px] text-muted-foreground text-center mt-3">
                  Ask your friend for the 6-character room code
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomRoom;
