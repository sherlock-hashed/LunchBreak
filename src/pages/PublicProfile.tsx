import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Github, Linkedin, Instagram, Trophy, Gamepad2, Target, TrendingUp, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import SkillRadarChart from "@/components/SkillRadarChart";
import { cn } from "@/lib/utils";
import api from "@/services/api";

const rankTiers = [
  { name: "Explorer", min: 0, max: 1199, color: "text-muted-foreground" },
  { name: "Scholar", min: 1200, max: 1499, color: "text-accent" },
  { name: "Specialist", min: 1500, max: 1799, color: "text-blue-400" },
  { name: "Master", min: 1800, max: 1999, color: "text-yellow-400" },
  { name: "Elite", min: 2000, max: 9999, color: "text-primary" },
];

const getRank = (rating: number) => rankTiers.find((r) => rating >= r.min && rating <= r.max) || rankTiers[0];

const ensureUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/public/${id}`);
        if (res.data.success) setProfile(res.data.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <span className="font-mono text-xs text-muted-foreground animate-pulse">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 text-center">
          <p className="font-mono text-sm text-muted-foreground">User not found.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-3 h-3" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const blitzRating = profile.rating?.blitz || 1200;
  const mainRank = getRank(blitzRating);
  const avatarUrl = profile.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.username}`;
  const totalGames = profile.stats?.matchesPlayed || 0;
  const wins = profile.stats?.wins || 0;
  const losses = profile.stats?.losses || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6 max-w-2xl">
        {/* Back button */}
        <Button variant="outline" size="sm" className="font-mono text-xs mb-4" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-3 h-3" /> Back
        </Button>

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 text-center sm:text-left">
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 border border-border bg-card" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="font-heading text-xl sm:text-2xl font-bold">{profile.name}</h1>
              <Badge variant="outline" className={cn("font-mono text-[10px]", mainRank.color)}>{mainRank.name}</Badge>
            </div>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground mb-1">@{profile.username}</p>
            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground/70 mb-2">{profile.college || ""}</p>
            <p className="font-body text-xs sm:text-sm text-foreground/80 mb-3">{profile.bio || ""}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {profile.socials?.github && <a href={ensureUrl(profile.socials.github)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>}
              {profile.socials?.linkedin && <a href={ensureUrl(profile.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>}
              {profile.socials?.instagram && <a href={ensureUrl(profile.socials.instagram)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>}
            </div>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {[
            { label: "Total XP", value: (profile.xp || 0).toLocaleString(), icon: TrendingUp },
            { label: "League", value: mainRank.name, icon: Trophy },
            { label: "Total Games", value: totalGames, icon: Gamepad2 },
            { label: "Win Rate", value: `${winRate}%`, icon: Target },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <stat.icon className="w-3 h-3 text-primary" />
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Ratings by mode */}
        <div className="mb-6">
          <h2 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Ratings by Mode</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {(["blitz", "rapid"] as const).map((mode) => {
              const rating = profile.rating?.[mode] || 1200;
              const rank = getRank(rating);
              return (
                <div key={mode} className="border border-border bg-card p-3 sm:p-4">
                  <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">{mode}</div>
                  <div className="font-mono text-xl sm:text-2xl font-bold">{rating}</div>
                  <div className={cn("font-mono text-[9px] sm:text-[10px] uppercase", rank.color)}>{rank.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
