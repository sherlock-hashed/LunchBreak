import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Bot, Users, Search, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";

const quotes = [
  // Stand-Up Comedy
  { text: "I used to think I was indecisive, but now I'm not too sure.", source: "Jimmy Carr" },
  { text: "I refuse to answer that question on the grounds that I don't know the answer.", source: "Douglas Adams" },
  { text: "I find television very educating. Every time somebody turns on the set, I go into the other room and read a book.", source: "Groucho Marx" },
  { text: "Behind every great man is a woman rolling her eyes.", source: "Jim Carrey" },
  { text: "Life is worth losing for.", source: "Ricky Gervais" },
  { text: "A day without sunshine is like, you know, night.", source: "Steve Martin" },

  // Hollywood Sitcoms
  { text: "When life gives you lemonade, make lemons. Life will be all like, ‘What?!’", source: "Phil Dunphy, Modern Family" },
  { text: "We were on a break!", source: "Ross Geller, Friends" },
  { text: "I am not superstitious, but I am a little stitious.", source: "Michael Scott, The Office" },
  { text: "It's what you do in the dark that puts you in the light.", source: "Unknown Sitcom Quote" },
  { text: "PIVOT!", source: "Ross Geller, Friends" },

  // Hollywood Web Series
  { text: "I don't play the odds, I play the man.", source: "Harvey Specter, Suits" },
  { text: "Sometimes good guys gotta do bad things to make the bad guys pay.", source: "Harvey Specter, Suits" },
  { text: "Bella Ciao.", source: "Money Heist" },
  { text: "Hope is a dangerous thing. It can drive a man insane.", source: "Prison Break" },
  { text: "Preparation can only take you so far. After that, you gotta take a few leaps of faith.", source: "Michael Scofield, Prison Break" },

  // Hollywood Movies
  { text: "The first rule of Fight Club is: You do not talk about Fight Club.", source: "Fight Club" },
  { text: "It's only after we've lost everything that we're free to do anything.", source: "Fight Club" },
  { text: "Which would be worse: to live as a monster or to die as a good man?", source: "Shutter Island" },
  { text: "Why so serious?", source: "The Dark Knight" },
  { text: "Do, or do not. There is no try.", source: "Star Wars" },

  // Mixed Famous Quotes
  { text: "Art should comfort the disturbed and disturb the comfortable.", source: "Banksy" },
  { text: "It's supposed to be hard. If it wasn't hard, everyone would do it.", source: "A League of Their Own" },
  { text: "Get busy living, or get busy dying.", source: "The Shawshank Redemption" },
  { text: "To infinity and beyond!", source: "Toy Story" },
];

const fakeOpponents = [
  { name: "priya_coder", elo: 1380, winRate: 62 },
  { name: "rahul_dev99", elo: 1520, winRate: 71 },
  { name: "neha_algo", elo: 1410, winRate: 58 },
  { name: "arjun_bit", elo: 1490, winRate: 67 },
  { name: "sneha_stack", elo: 1350, winRate: 55 },
  { name: "vikram_sys", elo: 1460, winRate: 64 },
  { name: "ananya_db", elo: 1530, winRate: 73 },
  { name: "karan_net", elo: 1400, winRate: 60 },
  { name: "divya_os", elo: 1470, winRate: 66 },
  { name: "rohan_cpp", elo: 1440, winRate: 63 },
  { name: "ishita_sql", elo: 1510, winRate: 70 },
  { name: "aditya_kern", elo: 1390, winRate: 57 },
];

