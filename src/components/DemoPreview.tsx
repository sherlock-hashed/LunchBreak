const DemoPreview = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="font-mono text-xs text-accent uppercase tracking-widest">Live Preview</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold uppercase mt-3 tracking-tight">
            EVERY SECOND COUNTS
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative border border-border bg-card overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-muted-foreground/30" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-muted-foreground/30" />
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase hidden sm:inline">csclash://battle/live</span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-accent animate-pulse">● LIVE</span>
            </div>

            {/* Battle content */}
            <div className="p-4 sm:p-6 md:p-10">
              {/* Players bar */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <span className="font-mono text-[10px] sm:text-xs text-primary font-bold">A</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-heading text-sm font-bold uppercase">Player_A</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Rating: 1420</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-mono text-xl sm:text-3xl md:text-4xl font-bold text-accent glow-green">00:14</span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mt-1">Round 3/5</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-heading text-sm font-bold uppercase">Player_B</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Rating: 1385</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <span className="font-mono text-[10px] sm:text-xs text-accent font-bold">B</span>
                  </div>
                </div>
              </div>

              {/* Score bars */}
              <div className="flex gap-2 mb-6 sm:mb-8">
                <div className="flex-1 h-1 sm:h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full bg-primary w-3/5 transition-all" />
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground px-2">2 — 1</span>
                <div className="flex-1 h-1 sm:h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full bg-accent w-2/5 transition-all ml-auto" />
                </div>
              </div>

              {/* Question */}
              <div className="border border-border p-3 sm:p-5 mb-4 sm:mb-6 bg-background">
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase block mb-2">Data Structures & Algorithms</span>
                <p className="font-heading text-xs sm:text-sm md:text-base font-semibold leading-relaxed">
                  What is the time complexity of searching in a balanced BST?
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {["O(n)", "O(log n)", "O(n log n)", "O(1)"].map((option, i) => (
                  <button
                    key={option}
                    className={`flex items-center gap-2 sm:gap-3 border p-2.5 sm:p-4 text-left transition-all duration-150 font-mono text-xs sm:text-sm ${
                      i === 1
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border bg-background text-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreview;
