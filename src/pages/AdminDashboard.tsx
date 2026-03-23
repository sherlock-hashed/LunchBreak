import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Shield, Users, Swords, Activity, TrendingUp, Search,
  LogOut, Trophy, Clock, UserPlus,
  BarChart3, ChevronDown, ChevronUp, Timer, RefreshCw,
} from "lucide-react";
import axios from "axios";

// ── API base ──
const API_BASE = import.meta.env.PROD ? "/api/admin" : "http://localhost:5000/api/admin";

// ── Colors ──
const CHART_COLORS = [
  "hsl(0 80% 40%)",
  "hsl(120 100% 40%)",
  "hsl(45 100% 50%)",
  "hsl(200 80% 50%)",
  "hsl(280 70% 50%)",
];

// ── Types ──
interface Stats {
  totalUsers: number;
  totalMatches: number;
  matchesToday: number;
  newUsersToday: number;
  matchesByMode: { mode: string; count: number }[];
  matchesBySubject: { subject: string; count: number }[];
  avgRating: { avgBlitz: number; avgRapid: number };
  topPlayers: any[];
  recentMatches: any[];
}

interface UserEntry {
  _id: string;
  username: string;
  email: string;
  rating: { blitz?: number; rapid?: number };
  stats: { matchesPlayed?: number; wins?: number };
  createdAt: string;
}

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded p-2 shadow-lg max-w-[200px] z-50">
      <p className="font-mono text-xs text-foreground font-bold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-mono truncate" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded p-2 shadow-lg z-50">
      <p className="font-mono text-xs text-foreground font-bold">{d.name}</p>
      <p className="text-xs font-mono text-muted-foreground">{d.value} matches</p>
    </div>
  );
};

