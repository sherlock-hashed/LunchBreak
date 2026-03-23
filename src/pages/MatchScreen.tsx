import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, Zap, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MatchScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { user } = useAuth();

  // Persist match state to sessionStorage so refresh doesn't lose everything
  const matchState = (() => {
    if (location.state) {
      // Fresh navigation — save to sessionStorage
      try { sessionStorage.setItem("csclash_match", JSON.stringify(location.state)); } catch {}
      return location.state;
    }
    // Page refresh — try to restore from sessionStorage
    try {
      const saved = sessionStorage.getItem("csclash_match");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  // Derive match params from state first (before any useEffects reference them)
  const roomId = matchState?.roomId ?? "";
  const isBot = matchState?.isBot ?? false;
  const botName = matchState?.botName ?? matchState?.opponentName ?? "Opponent";
  const botElo = matchState?.botElo ?? matchState?.opponentElo ?? 1200;
  const subject = matchState?.subject ?? "mixed";
  const mode = matchState?.mode ?? "blitz";
  const playerElo = matchState?.playerElo ?? (() => {
    const rObj = user?.rating || {};
    return rObj[mode] || rObj.blitz || 1200;
  })();
  const serverQuestions = matchState?.questions ?? [];
  const customDuration = matchState?.customDuration;

  const [timeLeft, setTimeLeft] = useState(customDuration || (mode === "rapid" ? 90 : 60));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState<number | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [playerCorrect, setPlayerCorrect] = useState(0);
  const [playerWrong, setPlayerWrong] = useState(0);
  const questionStartTime = useRef(Date.now());
  const advanceTimeout = useRef<any>(null);
  const waitingForResult = useRef(false);
  const matchEnded = useRef(false);

  // If no match state at all, redirect back to arena
  useEffect(() => {
    if (!matchState) {
      navigate("/arena", { replace: true });
    }
  }, [matchState, navigate]);

  // On mount (including refresh): tell server we're (re-)joining this match room
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the socket room and tell server our new socket ID
    socket.emit("rejoin-match", { roomId });

    // Server may send back current match state on rejoin
    const handleMatchState = (data: any) => {
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.playerScore !== undefined) setScore(data.playerScore);
      if (data.oppScore !== undefined) setOppScore(data.oppScore);
      if (data.playerCurrentQ !== undefined) setCurrentQ(data.playerCurrentQ);
    };

    socket.on("match-state", handleMatchState);
    return () => {
      socket.off("match-state", handleMatchState);
    };
  }, [socket, roomId]);

  // Clean up sessionStorage when navigating away from match
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("csclash_match");
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Server-authoritative timer
    const handleTimerTick = (data) => {
      setTimeLeft(data.timeLeft);
    };

    // Result of our own answer from server (authoritative)
    const handleAnswerResult = (data: any) => {
      setScore(data.score);
      setOppScore(data.oppScore);
      setStreak(data.streak);
      if (data.bestStreak > bestStreak) {
        setBestStreak(data.bestStreak);
      }
      // Server tells us if our answer was correct + the correct option index
      setIsCorrect(data.correct);
      if (typeof data.correctIdx === 'number') {
        setCorrectAnswerIdx(data.correctIdx);
      }
      // Update counters from server
      setQuestionsAnswered(q => q + 1);
      if (data.correct) {
        setPlayerCorrect(c => c + 1);
      } else {
        setPlayerWrong(w => w + 1);
      }

      // NOW advance to next question after showing the highlight for 700ms
      waitingForResult.current = false;
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      advanceTimeout.current = setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setAnswered(null);
        setIsCorrect(null);
        setCorrectAnswerIdx(null);
        questionStartTime.current = Date.now();
      }, 700);
    };

    // Opponent scored (real-time update)
    const handleOpponentScored = (data) => {
      setOppScore(data.oppScore);
    };

    // Match ended (navigate to results)
    const handleMatchEnd = (data: any) => {
      if (matchEnded.current) return;
      matchEnded.current = true;
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      navigate("/match-results", { state: data });
    };

    // Match terminated (opponent disconnected)
    const handleMatchTerminated = (data: any) => {
      if (matchEnded.current) return;
      matchEnded.current = true;
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      toast.error(data?.reason || "Match terminated due to disconnection.");
      // Wait briefly for match-end event with results, else navigate with local data
      setTimeout(() => {
        navigate("/match-results", {
          state: {
            playerScore: score,
            oppScore,
            isBot,
            botName,
            botElo,
            playerElo,
            playerEloAfter: playerElo,
            ratingChange: 0,
            questionsAnswered,
            playerCorrect,
            playerWrong,
            playerSkipped: 0,
            accuracy: questionsAnswered > 0 ? Math.round((playerCorrect / questionsAnswered) * 100) : 0,
            botAccuracy: 0,
            bestStreak,
            subject,
            mode,
            questionResults: [],
            botQuestionsAnswered: 0,
            botCorrect: 0,
            terminated: true,
            terminatedReason: data?.reason,
          },
        });
      }, 1500);
    };

    socket.on("timer-tick", handleTimerTick);
    socket.on("answer-result", handleAnswerResult);
    socket.on("opponent-scored", handleOpponentScored);
    socket.on("match-end", handleMatchEnd);
    socket.on("match-terminated", handleMatchTerminated);

    return () => {
      socket.off("timer-tick", handleTimerTick);
      socket.off("answer-result", handleAnswerResult);
      socket.off("opponent-scored", handleOpponentScored);
      socket.off("match-end", handleMatchEnd);
      socket.off("match-terminated", handleMatchTerminated);
    };
  }, [socket, navigate, bestStreak]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (answered !== null || waitingForResult.current) return;
    setAnswered(optionIdx);
    waitingForResult.current = true;

    // Send to server for authoritative scoring — DON'T advance yet.
    // The handleAnswerResult callback will advance after showing the highlight.
    if (socket) {
      socket.emit("submit-answer", {
        roomId,
        questionIdx: currentQ,
        optionIdx,
      });
    }

    // Safety fallback: if server doesn't respond within 3 seconds, force advance
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(() => {
      if (waitingForResult.current) {
        waitingForResult.current = false;
        setCurrentQ((q) => q + 1);
        setAnswered(null);
        setIsCorrect(null);
        setCorrectAnswerIdx(null);
        questionStartTime.current = Date.now();
      }
    }, 3000);
  }, [answered, currentQ, socket, roomId]);

  // Fallback: if no server timer events, run client timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // If timer hits 0 and no match-end from server yet, navigate after a short delay
  useEffect(() => {
    if (timeLeft <= 0) {
      const fallbackTimer = setTimeout(() => {
        // Only navigate if server hasn't already sent match-end
        if (matchEnded.current) return;
        matchEnded.current = true;
        navigate("/match-results", {
          state: {
            playerScore: score,
            oppScore,
            isBot,
            botName,
            botElo,
            playerElo,
            playerEloAfter: playerElo,
            ratingChange: 0,
            questionsAnswered,
            playerCorrect,
            playerWrong,
            playerSkipped: 0,
            accuracy: questionsAnswered > 0 ? Math.round((playerCorrect / questionsAnswered) * 100) : 0,
            botAccuracy: 0,
            bestStreak,
            subject,
            mode,
            questionResults: [],
            botQuestionsAnswered: 0,
            botCorrect: 0,
          },
        });
      }, 3000); // Give server 3s to send match-end
      return () => clearTimeout(fallbackTimer);
    }
  }, [timeLeft]);

  const question = serverQuestions.length > 0
    ? serverQuestions[currentQ % serverQuestions.length]
    : { text: "Loading...", options: ["", "", "", ""], correct: 0, subject: "", topic: "", difficulty: "" };

  const timerColor = timeLeft <= 10 ? "text-primary" : timeLeft <= 20 ? "text-yellow-400" : "text-accent";
  const playerName = user?.username || "aarav_42";

  return (
    <div className="min-h-screen bg-background noise-bg scanlines flex flex-col animate-fade-in-fast relative">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          {/* Player 1 */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${playerName}`} alt="" className="w-6 h-6 sm:w-8 sm:h-8 border border-primary" />
            <div className="hidden sm:block">
              <div className="font-mono text-xs font-bold">{playerName}</div>
              <div className="font-mono text-xs text-muted-foreground">{playerElo}</div>
            </div>
            <div className="font-mono text-lg sm:text-2xl font-bold text-accent ml-1 sm:ml-2">{score}</div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center">
            <div className={cn("font-mono text-xl sm:text-3xl font-bold tabular-nums", timerColor, timeLeft <= 10 && "animate-pulse-glow")}>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-0.5 sm:mr-1 mb-0.5 sm:mb-1" />
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-muted-foreground">
              Q{currentQ + 1} · {mode.toUpperCase()}
              {isBot && (
                <span className="flex items-center gap-0.5 text-accent">
                  <Bot className="w-2.5 h-2.5" /> BOT
                </span>
              )}
            </div>
          </div>

          {/* Player 2 / Bot */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="font-mono text-lg sm:text-2xl font-bold text-muted-foreground mr-1 sm:mr-2">{oppScore}</div>
            <div className="text-right hidden sm:block">
              <div className="font-mono text-xs font-bold flex items-center justify-end gap-1">
                {isBot && <Bot className="w-3 h-3 text-accent" />}
                {botName}
              </div>
              <div className="font-mono text-xs text-muted-foreground">{botElo}</div>
            </div>
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${botName}`} alt="" className="w-6 h-6 sm:w-8 sm:h-8 border border-border" />
          </div>
        </div>
      </div>

      {/* Streak */}
      {streak >= 2 && (
        <div className="flex items-center justify-center gap-1 py-0.5 sm:py-1 bg-accent/10 border-b border-accent/20">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent" />
          <span className="font-mono text-[9px] sm:text-[10px] text-accent uppercase tracking-wider">{streak} streak!</span>
        </div>
      )}

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="font-mono text-[9px] sm:text-[10px] text-primary uppercase tracking-wider border border-primary/30 px-1.5 sm:px-2 py-0.5">{question.subject}</span>
            <span className="font-mono text-[9px] sm:text-[10px] text-accent uppercase tracking-wider border border-accent/30 px-1.5 sm:px-2 py-0.5">{question.topic}</span>
            <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{question.difficulty}</span>
          </div>

          <h2 className="font-heading text-base sm:text-xl md:text-2xl font-bold leading-tight mb-5 sm:mb-8">{question.text}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {question.options.map((option, idx) => {
              let borderClass = "border-border hover:border-muted-foreground";
              let bgClass = "bg-card";
              if (answered !== null) {
                if (isCorrect !== null) {
                  // Server has responded — show correct/wrong feedback
                  if (correctAnswerIdx !== null && idx === correctAnswerIdx) {
                    borderClass = "border-accent"; bgClass = "bg-accent/10"; // correct answer = green
                  } else if (idx === answered && isCorrect === false) {
                    borderClass = "border-primary"; bgClass = "bg-primary/10"; // user's wrong pick = red
                  }
                } else {
                  // Server hasn't responded yet — show neutral "selected" state
                  if (idx === answered) {
                    borderClass = "border-muted-foreground"; bgClass = "bg-secondary/30";
                  }
                }
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered !== null} className={cn(
                  "border p-3 sm:p-4 text-left transition-all", borderClass, bgClass,
                  answered === null && "hover:bg-secondary/50 cursor-pointer active:scale-[0.98]"
                )}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-0.5 shrink-0">{String.fromCharCode(65 + idx)}.</span>
                    <span className="font-body text-xs sm:text-sm">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Score bar */}
          <div className="mt-5 sm:mt-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">Score Gap</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-secondary w-full relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-accent transition-all duration-300" style={{ width: `${Math.min(100, (score / Math.max(score + oppScore, 1)) * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[9px] sm:text-[10px] text-accent">{score}</span>
              <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">{oppScore}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
