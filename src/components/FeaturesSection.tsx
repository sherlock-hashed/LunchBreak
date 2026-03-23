import { Zap, BookOpen, Timer, BarChart3, Target, Monitor } from "lucide-react";

const features = [
  { icon: Zap, title: "Live 1v1 Battles", description: "Real-time quizzes powered by WebSockets." },
  { icon: BookOpen, title: "Placement-Focused Questions", description: "DSA, OS, DBMS, CN, OOPS — interview relevant only." },
  { icon: Timer, title: "Time-Pressure Gameplay", description: "Think fast. Answer faster." },
  { icon: Target, title: "Skill-Based Matchmaking", description: "Face opponents at your level." },
  { icon: BarChart3, title: "Instant Results", description: "Accuracy, speed, and rank impact." },
  { icon: Monitor, title: "Focused Interface", description: "Clean design. Zero distractions." },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="font-mono text-xs text-accent uppercase tracking-widest">Features</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold uppercase mt-3 tracking-tight">
            BUILT FOR PERFORMANCE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="group bg-background border border-border p-6 sm:p-8 transition-all duration-200 hover:bg-card">
              <feature.icon className="w-5 h-5 text-primary mb-4 sm:mb-5 transition-colors group-hover:text-accent" strokeWidth={1.5} />
              <h3 className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
