import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Zap, BookOpen, Users, Clock, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const subjects = [
  { id: "os", label: "OS" },
  { id: "dbms", label: "DBMS" },
  { id: "cn", label: "CN" },
  { id: "oops", label: "OOPs" },
  { id: "mixed", label: "Mixed" },
];

const modes = [
  { id: "blitz", name: "Blitz", icon: Zap, duration: "60s", desc: "Quick-fire MCQs. Default mode. Fun, competitive, fast-paced.", type: "MCQ Only", scoring: "+4 / -1 / 0", color: "primary" },
  { id: "rapid", name: "Rapid", icon: Shield, duration: "90s", desc: "Case Based Scenario questions. Slightly longer, more strategic battles.", type: "Case Based", scoring: "+4 / -1 / 0", color: "accent" },
  { id: "training", name: "Training", icon: BookOpen, duration: "60s", desc: "Solo practice without rating impact. Guided learning.", type: "MCQ Only", scoring: "No rating change", color: "muted-foreground" },
  { id: "arena", name: "Arena", icon: Users, duration: "60/90s", desc: "Invite friends. Private or casual. Custom room setup.", type: "Configurable", scoring: "Optional rating", color: "primary" },
];

const Arena = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("mixed");
  const [selectedMode, setSelectedMode] = useState("blitz");
  const [isFinding, setIsFinding] = useState(false);

  // Welcome toast on mount
  useEffect(() => {
    toast("Welcome to the Arena!", { description: "Select your subject & mode to begin." });
  }, []);

  const activeMode = modes.find((m) => m.id === selectedMode)!;

  if (isFinding) {
    const ratingObj = user?.rating || {};
    const elo = ratingObj[selectedMode] || ratingObj.blitz || 1200;
    return <LoadingScreen onCancel={() => setIsFinding(false)} playerElo={elo} selectedSubject={selectedSubject} selectedMode={selectedMode} />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1">
            Battle <span className="text-primary">Arena</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">Choose your settings and start.</p>
        </div>

        {/* Subject selector */}
        <div className="mb-6 sm:mb-8">
          <label className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 block">Subject</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
                selectedSubject === s.id ? "border-primary text-primary bg-primary/10 glow-red" : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              )}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="mb-4 sm:mb-6">
          <label className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 block">Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setSelectedMode(m.id)} className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
                  selectedMode === m.id ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-muted-foreground"
                )}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode detail card */}
        <div className="border border-border bg-card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <activeMode.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {activeMode.name} Mode
              </h2>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1">{activeMode.desc}</p>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-accent">
              <Clock className="w-3 h-3" />
              {activeMode.duration}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="border border-border p-2 sm:p-3">
              <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Type</div>
              <div className="font-mono text-xs sm:text-sm text-foreground">{activeMode.type}</div>
            </div>
            <div className="border border-border p-2 sm:p-3">
              <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Scoring</div>
              <div className="font-mono text-xs sm:text-sm text-foreground">{activeMode.scoring}</div>
            </div>
            <div className="border border-border p-2 sm:p-3">
              <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Subject</div>
              <div className="font-mono text-xs sm:text-sm text-foreground uppercase">{selectedSubject}</div>
            </div>
          </div>

          {/* How to play */}
          <div className="border border-border p-3 sm:p-4 mb-4 sm:mb-6 bg-secondary/30">
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 sm:mb-3">How to Play</h3>
            <div className="space-y-1.5 sm:space-y-2">
              {(selectedMode === "training" ? [
                "Solo practice mode — no opponent, no rating impact.",
                "Answer as many questions as possible within 60 seconds.",
                "Correct: +4 pts · Wrong: -1 pt · Skipped: 0 pts.",
                "Perfect for reviewing topics before competitive play.",
                "Your performance is not recorded in match history.",
              ] : selectedMode === "rapid" ? [
                "Both players receive case-based scenario questions.",
                "90 second time limit — more time to think strategically.",
                "Correct: +4 pts · Wrong: -1 pt · Skipped: 0 pts.",
                "Speed bonus awarded for consecutive correct streaks.",
                "Higher score wins. Tie → Accuracy → Speed.",
              ] : selectedMode === "arena" ? [
                "Create a private room and invite friends via room code.",
                "Host configures subject, question type, and duration.",
                "Both players answer the same questions simultaneously.",
                "Correct: +4 pts · Wrong: -1 pt · Skipped: 0 pts.",
                "Match results are saved and count towards your stats.",
              ] : [
                "Both players receive the same MCQ set simultaneously.",
                "Answer as many questions as possible within 60 seconds.",
                "Correct: +4 pts · Wrong: -1 pt · Skipped: 0 pts.",
                "Speed bonus awarded for consecutive correct streaks.",
                "Higher score wins. Tie → Accuracy → Speed.",
              ]).map((rule, i) => (
                <div key={i} className="flex items-start gap-1.5 sm:gap-2">
                  <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5 text-primary shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="battle" size="xl" className="w-full" onClick={() => {
            if (activeMode.id === "arena") navigate("/room");
            else setIsFinding(true);
          }}>
            <Swords className="!size-4 sm:!size-5" />
            {activeMode.id === "training" ? "Start Practice" : activeMode.id === "arena" ? "Create Room" : "Find Opponent"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Arena;
