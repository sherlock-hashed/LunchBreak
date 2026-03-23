import { useState, useEffect, useMemo } from "react";
import { Trophy, Clock, Target, Zap, RotateCcw, Plus, TrendingUp, TrendingDown, Award, BarChart3, Timer, Brain, Flame, Swords, Bot, ChevronLeft, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip } from "recharts";
import Navbar from "@/components/Navbar";
import SkillRadarChart from "@/components/SkillRadarChart";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionResult {
  questionIndex: number;
  topic: string;
  subject: string;
  playerResult: "correct" | "wrong" | "skip";
  playerTime: number;
  botResult: "correct" | "wrong" | "skip";
  botTime: number;
  questionText?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  playerAnswer?: number;
}

interface MatchState {
  roomId?: string;
  playerScore: number;
  oppScore: number;
  isBot?: boolean;
  botName?: string;
  botElo?: number;
  playerElo?: number;
  playerEloAfter?: number;
  ratingChange?: number;
  questionsAnswered?: number;
  playerCorrect?: number;
  playerWrong?: number;
  playerSkipped?: number;
  accuracy?: number;
  botAccuracy?: number;
  bestStreak?: number;
  subject?: string;
  mode?: string;
  questionResults?: QuestionResult[];
  botQuestionsAnswered?: number;
  botCorrect?: number;
  xpGained?: number;
}

const MatchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { user } = useAuth();

  // --- Incorrect Questions Section Component ---
  const IncorrectQuestionsSection = ({ questions }: { questions: QuestionResult[] }) => {
    const [expanded, setExpanded] = useState(true);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
      <div className="border border-primary/30 bg-card p-3 sm:p-4 mb-4 sm:mb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Incorrect Questions ({questions.length})
          </h3>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {questions.map((q, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={i} className="border border-border bg-background">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-primary shrink-0">Q{q.questionIndex + 1}</span>
                      <span className="font-mono text-[9px] text-muted-foreground truncate">{q.topic}</span>
                      <span className="font-mono text-[9px] text-muted-foreground/60 shrink-0">{q.subject}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3 space-y-3">
                      <p className="font-body text-xs sm:text-sm text-foreground leading-relaxed">{q.questionText}</p>

                      <div className="space-y-1.5">
                        {(q.options || []).map((opt, optIdx) => {
                          const isCorrectOption = optIdx === q.correctAnswer;
                          const isPlayerPick = optIdx === q.playerAnswer;
                          let borderClass = "border-border";
                          let bgClass = "";
                          let icon = null;

                          if (isCorrectOption) {
                            borderClass = "border-accent";
                            bgClass = "bg-accent/10";
                            icon = <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />;
                          } else if (isPlayerPick) {
                            borderClass = "border-primary";
                            bgClass = "bg-primary/10";
                            icon = <AlertCircle className="w-3 h-3 text-primary shrink-0" />;
                          }

                          return (
                            <div key={optIdx} className={cn("border p-2 flex items-start gap-2", borderClass, bgClass)}>
                              <span className="font-mono text-[10px] text-muted-foreground mt-0.5 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                              {icon}
                              <span className="font-mono text-[10px] sm:text-xs">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="border border-accent/20 bg-accent/5 p-2.5">
                          <span className="font-mono text-[9px] text-accent uppercase tracking-wider block mb-1">Explanation</span>
                          <p className="font-mono text-[10px] sm:text-xs text-foreground/80 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // --- End Incorrect Questions Section ---
  const matchState = (location.state as MatchState | null) ?? ({} as Partial<MatchState>);

  const playerScore = matchState.playerScore ?? 0;
  const oppScore = matchState.oppScore ?? 0;
  const isBot = matchState.isBot ?? false;
  const botName = matchState.botName ?? "Opponent";
  const botElo = (matchState as any).opponentElo ?? matchState.botElo ?? 1200;
  const playerElo = matchState.playerElo ?? 1200;
  const playerEloAfter = matchState.playerEloAfter ?? playerElo;
  const ratingChange = matchState.ratingChange ?? 0;
  const questionsAnswered = matchState.questionsAnswered ?? 0;
  const playerCorrect = matchState.playerCorrect ?? 0;
  const playerWrong = matchState.playerWrong ?? 0;
  const playerSkipped = matchState.playerSkipped ?? 0;
  const accuracy = matchState.accuracy ?? 0;
  const botAccuracyPct = matchState.botAccuracy ?? 0;
  const bestStreak = matchState.bestStreak ?? 0;
  const subjectLabel = matchState.subject ?? "mixed";
  const modeLabel = matchState.mode ?? "blitz";
  const questionResults = matchState.questionResults ?? [];
  const botTotal = matchState.botQuestionsAnswered ?? 0;
  const botCorrectCount = matchState.botCorrect ?? 0;

  const isWin = playerScore > oppScore;
  const isDraw = playerScore === oppScore;
  const xpGained = matchState.xpGained ?? 0;
  const opponentName = (matchState as any).opponentName || botName;
  const fromHistory = (matchState as any).fromHistory || false;

  // Compute per-question chart data
  const chartData = useMemo(() => {
    return questionResults.slice(0, 10).map((q, i) => ({
      name: `Q${i + 1}`,
      you: q.playerTime,
      opp: q.botTime,
    }));
  }, [questionResults]);

  const cumulativeData = useMemo(() => {
    let p1Score = 0, p2Score = 0;
    return questionResults.slice(0, 10).map((q, i) => {
      p1Score += q.playerResult === "correct" ? 4 : q.playerResult === "wrong" ? -1 : 0;
      p2Score += q.botResult === "correct" ? 4 : q.botResult === "wrong" ? -1 : 0;
      return { name: `Q${i + 1}`, you: Math.max(0, p1Score), opp: Math.max(0, p2Score) };
    });
  }, [questionResults]);

  // Avg times
  const playerTimes = questionResults.filter(q => q.playerResult !== "skip").map(q => q.playerTime);
  const botTimes = questionResults.filter(q => q.botResult !== "skip").map(q => q.botTime);
  const avgPlayerTime = playerTimes.length > 0 ? parseFloat((playerTimes.reduce((a, b) => a + b, 0) / playerTimes.length).toFixed(1)) : 0;
  const avgBotTime = botTimes.length > 0 ? parseFloat((botTimes.reduce((a, b) => a + b, 0) / botTimes.length).toFixed(1)) : 0;
  const fastestPlayer = playerTimes.length > 0 ? Math.min(...playerTimes) : 0;
  const slowestPlayer = playerTimes.length > 0 ? Math.max(...playerTimes) : 0;
  const fastestBot = botTimes.length > 0 ? Math.min(...botTimes) : 0;
  const slowestBot = botTimes.length > 0 ? Math.max(...botTimes) : 0;
  const top3Avg = playerTimes.length >= 3 ? parseFloat(([...playerTimes].sort((a, b) => a - b).slice(0, 3).reduce((a, b) => a + b, 0) / 3).toFixed(1)) : avgPlayerTime;
  const top3AvgBot = botTimes.length >= 3 ? parseFloat(([...botTimes].sort((a, b) => a - b).slice(0, 3).reduce((a, b) => a + b, 0) / 3).toFixed(1)) : avgBotTime;

  const [rematchTimer, setRematchTimer] = useState(fromHistory ? 0 : 10);

  useEffect(() => {
    if (fromHistory || rematchTimer <= 0) return;
    const interval = setInterval(() => setRematchTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [rematchTimer, fromHistory]);

  const handleRematch = () => {
    if (socket && isBot) {
      // For bot matches, emit rematch request — server handles it
      socket.emit("request-rematch", { roomId: matchState.roomId || "" });
    }
    // Navigate to loading screen for a fresh match
    navigate("/arena", {
      state: {
        autoQueue: true,
        subject: subjectLabel,
        mode: modeLabel,
        playerElo: playerEloAfter,
      },
    });
  };

  const handleFindNew = () => {
    navigate("/arena");
  };

  // Generate insight
  const insight = useMemo(() => {
    if (avgPlayerTime < avgBotTime) return `Your avg response time (${avgPlayerTime}s) is ${(avgBotTime - avgPlayerTime).toFixed(1)}s faster than your opponent.`;
    return `Your opponent was ${(avgPlayerTime - avgBotTime).toFixed(1)}s faster on average. Work on reaction speed.`;
  }, [avgPlayerTime, avgBotTime]);

  const performanceTip = useMemo(() => {
    if (accuracy >= 80) return "Excellent accuracy! Focus on speed to climb further.";
    if (accuracy >= 60) return "Good foundation. Review wrong answers to push accuracy above 80%.";
    return "Focus on concept clarity. Try Training mode to strengthen weak topics.";
  }, [accuracy]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-3xl">
        {/* Winner banner */}
        <div className="text-center mb-6 sm:mb-8">
          <Trophy className={cn("w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3", isWin ? "text-yellow-400" : isDraw ? "text-muted-foreground" : "text-muted-foreground")} />
          <h1 className={cn("font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1", isWin ? "text-gradient-red" : "text-muted-foreground")}>
            {isWin ? "Victory!" : isDraw ? "Draw" : "Defeat"}
          </h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">
            {modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)} · {subjectLabel.toUpperCase()} · {modeLabel === "rapid" ? "90s" : "60s"}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center mb-6 sm:mb-8">
          <div className="text-center border border-border bg-card p-3 sm:p-4">
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.username || "Player 1"}`} alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 border border-primary" />
            <div className="font-mono text-xs sm:text-sm font-bold truncate">{user?.username || "Player 1"}</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-accent mt-1">{playerScore}</div>
            <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{playerElo} ELO</div>
          </div>
          <div className="font-heading text-lg sm:text-2xl font-bold text-muted-foreground">VS</div>
          <div className="text-center border border-border bg-card p-3 sm:p-4">
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${opponentName}`} alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 border border-border" />
            <div className="font-mono text-xs sm:text-sm font-bold truncate flex items-center justify-center gap-1">
              {isBot && <Bot className="w-3 h-3 text-accent" />}
              {opponentName}
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-muted-foreground mt-1">{oppScore}</div>
            <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{botElo} ELO</div>
          </div>
        </div>

        {/* Rating + XP change */}
        <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase mb-1">Rating</div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-mono text-xs text-muted-foreground">{playerElo}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-sm sm:text-lg font-bold">{playerEloAfter}</span>
              </div>
              <span className={cn("font-mono text-xs font-bold", ratingChange > 0 ? "text-accent" : "text-primary")}>
                {ratingChange > 0 ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                {ratingChange > 0 ? "+" : ""}{ratingChange}
              </span>
            </div>
            <div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase mb-1">XP Gained</div>
              <div className="font-mono text-sm sm:text-lg font-bold text-accent">+{xpGained}</div>
              <span className="font-mono text-[10px] text-muted-foreground">Experience</span>
            </div>
            <div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase mb-1">Best Streak</div>
              <div className="font-mono text-sm sm:text-lg font-bold text-accent flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {bestStreak}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">In a row</span>
            </div>
          </div>
        </div>

        {/* Stats comparison grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: "Accuracy", you: `${accuracy}%`, opp: `${botAccuracyPct}%`, icon: Target },
            { label: "Avg Time", you: `${avgPlayerTime}s`, opp: `${avgBotTime}s`, icon: Clock },
            { label: "Fastest", you: `${fastestPlayer}s`, opp: `${fastestBot}s`, icon: Zap },
            { label: "Slowest", you: `${slowestPlayer}s`, opp: `${slowestBot}s`, icon: Timer },
          ].map((s) => (
            <div key={s.label} className="border border-border bg-card p-2.5 sm:p-3">
              <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                <s.icon className="w-3 h-3 text-primary" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase">{s.label}</span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-accent">{s.you}</div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground">vs {s.opp}</div>
            </div>
          ))}
        </div>

        {/* Extended stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: "Correct", you: playerCorrect, opp: botCorrectCount, icon: Target, color: "text-accent" },
            { label: "Wrong", you: playerWrong, opp: botTotal - botCorrectCount, icon: Brain, color: "text-primary" },
            { label: "Top 3 Avg", you: `${top3Avg}s`, opp: `${top3AvgBot}s`, icon: Award, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="border border-border bg-card p-2.5 sm:p-3">
              <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                <s.icon className={cn("w-3 h-3", s.color)} />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase">{s.label}</span>
              </div>
              <div className={cn("font-mono text-xs sm:text-sm font-bold", s.color)}>{s.you}</div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground">vs {s.opp}</div>
            </div>
          ))}
        </div>

        {/* Cumulative Score Chart */}
        {cumulativeData.length > 0 && (
          <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-primary" />
              Score Progression
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={25} />
                <Tooltip
                  contentStyle={{ background: "hsl(240 10% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 0, padding: "8px 12px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "hsl(240 5% 60%)", marginBottom: 4 }}
                  itemStyle={{ fontFamily: "JetBrains Mono", fontSize: 11, padding: 0 }}
                  formatter={(value: number, name: string) => [
                    `${value} pts`,
                    name === "you" ? "You" : "Opponent",
                  ]}
                  cursor={{ stroke: "hsl(240 10% 25%)", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="you" stroke="hsl(120 100% 40%)" fill="hsl(120 100% 40% / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="opp" stroke="hsl(240 10% 40%)" fill="hsl(240 10% 40% / 0.05)" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 sm:gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-accent" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-muted-foreground" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">Opponent</span>
              </div>
            </div>
          </div>
        )}

        {/* Response time chart */}
        {chartData.length > 0 && (
          <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              Response Time (seconds)
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="name" tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={25} />
                <Tooltip
                  contentStyle={{ background: "hsl(240 10% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 0, padding: "8px 12px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "hsl(240 5% 60%)", marginBottom: 4 }}
                  itemStyle={{ fontFamily: "JetBrains Mono", fontSize: 11, padding: 0 }}
                  formatter={(value: number, name: string) => [
                    `${value}s`,
                    name === "you" ? "You" : "Opponent",
                  ]}
                  cursor={{ fill: "hsl(240 10% 12%)" }}
                />
                <Bar dataKey="you" fill="hsl(0 80% 40%)" radius={0} />
                <Bar dataKey="opp" fill="hsl(240 10% 25%)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 sm:gap-6 mt-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">You</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">Opponent</span>
              </div>
            </div>
          </div>
        )}

        {/* Question breakdown */}
        {questionResults.length > 0 && (
          <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Question Breakdown</h3>
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="min-w-[440px]">
                <div className="grid grid-cols-[2rem_4rem_1fr_3rem_1fr_3rem] gap-1.5 items-center pb-2 border-b border-border mb-1">
                  <span className="font-mono text-[9px] text-muted-foreground">#</span>
                  <span className="font-mono text-[9px] text-muted-foreground">Topic</span>
                  <span className="font-mono text-[9px] text-muted-foreground text-center">You</span>
                  <span className="font-mono text-[9px] text-muted-foreground text-center">Time</span>
                  <span className="font-mono text-[9px] text-muted-foreground text-center">Opp</span>
                  <span className="font-mono text-[9px] text-muted-foreground text-center">Time</span>
                </div>
                {questionResults.slice(0, 10).map((q, i) => (
                  <div key={i} className="grid grid-cols-[2rem_4rem_1fr_3rem_1fr_3rem] gap-1.5 items-center py-1 border-b border-border/50 last:border-0">
                    <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">Q{i + 1}</span>
                    <span className="font-mono text-[9px] text-muted-foreground truncate">{q.topic}</span>
                    <div className={cn("font-mono text-[10px] sm:text-xs text-center py-0.5", q.playerResult === "correct" ? "text-accent bg-accent/10" : q.playerResult === "wrong" ? "text-primary bg-primary/10" : "text-muted-foreground")}>{q.playerResult.toUpperCase()}</div>
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground text-center">{q.playerTime}s</span>
                    <div className={cn("font-mono text-[10px] sm:text-xs text-center py-0.5", q.botResult === "correct" ? "text-accent bg-accent/10" : q.botResult === "wrong" ? "text-primary bg-primary/10" : "text-muted-foreground")}>{q.botResult.toUpperCase()}</div>
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground text-center">{q.botTime}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incorrect Question Explanations */}
        {(() => {
          const wrongQs = questionResults.filter(q => q.playerResult === "wrong" && q.questionText);
          if (wrongQs.length === 0) return null;
          return <IncorrectQuestionsSection questions={wrongQs} />;
        })()}

        {/* Insights */}
        <div className="border border-primary/30 bg-primary/5 p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-2">💡 Insight</h3>
          <p className="font-mono text-[10px] sm:text-xs text-foreground/80 mb-2">{insight}</p>
          <p className="font-mono text-[10px] sm:text-xs text-foreground/60">{performanceTip}</p>
        </div>

        {/* Topic-wise accuracy */}
        {questionResults.length > 0 && (
          <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Target className="w-3 h-3 text-primary" />
              Topic-wise Performance
            </h3>
            <div className="space-y-2">
              {(() => {
                const topicMap: Record<string, { correct: number; total: number }> = {};
                questionResults.forEach(q => {
                  if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
                  topicMap[q.topic].total++;
                  if (q.playerResult === "correct") topicMap[q.topic].correct++;
                });
                return Object.entries(topicMap).map(([topic, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={topic}>
                      <div className="flex justify-between mb-0.5">
                        <span className="font-mono text-[10px] text-foreground">{topic}</span>
                        <span className={cn("font-mono text-[10px] font-bold", pct >= 50 ? "text-accent" : "text-primary")}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary w-full overflow-hidden">
                        <div className={cn("h-full transition-all", pct >= 50 ? "bg-accent" : "bg-primary")} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Skill Radar */}
        <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Updated Skill Radar</h3>
          <div className="max-w-xs sm:max-w-sm mx-auto">
            <SkillRadarChart />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {fromHistory ? (
            <>
              <Button variant="battle" size="lg" className="flex-1" onClick={() => navigate("/profile")}>
                <ChevronLeft className="!size-4" /> Back to Profile
              </Button>
              <Link to="/arena" className="flex-1">
                <Button variant="battle-outline" size="lg" className="w-full">
                  <Swords className="!size-4" /> Play New Match
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                variant="battle"
                size="lg"
                className="flex-1"
                onClick={handleRematch}
                disabled={rematchTimer <= 0}
              >
                {isBot && <Bot className="!size-4" />}
                <RotateCcw className="!size-4" />
                {rematchTimer > 0 ? `Rematch (${rematchTimer}s)` : "Expired"}
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={handleFindNew}>
                <Swords className="!size-4" /> Find New Opponent
              </Button>
              <Link to="/arena" className="flex-1">
                <Button variant="battle-outline" size="lg" className="w-full">
                  <Plus className="!size-4" /> Arena
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResults;
