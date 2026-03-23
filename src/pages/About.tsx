import { Swords, Target, Zap, Users, Award, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            About <span className="text-primary">CSClash</span>
          </h1>
        </div>

        <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider mb-3">What is CSClash?</h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
            CSClash is a real-time competitive 1v1 quiz platform designed for Computer Science students preparing for SWE placements.
            Battle opponents in timed quizzes covering OS, DBMS, Computer Networks, and Object-Oriented Programming.
          </p>
          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Whether you're sharpening your fundamentals or competing for the top of the leaderboard, CSClash provides a focused,
            competitive environment to test your knowledge under pressure.
          </p>
        </div>

        <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider mb-4">Why CSClash?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: Zap, title: "Real-Time Battles", desc: "Compete live against opponents with server-authoritative scoring and timers." },
              { icon: Target, title: "Placement Focused", desc: "Questions sourced from real interview rounds at top tech companies." },
              { icon: Award, title: "ELO Rating System", desc: "Skill-based matchmaking with separate ratings for each game mode." },
              { icon: Users, title: "Custom Rooms", desc: "Create private rooms and invite friends for practice battles." },
              { icon: BookOpen, title: "Multiple Modes", desc: "Blitz, Rapid, Training, and Arena modes for different play styles." },
              { icon: Swords, title: "Bot Opponents", desc: "ELO-adaptive bots ensure you always have an opponent to practice against." },
            ].map((item) => (
              <div key={item.title} className="border border-border p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">{item.title}</span>
                </div>
                <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card p-4 sm:p-6">
          <h2 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider mb-3">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "React", "Vite", "Tailwind CSS", "shadcn/ui",
              "Node.js + Express", "MongoDB + Mongoose", "Socket.io", "JWT Auth",
            ].map((tech) => (
              <div key={tech} className="border border-border px-3 py-2">
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
