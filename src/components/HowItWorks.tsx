import { Users, Swords, Trophy } from "lucide-react";

const steps = [
  { number: "01", icon: Users, title: "MATCH", description: "Get paired instantly with another candidate at your level." },
  { number: "02", icon: Swords, title: "BATTLE", description: "Answer CS questions live under a countdown timer." },
  { number: "03", icon: Trophy, title: "WIN", description: "Outscore your opponent. Climb ranks. Earn bragging rights." },
];

const HowItWorks = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="font-mono text-xs text-accent uppercase tracking-widest">The Process</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold uppercase mt-3 tracking-tight">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="group relative bg-card border border-border p-6 sm:p-8 transition-all duration-200 hover:border-primary hover:border-glow-red">
              <span className="font-mono text-xs text-muted-foreground/40 absolute top-4 right-4">{step.number}</span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-border mb-4 sm:mb-6 group-hover:border-primary transition-colors">
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold uppercase tracking-wide mb-2 sm:mb-3">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">{step.description}</p>
              <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
