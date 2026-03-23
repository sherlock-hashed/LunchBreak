import { Button } from "@/components/ui/button";
import { Swords, Target } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg scanlines pt-14">
      {/* Animated accent lines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/10 to-transparent hidden sm:block" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent hidden sm:block" />
        <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-primary/20 hidden sm:block" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-primary/20 hidden sm:block" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-primary/20 hidden sm:block" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-primary/20 hidden sm:block" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 border border-border px-3 sm:px-4 py-1.5 mb-6 sm:mb-8">
          <span className="w-2 h-2 bg-accent animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">1v1 Live Quiz Arena</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-heading font-bold uppercase leading-[0.9] tracking-tight mb-4 sm:mb-6">
          <span className="text-foreground">SHARPEN YOUR</span>
          <br />
          <span className="text-gradient-red">CS SKILLS.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 sm:mb-4 font-body px-2">
          1v1 live quiz battles on DSA & CS fundamentals for SWE placements.
        </p>

        {/* Supporting text */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-8 sm:mb-10">
          <span className="font-mono text-xs sm:text-sm text-muted-foreground">Match with real opponents.</span>
          <span className="hidden sm:block w-1 h-1 bg-primary" />
          <span className="font-mono text-xs sm:text-sm text-muted-foreground">Think fast, answer faster.</span>
          <span className="hidden sm:block w-1 h-1 bg-primary" />
          <span className="font-mono text-xs sm:text-sm text-muted-foreground">Win with logic, not luck.</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Link to="/arena" className="w-full sm:w-auto">
            <Button variant="battle" size="xl" className="w-full sm:w-auto">
              <Swords className="!size-5" />
              Start Battle
            </Button>
          </Link>
          <Link to="/arena" className="w-full sm:w-auto">
            <Button variant="battle-outline" size="xl" className="w-full sm:w-auto">
              <Target className="!size-5" />
              Practice Solo
            </Button>
          </Link>
        </div>

        {/* Micro text */}
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-mono">
          Sign up free · Start battling in seconds
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
