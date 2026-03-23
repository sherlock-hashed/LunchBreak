import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Swords, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Arena", href: "/arena" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Theory Hub", href: "/theory" },
  { label: "Profile", href: "/profile" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Swords className="w-5 h-5 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-heading font-bold text-sm uppercase tracking-[0.2em]">
            CS<span className="text-primary">Clash</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 group">
                <img
                  src={user.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`}
                  alt=""
                  className="w-7 h-7 rounded-sm border border-border group-hover:border-primary transition-colors"
                />
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {user.username}
                </span>
              </Link>
              <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={handleLogout}>
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-mono text-xs">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="battle" size="sm" className="font-mono text-xs">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 font-mono text-sm uppercase tracking-wider transition-colors",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-3 pt-3 border-t border-border">
              {isAuthenticated && user ? (
                <Button variant="outline" size="sm" className="w-full font-mono text-xs" onClick={handleLogout}>
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout ({user.username})
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full font-mono text-xs">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="battle" size="sm" className="w-full font-mono text-xs">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
