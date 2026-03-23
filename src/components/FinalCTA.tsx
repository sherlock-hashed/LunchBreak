import { Button } from "@/components/ui/button";
import { Swords, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 noise-bg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] sm:w-[600px] h-[200px] sm:h-[400px] bg-primary/5 blur-[80px] sm:blur-[120px]" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-border" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-bold uppercase tracking-tight mb-3 sm:mb-4 glow-red-text">
          READY TO COMPETE?
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 font-body">
          Your next challenge is one click away.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link to="/arena" className="w-full sm:w-auto">
            <Button variant="battle" size="xl" className="w-full sm:w-auto">
              <Swords className="!size-5" />
              Start 1v1 Battle
            </Button>
          </Link>
          <Link to="/theory" className="w-full sm:w-auto">
            <Button variant="battle-outline" size="xl" className="w-full sm:w-auto">
              <BookOpen className="!size-5" />
              Explore Questions
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
