import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import DemoPreview from "@/components/DemoPreview";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background scroll-smooth animate-fade-in flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><FeaturesSection /></div>
        <DemoPreview />
        <div id="social-proof"><SocialProof /></div>
        <div id="final-cta"><FinalCTA /></div>
      </div>
      <Footer />
    </main>
  );
};

export default Index;
