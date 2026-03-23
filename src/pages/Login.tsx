import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swords, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user?.username || res.user?.name || "Player"}!`);
      navigate("/arena");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      toast.success(`Welcome back, ${res.user?.username || res.user?.name || "Player"}!`);
      navigate("/arena");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Google sign-in failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background noise-bg px-4 sm:px-6 animate-fade-in relative">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="font-heading font-bold text-base sm:text-lg uppercase tracking-[0.2em]">
            CS<span className="text-primary">Clash</span>
          </span>
        </div>

        <div className="border border-border bg-card p-4 sm:p-6">
          <h1 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-center mb-4 sm:mb-6">Login to Existing Account</h1>

          <Button variant="outline" className="w-full mb-3 sm:mb-4 font-mono text-[10px] sm:text-xs" type="button" onClick={handleGoogleAuth} disabled={loading}>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="font-mono text-[10px] sm:text-xs uppercase tracking-wider">Email</Label>
              <Input type="email" placeholder="player@csclash.com" value={email} onChange={(e) => setEmail(e.target.value)} className="font-mono text-xs sm:text-sm" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="font-mono text-[10px] sm:text-xs uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono text-xs sm:text-sm pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            <Button variant="battle" className="w-full" type="submit" disabled={loading}>
              <Swords className="!size-3.5 sm:!size-4" /> {loading ? "Entering..." : "Enter the Arena"}
            </Button>
          </form>

          <p className="text-center mt-3 sm:mt-4 font-mono text-[10px] sm:text-xs text-muted-foreground">
            New here? <Link to="/signup" className="text-primary hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

