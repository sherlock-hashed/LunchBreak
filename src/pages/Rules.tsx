import { Zap, Shield, BookOpen, Users, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const modes = [
  {
    name: "Blitz",
    icon: Zap,
    color: "text-primary",
    duration: "60 seconds",
    type: "MCQ Only",
    scoring: "+4 correct · -1 wrong · 0 skipped",
    description: "The default competitive mode. Fast-paced MCQ battles where speed and accuracy determine the winner.",
    rules: [
      "Both players receive the same set of MCQ questions simultaneously.",
      "You have 60 seconds to answer as many questions as possible.",
      "Each correct answer awards +4 points.",
      "Each wrong answer deducts -1 point (negative marking).",
      "Skipping a question scores 0 points.",
      "Higher total score wins. Tie-breaker: accuracy, then speed.",
      "ELO rating is updated after each match based on the result.",
      "Matched with opponents near your rating via ELO-based matchmaking.",
    ],
  },
  {
    name: "Rapid",
    icon: Shield,
    color: "text-accent",
    duration: "90 seconds",
    type: "Case-Based Scenarios",
    scoring: "+4 correct · -1 wrong · 0 skipped",
    description: "Strategic mode featuring case-based scenario questions that require deeper analysis and critical thinking.",
    rules: [
      "Both players receive case-based scenario questions.",
      "You have 90 seconds — more time for thoughtful answers.",
      "Scoring is the same: +4 correct, -1 wrong, 0 skipped.",
      "Questions test application of concepts, not just recall.",
      "Separate ELO rating from Blitz — your Rapid rating is tracked independently.",
      "Ideal for students who prefer analytical, scenario-driven challenges.",
    ],
  },
  {
    name: "Training",
    icon: BookOpen,
    color: "text-muted-foreground",
    duration: "60 seconds",
    type: "MCQ Only",
    scoring: "No rating impact",
    description: "Solo practice mode against an ELO-adaptive bot. No rating changes — purely for learning and revision.",
    rules: [
      "You play against an AI bot that adapts to your skill level.",
      "60-second timer with the same MCQ format as Blitz.",
      "Your rating is NOT affected — play without pressure.",
      "Matches are NOT recorded in your match history.",
      "XP is NOT awarded in this mode.",
      "Perfect for warming up or revising weak topics before competitive play.",
    ],
  },
  {
    name: "Arena (Custom Rooms)",
    icon: Users,
    color: "text-primary",
    duration: "Configurable (60 / 90 / 120s)",
    type: "Configurable (MCQ / Case-Based / All)",
    scoring: "+4 correct · -1 wrong · Optional rating impact",
    description: "Create private rooms and invite friends. The host controls all match settings.",
    rules: [
      "Host creates a room and shares a 6-character code with friends.",
      "Host can configure: subject, duration, question type, and rating impact.",
      "Both players answer the same questions simultaneously.",
      "Scoring follows the standard +4 / -1 / 0 system.",
      "Rating impact is optional — the host decides before starting.",
      "Results are saved and count towards your match history and stats.",
      "Room is disbanded if the host disconnects.",
    ],
  },
];

const Rules = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1">
            Game <span className="text-primary">Rules</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">Everything you need to know about each game mode.</p>
        </div>

        {/* General rules */}
        <div className="border border-primary/30 bg-primary/5 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-primary mb-3">General Rules</h2>
          <div className="space-y-1.5">
            {[
              "All subjects: OS, DBMS, Computer Networks, Object-Oriented Programming.",
              "You can choose a specific subject or play Mixed (all subjects).",
              "Questions are randomly selected from a curated question bank.",
              "Both players in a match receive the exact same question set.",
              "Server-authoritative scoring — no client-side cheating possible.",
              "ELO ratings are separate per mode (Blitz, Rapid).",
              "XP is earned from all rated modes and contributes to your overall level.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-foreground/80">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode-specific rules */}
        <div className="space-y-4 sm:space-y-6">
          {modes.map((mode) => (
            <div key={mode.name} className="border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <mode.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", mode.color)} />
                <h2 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider">{mode.name}</h2>
              </div>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mb-4">{mode.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="border border-border p-2 sm:p-3">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Duration</div>
                  <div className="font-mono text-xs sm:text-sm">{mode.duration}</div>
                </div>
                <div className="border border-border p-2 sm:p-3">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Type</div>
                  <div className="font-mono text-xs sm:text-sm">{mode.type}</div>
                </div>
                <div className="border border-border p-2 sm:p-3">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">Scoring</div>
                  <div className="font-mono text-[10px] sm:text-xs">{mode.scoring}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                {mode.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                    <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Rules;