const LoadingScreen = ({ onCancel, playerElo = 1450, selectedSubject = "mixed", selectedMode = "blitz" }) => {
  const navigate = useNavigate();
  const { socket, isConnected, onlineCount } = useSocket();
  const [quoteIdx] = useState(Math.floor(Math.random() * quotes.length));
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [searchRange, setSearchRange] = useState(50);
  const [playersOnline] = useState(onlineCount || Math.floor(Math.random() * 200) + 340);
  const [playersSearching, setPlayersSearching] = useState(Math.floor(Math.random() * 8) + 12);
  const [currentFakeOpponent, setCurrentFakeOpponent] = useState(null);
  const [showingFake, setShowingFake] = useState(false);
  const [matchPhase, setMatchPhase] = useState("searching");
  const [foundOpponent, setFoundOpponent] = useState(null);

  // Emit join-queue on mount
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("join-queue", {
        subject: selectedSubject,
        mode: selectedMode,
      });
    }

    return () => {
      if (socket && isConnected) {
        socket.emit("leave-queue");
      }
    };
  }, [socket, isConnected, selectedSubject, selectedMode]);

  // Listen for match-found from server
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data) => {
      const { roomId, opponent, questions, mode, isBot, botName, botElo } = data;

      setFoundOpponent({
        name: opponent.username,
        elo: opponent.rating,
        isBot: isBot,
        avatar: opponent.avatar,
      });

      setMatchPhase("found");

      setTimeout(() => {
        setMatchPhase("connecting");

        // Tell server we're ready
        socket.emit("match-ready", {
          roomId,
          questions,
          opponent,
          mode,
          isBot,
          botName,
          botElo,
        });

        setTimeout(() => {
          navigate("/match", {
            state: {
              roomId,
              isBot,
              botName: isBot ? (botName || opponent.username) : null,
              botElo: isBot ? (botElo || opponent.rating) : null,
              opponentName: opponent.username,
              opponentElo: opponent.rating,
              opponentAvatar: opponent.avatar,
              playerElo,
              subject: selectedSubject,
              mode: selectedMode,
              questions,
            },
          });
        }, 1200);
      }, 1500);
    };

    const handleQueueStatus = (data) => {
      setPlayersSearching(data.position + Math.floor(Math.random() * 8) + 8);
    };

    socket.on("match-found", handleMatchFound);
    socket.on("queue-status", handleQueueStatus);

    return () => {
      socket.off("match-found", handleMatchFound);
      socket.off("queue-status", handleQueueStatus);
    };
  }, [socket, navigate, playerElo, selectedSubject, selectedMode]);

  // Dots animation
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Expand search range over time
  useEffect(() => {
    if (elapsed > 0 && elapsed <= 15) {
      setSearchRange(50 + elapsed * 20);
    }
  }, [elapsed]);

  // Fluctuate players searching
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayersSearching((p) => Math.max(8, p + Math.floor(Math.random() * 5) - 2));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Show fake opponents briefly (simulating near-matches)
  useEffect(() => {
    if (matchPhase !== "searching") return;
    const showFake = () => {
      const delay = 1500 + Math.random() * 2000;
      const timeout = setTimeout(() => {
        const opp = fakeOpponents[Math.floor(Math.random() * fakeOpponents.length)];
        setCurrentFakeOpponent(opp);
        setShowingFake(true);
        setTimeout(() => setShowingFake(false), 800 + Math.random() * 600);
        if (matchPhase === "searching") showFake();
      }, delay);
      return timeout;
    };
    const timeout = showFake();
    return () => clearTimeout(timeout);
  }, [matchPhase]);

  const handleCancel = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("leave-queue");
    }
    onCancel();
  }, [socket, isConnected, onCancel]);

  const quote = quotes[quoteIdx];
  const displayOpponent = foundOpponent || null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background noise-bg scanlines animate-fade-in-fast">
      {/* Online status bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
              <Users className="w-3 h-3 inline mr-1" />
              {onlineCount || playersOnline} online
            </span>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
            <Search className="w-3 h-3 inline mr-1" />
            {playersSearching} searching
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-accent uppercase">
            {selectedSubject} · {selectedMode}
          </span>
        </div>
      </div>

      {/* Main content — uses flex to center everything safely without absolute overlap */}
      <div className="flex-1 relative px-4 pb-8 sm:pb-12 pt-8">

        {/* Center content (perfect center) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 -translate-y-12 sm:-translate-y-16">
          {/* Spinner / status icon */}
          <div className="relative mb-4">
            {matchPhase === "found" || matchPhase === "connecting" ? (
              <div className="relative">
                <Bot className="w-12 h-12 text-accent animate-fade-in-fast" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-pulse" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-16 h-16">
                <span className="inline-block text-4xl animate-spin" style={{ animationDuration: "2s" }}>⏳</span>
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
              </div>
            )}
          </div>

          {/* Status text */}
          {matchPhase === "connecting" ? (
            <div className="text-center flex flex-col items-center">
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider mb-2 text-accent animate-fade-in-fast">
                Connecting{dots}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wifi className="w-3 h-3 text-accent animate-pulse" />
                <span className="font-mono text-xs text-muted-foreground">Establishing match session</span>
              </div>
            </div>
          ) : matchPhase === "found" && displayOpponent ? (
            <div className="flex flex-col items-center">
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider mb-3 text-accent animate-fade-in-fast text-center">
                Opponent Found!
              </h2>
              {/* Opponent card */}
              <div className="border border-accent/50 bg-card p-4 sm:p-5 mb-4 w-64 sm:w-72 animate-fade-in-fast">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={displayOpponent.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${displayOpponent.name}`}
                    alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-accent"
                  />
                  <div>
                    <div className="font-mono text-sm font-bold flex items-center gap-1.5">
                      {displayOpponent.name}
                      {displayOpponent.isBot && <Bot className="w-3 h-3 text-accent" />}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{displayOpponent.elo} ELO</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="font-mono text-[9px] text-muted-foreground uppercase">Win Rate</div>
                    <div className="font-mono text-xs font-bold text-accent">{Math.floor(Math.random() * 20 + 55)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[9px] text-muted-foreground uppercase">Matches</div>
                    <div className="font-mono text-xs font-bold">{Math.floor(Math.random() * 100 + 50)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[9px] text-muted-foreground uppercase">Streak</div>
                    <div className="font-mono text-xs font-bold text-accent">{Math.floor(Math.random() * 5 + 1)}W</div>
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground text-center">
                {displayOpponent.isBot ? "Ghost Match · Adaptive Difficulty" : "Live Match · Real Opponent"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider mb-1 animate-flicker text-center">
                Finding Opponent{dots}
              </h2>

              {/* ELO search range */}
              <div className="w-48 sm:w-56 mb-2">
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[9px] text-muted-foreground">ELO Range</span>
                  <span className="font-mono text-[9px] text-accent">{playerElo - searchRange} — {playerElo + searchRange}</span>
                </div>
                <div className="h-1 bg-secondary w-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary/60 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (searchRange / 150) * 100)}%` }}
                  />
                  <div className="absolute top-0 h-full w-2 bg-accent animate-pulse" style={{ left: "50%" }} />
                </div>
              </div>

              {/* Fake opponent flashes */}
              <div className="h-10 flex items-center justify-center mb-3">
                {showingFake && currentFakeOpponent && (
                  <div className="flex items-center justify-center gap-2 animate-fade-in-fast opacity-60">
                    <img
                      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${currentFakeOpponent.name}`}
                      alt=""
                      className="w-6 h-6 border border-border"
                    />
                    <span className="font-mono text-xs text-muted-foreground">{currentFakeOpponent.name}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/60 hidden sm:inline">({currentFakeOpponent.elo})</span>
                    <span className="font-mono text-[9px] text-primary">ELO too far</span>
                  </div>
                )}
              </div>

              <p className="font-mono text-[10px] text-muted-foreground/60 text-center">
                {elapsed}s elapsed · Expanding search range...
              </p>
            </div>
          )}
        </div>

        {/* Bottom Spacer */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] sm:bottom-[20%] w-full max-w-md px-4 flex flex-col items-center">
          {/* Quote & cancel button */}
          {matchPhase === "searching" && (
            <div className="w-full max-w-md flex flex-col items-center justify-center gap-3">
              <div className="text-center">
                <p className="font-body text-sm text-foreground/80 italic">"{quote.text}"</p>
                {quote.source && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">— {quote.source}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleCancel} className="font-mono text-xs max-w-[120px] w-full">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;
