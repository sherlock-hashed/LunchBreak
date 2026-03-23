import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, Linkedin, Instagram, Edit, Trophy, Gamepad2, Target, TrendingUp, ChevronRight, Brain, AlertTriangle, Flame, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import Navbar from "@/components/Navbar";
import SkillRadarChart from "@/components/SkillRadarChart";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";

const ensureUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const rankTiers = [
  { name: "Explorer", min: 0, max: 1199, color: "text-muted-foreground" },
  { name: "Scholar", min: 1200, max: 1499, color: "text-accent" },
  { name: "Specialist", min: 1500, max: 1799, color: "text-blue-400" },
  { name: "Master", min: 1800, max: 1999, color: "text-yellow-400" },
  { name: "Elite", min: 2000, max: 9999, color: "text-primary" },
];

const getRank = (rating: number) => rankTiers.find((r) => rating >= r.min && rating <= r.max) || rankTiers[0];

interface MatchRecord {
  roomId: string;
  mode: string;
  subject: string;
  isBot: boolean;
  winner: string;
  player1: {
    userId: string;
    username: string;
    score: number;
    accuracy: number;
    ratingBefore: number;
    ratingAfter: number;
  };
  player2: {
    userId: string | null;
    username: string;
    score: number;
    accuracy: number;
    ratingBefore: number;
    ratingAfter: number;
  };
  createdAt: string;
}

