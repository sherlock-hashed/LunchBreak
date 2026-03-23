import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Clock, Building2, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { articleContent } from "@/data/theoryData";

const TopicArticle = () => {
  const { topicId } = useParams();
  const article = articleContent[topicId || ""] || articleContent["deadlock"];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-3xl">
        <Link to="/theory" className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Theory Hub
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="font-mono text-[9px] sm:text-[10px] text-primary uppercase tracking-wider mb-1">{article.subject}</div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider">{article.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="font-mono text-[10px] sm:text-xs">{article.readTime} read</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="self-start">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
          {article.content.map((block, i) => (
            <div key={i} className="mb-4 sm:mb-6 last:mb-0">
              {block.split("\n").map((line, j) => {
                if (line.startsWith("## ")) return <h2 key={j} className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">{line.replace("## ", "")}</h2>;
                if (line.startsWith("- **")) {
                  const parts = line.replace("- **", "").split("**:");
                  return (
                    <div key={j} className="flex items-start gap-2 ml-2 sm:ml-4 mb-2">
                      <span className="w-1 h-1 bg-primary mt-2 shrink-0" />
                      <p className="font-body text-xs sm:text-sm text-foreground/80"><strong className="text-foreground">{parts[0]}</strong>:{parts[1]}</p>
                    </div>
                  );
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <div key={j} className="flex items-start gap-2 ml-2 sm:ml-4 mb-2">
                      <span className="font-mono text-[10px] sm:text-xs text-primary mt-0.5">{line.match(/^\d+/)![0]}.</span>
                      <p className="font-body text-xs sm:text-sm text-foreground/80">
                        {line.replace(/^\d+\.\s*/, "").split("**").map((part, k) => k % 2 === 1 ? <strong key={k} className="text-foreground">{part}</strong> : part)}
                      </p>
                    </div>
                  );
                }
                if (line.trim() === "") return <div key={j} className="h-1.5 sm:h-2" />;
                return <p key={j} className="font-body text-xs sm:text-sm text-foreground/80 leading-relaxed mb-2">{line}</p>;
              })}
            </div>
          ))}
        </div>

        {/* Interview Tips */}
        <div className="border border-accent/30 bg-accent/5 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent">Interview Tips</h3>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {article.interviewTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-accent mt-1.5 sm:mt-2 shrink-0" />
                <p className="font-mono text-[10px] sm:text-xs text-foreground/80">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common questions */}
        <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequently Asked in Interviews</h3>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {article.commonQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] text-primary mt-0.5">Q{i + 1}.</span>
                <p className="font-mono text-[10px] sm:text-xs text-foreground/80">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div className="border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <h3 className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Asked at</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {article.companies.map((c) => (
              <span key={c} className="px-2 sm:px-3 py-0.5 sm:py-1 border border-border font-mono text-[10px] sm:text-xs text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicArticle;
