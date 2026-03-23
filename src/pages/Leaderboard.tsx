import { useState, useEffect } from "react";
import { Trophy, Medal, ChevronUp, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

const rankTiers = [
  { name: "Explorer", min: 0, max: 1199, color: "text-muted-foreground" },
  { name: "Scholar", min: 1200, max: 1499, color: "text-accent" },
  { name: "Specialist", min: 1500, max: 1799, color: "text-blue-400" },
  { name: "Master", min: 1800, max: 1999, color: "text-yellow-400" },
  { name: "Elite", min: 2000, max: 9999, color: "text-primary" },
];
const getRank = (r: number) => rankTiers.find((t) => r >= t.min && r <= t.max) || rankTiers[0];

interface LeaderboardEntry {
  _id: string;
  username: string;
  rating: { blitz: number; rapid: number; arena: number };
  stats: { wins: number; losses: number; draws: number; matchesPlayed: number };
  xp: number;
}

const modesFilter = ["Blitz", "Rapid", "Overall"];

const Leaderboard = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState("Blitz");
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const modeParam = mode.toLowerCase();
        const params = new URLSearchParams({ mode: modeParam, limit: "20" });

        const res = await api.get(`/users/leaderboard?${params.toString()}`);
        if (res.data.success) {
          setPlayers(res.data.data);
        }
      } catch (error) {
        // console.error("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [mode]);

  // Get rating for current mode filter
  const getRating = (p: LeaderboardEntry) => {
    if (mode === "Blitz") return p.rating?.blitz || 1200;
    if (mode === "Rapid") return p.rating?.rapid || 1200;
    return p.xp || 0; // Overall sorted by XP
  };

  const getWinRate = (p: LeaderboardEntry) => {
    const total = p.stats?.matchesPlayed || 0;
    const wins = p.stats?.wins || 0;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  // Sort by rating for display
  const sorted = [...players].sort((a, b) => getRating(b) - getRating(a));

  // Top 3 for podium
  const top3 = sorted.slice(0, 3);
  const showPodium = top3.length >= 3;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            Leader<span className="text-primary">board</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex flex-wrap gap-1">
            {modesFilter.map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn(
                "px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider border transition-all",
                mode === m ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"
              )}>{m}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">Loading leaderboard...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 border border-border bg-card">
            <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No players found. Play a match to appear here!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {showPodium && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[1, 0, 2].map((podiumIdx) => {
                  const p = top3[podiumIdx];
                  if (!p) return null;
                  const rating = getRating(p);
                  const isOverall = mode === "Overall";
                  const pRank = getRank(isOverall ? (p.rating?.blitz || 1200) : rating);
                  const isFirst = podiumIdx === 0;
                  return (
                    <div key={p._id} className={cn(
                      "border bg-card p-2.5 sm:p-4 text-center transition-all",
                      isFirst ? "border-primary glow-red" : "border-border"
                    )}>
                      <div className="flex justify-center mb-1.5 sm:mb-2">
                        {isFirst ? <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" /> : <Medal className={cn("w-4 h-4 sm:w-5 sm:h-5", podiumIdx === 1 ? "text-gray-300" : "text-amber-600")} />}
                      </div>
                      <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.username}`} alt={p.username} className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 border border-border" />
                      <div className="font-mono text-[10px] sm:text-sm font-bold truncate">{p.username}</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground">{isOverall ? `${rating} XP` : rating}</div>
                      <div className={cn("font-mono text-[9px] sm:text-[10px] uppercase", pRank.color)}>{pRank.name}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden sm:block border border-border">
              <div className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem] gap-2 px-4 py-2 border-b border-border bg-secondary/30">
                {["#", "Player", mode === "Overall" ? "XP" : "Rating", "Wins", "W%"].map((h) => (
                  <div key={h} className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{h}</div>
                ))}
              </div>
              {sorted.map((p, i) => {
                const rating = getRating(p);
                const isOverall = mode === "Overall";
                const rank = getRank(isOverall ? (p.rating?.blitz || 1200) : rating);
                const isMe = p._id === user?._id;
                return (
                  <div key={p._id} className={cn(
                    "grid grid-cols-[3rem_1fr_5rem_4rem_4rem] gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors",
                    isMe && "bg-primary/5 border-l-2 border-l-primary"
                  )}>
                    <div className="font-mono text-sm text-muted-foreground">{i + 1}</div>
                    <div className="flex items-center gap-2">
                      <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.username}`} alt={p.username} className="w-6 h-6 border border-border" />
                      <span className="font-mono text-sm">{p.username}</span>
                      <span className={cn("font-mono text-[9px] uppercase", rank.color)}>{rank.name}</span>
                    </div>
                    <div className="font-mono text-sm font-bold">{rating}</div>
                    <div className="font-mono text-sm text-muted-foreground">{p.stats?.wins || 0}</div>
                    <div className="font-mono text-sm text-muted-foreground">{getWinRate(p)}%</div>
                  </div>
                );
              })}
            </div>

            {/* Mobile card view */}
            <div className="sm:hidden space-y-2">
              {sorted.map((p, i) => {
                const rating = getRating(p);
                const isOverall = mode === "Overall";
                const rank = getRank(isOverall ? (p.rating?.blitz || 1200) : rating);
                const isMe = p._id === user?._id;
                return (
                  <div key={p._id} className={cn(
                    "border border-border bg-card p-3 flex items-center gap-3",
                    isMe && "bg-primary/5 border-l-2 border-l-primary"
                  )}>
                    <span className="font-mono text-sm text-muted-foreground w-5">{i + 1}</span>
                    <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.username}`} alt={p.username} className="w-7 h-7 border border-border" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold truncate">{p.username}</div>
                      <div className={cn("font-mono text-[9px] uppercase", rank.color)}>{rank.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{isOverall ? `${rating} XP` : rating}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{getWinRate(p)}% WR</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
