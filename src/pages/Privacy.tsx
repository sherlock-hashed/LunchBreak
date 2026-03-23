import { Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            Privacy <span className="text-primary">Policy</span>
          </h1>
        </div>

        <div className="border border-border bg-card p-6 sm:p-10 text-center">
          <div className="max-w-md mx-auto">
            <p className="font-heading text-lg sm:text-2xl font-bold text-foreground leading-relaxed mb-4">
              "Privacy is a myth, just like democracy."
            </p>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">
              — JK, The Family Man
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