// ── Stat Card ──
const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) => (
  <Card className="border-border/50 hover:border-primary/30 transition-colors">
    <CardContent className="p-4 flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded">
        <Icon className={`w-5 h-5 ${color || "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-heading font-bold mt-0.5">{value}</p>
        {sub && <span className="text-[10px] text-muted-foreground font-mono">{sub}</span>}
      </div>
    </CardContent>
  </Card>
);

// ── Main Component ──
const AdminDashboard = () => {
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("csclash_admin_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersInSearch, setTotalUsersInSearch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState<"blitz" | "matchesPlayed" | "wins">("blitz");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const navigate = useNavigate();
  const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("csclash_admin_token", res.data.token);
        setAdminToken(res.data.token);
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("csclash_admin_token");
    setAdminToken(null);
    setStats(null);
    setUsers([]);
  };

  // ── Fetch Stats ──
  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/stats`, authHeaders);
      if (res.data.success) setStats(res.data.data);
    } catch {
      setAdminToken(null);
      localStorage.removeItem("csclash_admin_token");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminToken) fetchStats();
  }, [adminToken]);

  // ── Fetch Users ──
  useEffect(() => {
    if (!adminToken) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          ...authHeaders,
          params: { q: userSearch, page: userPage, limit: 15 },
        });
        if (res.data.success) {
          setUsers(res.data.users);
          setTotalPages(res.data.totalPages);
          setTotalUsersInSearch(res.data.total);
        }
      } catch { /* token expired handled above */ }
    };
    fetchUsers();
  }, [adminToken, userSearch, userPage]);

  // ── Derived data ──
  const winRate = useMemo(() => {
    if (!stats?.topPlayers?.length) return "—";
    const totalPlayed = stats.topPlayers.reduce((a, p) => a + (p.stats?.matchesPlayed || 0), 0);
    const totalWon = stats.topPlayers.reduce((a, p) => a + (p.stats?.wins || 0), 0);
    return totalPlayed > 0 ? `${Math.round((totalWon / totalPlayed) * 100)}%` : "—";
  }, [stats]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let aVal = 0, bVal = 0;
      if (sortField === "blitz") { aVal = a.rating?.blitz || 1200; bVal = b.rating?.blitz || 1200; }
      else if (sortField === "matchesPlayed") { aVal = a.stats?.matchesPlayed || 0; bVal = b.stats?.matchesPlayed || 0; }
      else { aVal = a.stats?.wins || 0; bVal = b.stats?.wins || 0; }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [users, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronUp className="w-3 h-3 inline" />) : null;

  // ── Login Screen ──
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 noise-bg animate-fade-in">
        <Card className="w-full max-w-sm border-primary/30">
          <CardHeader className="text-center">
            <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
            <CardTitle className="font-heading uppercase tracking-widest text-lg">Admin Access</CardTitle>
            <CardDescription className="font-mono text-xs">Restricted area — authorized personnel only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Admin email" value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginError(""); }} className="font-mono text-sm" />
              <Input type="password" placeholder="Password" value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(""); }} className="font-mono text-sm" />
              {loginError && <p className="text-primary text-xs font-mono">{loginError}</p>}
              <Button type="submit" variant="battle" className="w-full font-mono text-xs uppercase tracking-wider" disabled={loginLoading}>
                <Shield className="!size-3.5" /> {loginLoading ? "Verifying..." : "Authenticate"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-sm uppercase tracking-[0.2em]">
              CS<span className="text-primary">Clash</span>
              <span className="text-muted-foreground ml-2 text-xs">ADMIN</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => fetchStats(true)} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => navigate("/")}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Exit
            </Button>
            <Button variant="outline" size="sm" className="font-mono text-[10px]" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {loading && !stats ? (
          <div className="text-center py-20 font-mono text-sm text-muted-foreground animate-pulse">Loading stats...</div>
        ) : stats ? (
          <>
            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} sub="registered" color="text-accent" />
              <StatCard icon={UserPlus} label="New Today" value={stats.newUsersToday} sub="signed up today" color="text-blue-400" />
              <StatCard icon={Swords} label="Total Matches" value={stats.totalMatches.toLocaleString()} sub="all time" color="text-primary" />
              <StatCard icon={Clock} label="Today's Matches" value={stats.matchesToday} sub="played today" color="text-yellow-400" />
              <StatCard icon={TrendingUp} label="Avg Blitz" value={Math.round(stats.avgRating.avgBlitz || 1200)} sub="blitz rating" color="text-accent" />
              <StatCard icon={Trophy} label="Avg Rapid" value={Math.round(stats.avgRating.avgRapid || 1200)} sub="rapid rating" color="text-primary" />
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="overview" className="font-mono text-xs uppercase"><BarChart3 className="w-3.5 h-3.5 mr-1" /> Overview</TabsTrigger>
                <TabsTrigger value="users" className="font-mono text-xs uppercase"><Users className="w-3.5 h-3.5 mr-1" /> Users</TabsTrigger>
                <TabsTrigger value="matches" className="font-mono text-xs uppercase"><Swords className="w-3.5 h-3.5 mr-1" /> Matches</TabsTrigger>
              </TabsList>

              {/* ════ OVERVIEW TAB ════ */}
              <TabsContent value="overview" className="space-y-4">
                {/* Row 1: Matches by Mode + Matches by Subject */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider">Matches by Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      {stats.matchesByMode.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.matchesByMode} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
                            <XAxis dataKey="mode" tick={{ fontSize: 11, fill: "hsl(240 5% 50%)" }} />
                            <YAxis tick={{ fontSize: 11, fill: "hsl(240 5% 50%)" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Matches" radius={[4, 4, 0, 0]}>
                              {stats.matchesByMode.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="font-mono text-xs text-muted-foreground">No match data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider">Matches by Subject</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      {stats.matchesBySubject.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                              <Pie data={stats.matchesBySubject} dataKey="count" nameKey="subject"
                                cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                                strokeWidth={2} stroke="hsl(240 14% 8%)">
                                {stats.matchesBySubject.map((_, i) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap justify-center gap-3 -mt-2">
                            {stats.matchesBySubject.map((d, i) => (
                              <div key={d.subject} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <span className="text-[10px] font-mono text-muted-foreground">{d.subject} ({d.count})</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="font-mono text-xs text-muted-foreground">No match data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Top Players + Recent Matches */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" /> Top Players (Blitz)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.topPlayers.length > 0 ? stats.topPlayers.map((p, i) => {
                          const played = p.stats?.matchesPlayed || 0;
                          const won = p.stats?.wins || 0;
                          const wr = played > 0 ? Math.round((won / played) * 100) : 0;
                          return (
                            <div key={p._id} className="flex items-center justify-between bg-secondary/30 border border-border/30 rounded p-3">
                              <div className="flex items-center gap-3">
                                <span className={`font-mono text-xs font-bold w-5 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                                  #{i + 1}
                                </span>
                                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.username}`} alt="" className="w-7 h-7 rounded border border-border" />
                                <div>
                                  <p className="font-mono text-xs text-foreground">{p.username}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground">{won}W / {played}P • {wr}% WR</p>
                                </div>
                              </div>
                              <span className="font-mono text-sm font-bold text-accent">{p.rating?.blitz || 1200}</span>
                            </div>
                          );
                        }) : (
                          <p className="font-mono text-xs text-muted-foreground text-center py-4">No players yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" /> Recent Matches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.recentMatches.length > 0 ? stats.recentMatches.map((m: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-secondary/30 border border-border/30 rounded p-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-mono text-xs truncate">{m.player1?.username || "—"}</span>
                              <span className="text-primary font-bold text-[10px]">VS</span>
                              <span className="font-mono text-xs truncate">{m.player2?.username || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="font-mono text-[10px]">{m.subject || "—"}</Badge>
                              <span className="font-mono text-[10px] text-muted-foreground uppercase">{m.mode}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {new Date(m.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <p className="font-mono text-xs text-muted-foreground text-center py-4">No matches yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: Subject Distribution Bar */}
                {stats.matchesBySubject.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider">Match Volume by Subject</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.matchesBySubject} layout="vertical" barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(240 5% 50%)" }} />
                          <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fill: "hsl(240 5% 50%)" }} width={60} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="Total Matches" radius={[0, 4, 4, 0]}>
                            {stats.matchesBySubject.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ════ USERS TAB ════ */}
              <TabsContent value="users" className="space-y-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-sm font-heading uppercase tracking-wider">
                        All Users ({totalUsersInSearch})
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input placeholder="Search username or email..."
                          value={userSearch}
                          onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                          className="pl-8 h-8 font-mono text-xs" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <div className="min-w-[700px]">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_1.3fr_4.5rem_4.5rem_4rem_4rem_5rem] gap-2 items-center px-4 py-2 border-b border-border">
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">Username</span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">Email</span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase text-center cursor-pointer" onClick={() => toggleSort("blitz")}>
                            Blitz <SortIcon field="blitz" />
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase text-center">Rapid</span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase text-center cursor-pointer" onClick={() => toggleSort("matchesPlayed")}>
                            Played <SortIcon field="matchesPlayed" />
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase text-center cursor-pointer" onClick={() => toggleSort("wins")}>
                            Won <SortIcon field="wins" />
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase text-center">Joined</span>
                        </div>

                        {/* Rows */}
                        {sortedUsers.map((u) => {
                          const played = u.stats?.matchesPlayed || 0;
                          const won = u.stats?.wins || 0;
                          const wr = played > 0 ? Math.round((won / played) * 100) : 0;
                          return (
                            <div key={u._id} className="grid grid-cols-[1fr_1.3fr_4.5rem_4.5rem_4rem_4rem_5rem] gap-2 items-center px-4 py-2.5 border-b border-border/30 hover:bg-secondary/30 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${u.username}`} alt="" className="w-6 h-6 rounded border border-border shrink-0" />
                                <span className="font-mono text-xs truncate">{u.username}</span>
                              </div>
                              <span className="font-mono text-[10px] text-muted-foreground truncate">{u.email}</span>
                              <span className="font-mono text-xs text-accent text-center font-bold">{u.rating?.blitz || 1200}</span>
                              <span className="font-mono text-xs text-accent text-center">{u.rating?.rapid || 1200}</span>
                              <span className="font-mono text-[10px] text-muted-foreground text-center">{played}</span>
                              <span className="font-mono text-[10px] text-center">
                                <span className="text-accent">{won}</span>
                                {played > 0 && <span className="text-muted-foreground ml-1">({wr}%)</span>}
                              </span>
                              <span className="font-mono text-[9px] text-muted-foreground text-center">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })}

                        {users.length === 0 && (
                          <div className="py-8 text-center">
                            <p className="font-mono text-xs text-muted-foreground">No users found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
                        <Button variant="outline" size="sm" className="font-mono text-[10px]"
                          disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)}>
                          Prev
                        </Button>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {userPage} / {totalPages}
                        </span>
                        <Button variant="outline" size="sm" className="font-mono text-[10px]"
                          disabled={userPage >= totalPages} onClick={() => setUserPage(p => p + 1)}>
                          Next
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ════ MATCHES TAB ════ */}
              <TabsContent value="matches" className="space-y-4">
                {/* Subject cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.matchesBySubject.map((m, i) => {
                    const pct = stats.totalMatches > 0 ? ((m.count / stats.totalMatches) * 100).toFixed(1) : "0";
                    return (
                      <Card key={m.subject} className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-heading text-sm uppercase tracking-wider">{m.subject}</h3>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase">Total Matches</p>
                              <p className="text-lg font-heading font-bold">{m.count.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase">% of Total</p>
                              <p className="text-lg font-heading font-bold text-primary">{pct}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Mode cards */}
                  {stats.matchesByMode.map((m, i) => {
                    const pct = stats.totalMatches > 0 ? ((m.count / stats.totalMatches) * 100).toFixed(1) : "0";
                    return (
                      <Card key={m.mode} className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-heading text-sm uppercase tracking-wider">{m.mode}</h3>
                            <Badge variant="outline" className="font-mono text-[10px]">Mode</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase">Total</p>
                              <p className="text-lg font-heading font-bold">{m.count.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase">% of All</p>
                              <p className="text-lg font-heading font-bold text-accent">{pct}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Recent matches full list */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading uppercase tracking-wider">Recent Matches</CardTitle>
                    <CardDescription className="font-mono text-xs">Last {stats.recentMatches.length} matches from the database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentMatches.length > 0 ? stats.recentMatches.map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-secondary/30 border border-border/30 rounded p-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono text-xs truncate">{m.player1?.username || "—"}</span>
                            <span className="text-primary font-bold text-[10px]">VS</span>
                            <span className="font-mono text-xs truncate">{m.player2?.username || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {m.subject && <Badge variant="outline" className="font-mono text-[10px]">{m.subject}</Badge>}
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">{m.mode}</span>
                            {m.duration && <span className="font-mono text-[10px] text-accent">{m.duration}s</span>}
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <p className="font-mono text-xs text-muted-foreground text-center py-4">No matches yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;
