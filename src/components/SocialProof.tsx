import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 100, label: "Battles Played", suffix: "+" },
  { value: 95, label: "Placement-Relevant", suffix: "%" },
  { value: 4, label: "CS Subjects", suffix: "" },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const SocialProof = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-body italic">"Built for serious placement prep."</p>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-body italic">"Inspired by real interview patterns."</p>
          <p className="text-base sm:text-lg md:text-xl text-foreground font-heading font-semibold uppercase tracking-wide">"Designed for pressure, not comfort."</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