interface SubjectStat {
  subject: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
  accuracy: number;
  avgTime: number;
  totalCorrect: number;
  totalWrong: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    college: "",
    country: "",
    github: "",
    linkedin: "",
    instagram: "",
  });

  // Fetch match history + subject stats
  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [matchRes, statsRes] = await Promise.all([
          api.get(`/matches/user/${user._id}?limit=20`),
          api.get(`/users/${user._id}/stats`),
        ]);

        if (matchRes.data.success) setMatches(matchRes.data.data);
        if (statsRes.data.success) setSubjectStats(statsRes.data.data);
      } catch (err) {
        // console.error("Profile data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  // Populate edit form when entering edit mode
  useEffect(() => {
    if (editMode && user) {
      setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        college: user.college || "",
        country: user.country || "",
        github: user.socials?.github || "",
        linkedin: user.socials?.linkedin || "",
        instagram: user.socials?.instagram || "",
      });
    }
  }, [editMode, user]);

  const handleSaveProfile = async () => {
    if (!user?._id) return;

    // Client-side validation
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editForm.bio.length > 200) {
      toast.error("Bio must be 200 characters or less");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/users/${user._id}`, {
        name: editForm.name.trim(),
        bio: editForm.bio.trim(),
        college: editForm.college.trim(),
        country: editForm.country.trim(),
        socials: {
          github: editForm.github.trim(),
          linkedin: editForm.linkedin.trim(),
          instagram: editForm.instagram.trim(),
        },
      });

      if (res.data.success) {
        setEditMode(false);
        toast.success("Profile updated successfully");
        if (typeof refreshUser === "function") {
          await refreshUser();
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // User search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim() || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(value.trim())}`);
        if (res.data.success) {
          // Exclude own profile from results
          setSearchResults(res.data.data.filter((u: any) => u._id !== user?._id));
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  if (!user) return null;

  const blitzRating = user.rating?.blitz || 1200;
  const mainRank = getRank(blitzRating);
  const avatarUrl = user.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`;
  const totalGames = user.stats?.matchesPlayed || 0;
  const wins = user.stats?.wins || 0;
  const losses = user.stats?.losses || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // Build ELO history from match data (player1 perspective)
  const eloHistory = useMemo(() => {
    if (!matches.length) return [];

    // Sort oldest-first for chart
    const sorted = [...matches].reverse();
    return sorted.map((m, i) => {
      const isP1 = m.player1.userId === user._id;
      const ratingAfter = isP1 ? m.player1.ratingAfter : m.player2.ratingAfter;
      return { match: i + 1, elo: ratingAfter || 1200 };
    });
  }, [matches, user._id]);

  // Build recent matches display
  const recentMatches = useMemo(() => {
    return matches.slice(0, 5).map((m) => {
      const isP1 = m.player1.userId === user._id;
      const myScore = isP1 ? m.player1.score : m.player2.score;
      const oppScore = isP1 ? m.player2.score : m.player1.score;
      const oppName = isP1 ? m.player2.username : m.player1.username;
      const ratingBefore = isP1 ? m.player1.ratingBefore : m.player2.ratingBefore;
      const ratingAfter = isP1 ? m.player1.ratingAfter : m.player2.ratingAfter;
      const ratingChange = (ratingAfter || 0) - (ratingBefore || 0);
      const result = m.winner === "draw" ? "Draw" : ((m.winner === "player1" && isP1) || (m.winner === "player2" && !isP1)) ? "Win" : "Loss";

      return {
        id: m.roomId,
        opponent: oppName,
        mode: m.mode.charAt(0).toUpperCase() + m.mode.slice(1),
        subject: m.subject || "Mixed",
        result,
        ratingChange,
        score: `${myScore}-${oppScore}`,
      };
    });
  }, [matches, user._id]);

  // Handle click on a match row — fetch full match and navigate to results
  const handleMatchClick = async (roomId: string) => {
    try {
      const res = await api.get(`/matches/${roomId}`);
      if (!res.data.success || !res.data.data) return;

      const m = res.data.data;
      const isP1 = m.player1?.userId === user?._id || m.player1?.userId?._id === user?._id;

      const myData = isP1 ? m.player1 : m.player2;
      const oppData = isP1 ? m.player2 : m.player1;
      const winner = m.winner;

      // Build question results from responses
      const myResponses = myData?.responses || [];
      const oppResponses = oppData?.responses || [];
      const questionResults = myResponses.map((r: any, idx: number) => {
        const oppR = oppResponses[idx];
        return {
          questionIndex: idx,
          topic: r.questionId?.topic || "",
          subject: r.questionId?.subject || m.subject || "",
          playerResult: r.correct ? "correct" : "wrong",
          playerTime: r.responseTime || 0,
          botResult: oppR ? (oppR.correct ? "correct" : "wrong") : "skip",
          botTime: oppR?.responseTime || 0,
        };
      });

      navigate("/match-results", {
        state: {
          roomId: m.roomId,
          playerScore: myData?.score || 0,
          oppScore: oppData?.score || 0,
          isBot: m.isBot || false,
          botName: oppData?.username || "opponent",
          botElo: oppData?.ratingBefore || 1200,
          playerElo: myData?.ratingBefore || 1200,
          playerEloAfter: myData?.ratingAfter || 1200,
          ratingChange: (myData?.ratingAfter || 0) - (myData?.ratingBefore || 0),
          questionsAnswered: (myData?.correct || 0) + (myData?.wrong || 0),
          playerCorrect: myData?.correct || 0,
          playerWrong: myData?.wrong || 0,
          playerSkipped: myData?.skipped || 0,
          accuracy: myData?.accuracy || 0,
          botAccuracy: oppData?.accuracy || 0,
          bestStreak: myData?.streak || 0,
          subject: m.subject || "mixed",
          mode: m.mode || "blitz",
          questionResults,
          botQuestionsAnswered: (oppData?.correct || 0) + (oppData?.wrong || 0),
          botCorrect: oppData?.correct || 0,
          xpGained: isP1 ? m.xpAwarded?.player1 || 0 : m.xpAwarded?.player2 || 0,
          opponentName: oppData?.username || "opponent",
          fromHistory: true,
        },
      });
    } catch (err) {
      // console.error("Failed to load match details:", err);
    }
  };

  // Build subject win rates from real data
  const subjectWinRate = useMemo(() => {
    return subjectStats.map(s => ({
      subject: s.subject,
      wins: s.wins,
      total: s.matches,
    }));
  }, [subjectStats]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 border border-border bg-card" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="font-heading text-xl sm:text-2xl font-bold">{user.name}</h1>
              <Badge variant="outline" className={cn("font-mono text-[10px]", mainRank.color)}>{mainRank.name}</Badge>
            </div>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground mb-1">@{user.username}</p>
            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground/70 mb-2">{user.college || ""}</p>
            <p className="font-body text-xs sm:text-sm text-foreground/80 mb-3">{user.bio || ""}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {user.socials?.github && <a href={ensureUrl(user.socials.github)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>}
              {user.socials?.linkedin && <a href={ensureUrl(user.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>}
              {user.socials?.instagram && <a href={ensureUrl(user.socials.instagram)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>}
            </div>
          </div>
          <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => setEditMode(!editMode)}>
            <Edit className="w-3 h-3" /> {editMode ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Edit Profile Form */}
        {editMode && (
          <div className="border border-primary/30 bg-card p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
            <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-4">Edit Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Name <span className="text-primary">*</span></label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={cn("w-full bg-background border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors", !editForm.name.trim() ? "border-primary/50" : "border-border")} />
                {!editForm.name.trim() && <span className="font-mono text-[9px] text-primary mt-0.5 block">Name is required</span>}
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">College</label>
                <input type="text" value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} maxLength={200} rows={2} className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors resize-none" />
                <span className="font-mono text-[9px] text-muted-foreground">{editForm.bio.length}/200</span>
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Country</label>
                <input type="text" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block flex items-center gap-1"><Github className="w-3 h-3" /> GitHub URL</label>
                <input type="url" value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} placeholder="https://github.com/..." className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                <input type="url" value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram URL</label>
                <input type="url" value={editForm.instagram} onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })} placeholder="https://instagram.com/..." className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button variant="battle" size="sm" className="font-mono text-xs" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* User Search — positioned prominently near the top */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Search className="w-3 h-3 text-primary" />
            Find Players
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username, name, or college..."
              className="w-full bg-background border border-border px-3 py-2.5 font-mono text-xs text-foreground focus:border-primary outline-none transition-colors"
            />
            {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-muted-foreground animate-pulse">Searching...</span>}
          </div>
          {searchResults.length > 0 && (
            <div className="border border-border bg-card mt-1 divide-y divide-border">
              {searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/20 transition-colors"
                >
                  <img src={u.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${u.username}`} alt="" className="w-7 h-7 border border-border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-bold truncate">{u.username}</div>
                    <div className="font-mono text-[9px] text-muted-foreground truncate">{u.college || u.name || ""}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{u.rating?.blitz || 1200} ELO</div>
                </Link>
              ))}
            </div>
          )}
          {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <div className="border border-border bg-card p-4 mt-1 text-center">
              <span className="font-mono text-xs text-muted-foreground">No players found</span>
            </div>
          )}
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { label: "Total XP", value: (user.xp || 0).toLocaleString(), icon: TrendingUp },
            { label: "League", value: mainRank.name, icon: Trophy },
            { label: "Total Games", value: totalGames, icon: Gamepad2 },
            { label: "Win Rate", value: `${winRate}%`, icon: Target },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <stat.icon className="w-3 h-3 text-primary" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>


        {/* Ratings by mode */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Ratings by Mode</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {(["blitz", "rapid"] as const).map((mode) => {
              const rating = user.rating?.[mode] || 1200;
              const rank = getRank(rating);
              return (
                <div key={mode} className="border border-border bg-card p-3 sm:p-4">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">{mode}</div>
                  <div className="font-mono text-xl sm:text-2xl font-bold">{rating}</div>
                  <div className={cn("font-mono text-[9px] sm:text-[10px] uppercase", rank.color)}>{rank.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="border border-border bg-card p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Skill Radar</h2>
          <div className="max-w-xs sm:max-w-md mx-auto">
            <SkillRadarChart />
          </div>
        </div>

        {/* ELO Rating History */}
        {eloHistory.length > 0 && (
          <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
            <h2 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-primary" />
              ELO Rating History
            </h2>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={eloHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
                <XAxis dataKey="match" tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 30", "dataMax + 30"]} tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={35} />
                <Area type="monotone" dataKey="elo" stroke="hsl(0 80% 40%)" fill="hsl(0 80% 40% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[9px] text-muted-foreground">Match 1</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-muted-foreground">Current: <span className="text-foreground font-bold">{blitzRating}</span></span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">Match {eloHistory.length}</span>
            </div>
          </div>
        )}

        {/* Subject-wise Win Rate */}
        {subjectWinRate.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {subjectWinRate.map((s) => {
              const pct = s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0;
              return (
                <div key={s.subject} className="border border-border bg-card p-2.5 sm:p-3">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1.5">{s.subject}</div>
                  <div className={cn("font-mono text-lg sm:text-xl font-bold", pct >= 60 ? "text-accent" : pct >= 45 ? "text-foreground" : "text-primary")}>{pct}%</div>
                  <div className="h-1.5 bg-secondary w-full overflow-hidden mt-1">
                    <div className={cn("h-full", pct >= 60 ? "bg-accent" : pct >= 45 ? "bg-muted-foreground" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground mt-1">{s.wins}W / {s.total - s.wins}L</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent matches */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {matches.length > 0 ? `Last ${Math.min(5, matches.length)} Matches` : "No Matches Yet"}
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <span className="font-mono text-xs text-muted-foreground animate-pulse">Loading match history...</span>
            </div>
          ) : recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.map((match) => (
                <div key={match.id} onClick={() => handleMatchClick(match.id)} className="border border-border bg-card p-3 sm:p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className={cn("font-mono text-[10px] sm:text-xs font-bold uppercase w-8 sm:w-10", match.result === "Win" ? "text-accent" : match.result === "Draw" ? "text-yellow-400" : "text-primary")}>{match.result}</span>
                    <div>
                      <span className="font-mono text-xs sm:text-sm text-foreground">vs {match.opponent}</span>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase">{match.mode}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase">{match.subject}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-mono text-xs sm:text-sm text-foreground hidden sm:inline">{match.score}</span>
                    <span className={cn("font-mono text-[10px] sm:text-xs font-bold", match.ratingChange > 0 ? "text-accent" : match.ratingChange < 0 ? "text-primary" : "text-muted-foreground")}>
                      {match.ratingChange > 0 ? "+" : ""}{match.ratingChange}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-card p-6 text-center">
              <Gamepad2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">Play your first match to see your history here!</p>
              <Link to="/arena">
                <Button variant="battle" className="mt-3" size="sm">
                  <Flame className="w-3 h-3" /> Enter Arena
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
