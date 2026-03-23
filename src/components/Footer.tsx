import { useState, useEffect } from "react";
import { Swords } from "lucide-react";
import { Link } from "react-router-dom";

const footerQuotes = [
  { text: "Art should comfort the disturbed and disturb the comfortable.", source: "Banksy" },

  // Movies
  { text: "Get busy living, or get busy dying.", source: "The Shawshank Redemption" },
  { text: "Hope is a good thing, maybe the best of things.", source: "The Shawshank Redemption" },

  { text: "I'm gonna make him an offer he can't refuse.", source: "The Godfather" },
  { text: "Never hate your enemies. It affects your judgment.", source: "The Godfather Part II" },

  { text: "Why so serious?", source: "The Dark Knight" },
  { text: "You either die a hero, or live long enough to see yourself become the villain.", source: "The Dark Knight" },

  { text: "The first rule of Fight Club is: you do not talk about Fight Club.", source: "Fight Club" },

  { text: "You mustn't be afraid to dream a little bigger, darling.", source: "Inception" },

  { text: "There is no spoon.", source: "The Matrix" },
  { text: "Welcome to the real world.", source: "The Matrix" },

  { text: "Which would be worse: to live as a monster, or to die as a good man?", source: "Shutter Island" },

  // TV Shows / Web Series
  { text: "Yeah, science!", source: "Breaking Bad" },
  { text: "Tread lightly.", source: "Breaking Bad" },
  { text: "I did it for me. I liked it.", source: "Breaking Bad" },

  { text: "All the pieces matter.", source: "The Wire" },

  { text: "I'm not a psychopath, I'm a high-functioning sociopath.", source: "Sherlock" },

  { text: "It's all good, man.", source: "Better Call Saul" },
  { text: "I travel in worlds you can't even imagine.", source: "Better Call Saul" },
  { text: "There is proving, and then there is knowing.", source: "Better Call Saul" },
  { text: "You can make it not so easy.", source: "Better Call Saul" },
  { text: "I am the guy who gets it done.", source: "Better Call Saul" },
  { text: "If you are committed enough, you can make any story work.", source: "Better Call Saul" },

  { text: "Tonight's the night.", source: "Dexter" },
  { text: "Blood never lies.", source: "Dexter" },
  { text: "Monsters don't get to live happily ever after.", source: "Dexter" },
  { text: "We all have something to hide.", source: "Dexter" },
  { text: "Darkness isn't a place, it's a state of mind.", source: "Dexter" },

  { text: "We were on a break!", source: "Friends" },
  { text: "How you doin'?", source: "Friends" },

  { text: "Do you even know how smart I am in Spanish?", source: "Modern Family" },
  { text: "Success is 1% inspiration, 98% perspiration, and 2% attention to detail.", source: "Modern Family" },
  { text: "The most amazing things that can happen to a human being will happen to you if you just lower your expectations.", source: "Modern Family" },
  { text: "Sometimes you have to take a leap of faith.", source: "Modern Family" },
  { text: "Watch a sunrise at least once a day.", source: "Modern Family (Phil Dunphy)" },
  { text: "You can learn a lot about someone by how they handle these three things: a rainy day, lost luggage, and tangled Christmas lights.", source: "Modern Family (Phil Dunphy)" },
  { text: "When life gives you lemonade, make lemons. Life will be all like, what?!", source: "Modern Family (Phil Dunphy)" },

  { text: "I do not have dreams, I have goals.", source: "Suits" },
  { text: "Winners do not make excuses when the other side plays the game.", source: "Suits" },
  { text: "Anyone can do my job, but no one can be me.", source: "Suits" },
  { text: "I refuse to answer that on the grounds that I do not want to.", source: "Suits" },
  { text: "You want to lose small, I want to win big.", source: "Suits" },

  { text: "That's what she said.", source: "The Office" },

  { text: "The truth will set you free, but first it will piss you off.", source: "13 Reasons Why" },

  // Stand-up comedy inspired vibes (original-style lines)
  { text: "Life is basically debugging your own decisions.", source: "Stand-up Inspired" },
  { text: "Confidence is just acting like you know what you're doing.", source: "Stand-up Inspired" },
  { text: "Everyone has a plan until life updates the terms and conditions.", source: "Stand-up Inspired" },
  { text: "Overthinking: the art of solving problems you don’t have yet.", source: "Stand-up Inspired" }
];

const Footer = () => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * footerQuotes.length));
  }, []);

  const quote = footerQuotes[quoteIdx];

  return (
    <footer className="border-t border-border py-8 sm:py-10 bg-card/10 mt-auto shrink-0">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Quote Section */}
        <div className="flex flex-col items-center justify-center text-center mb-8 px-4 opacity-80 hover:opacity-100 transition-opacity">
          <p className="font-body text-sm sm:text-base text-foreground/80 italic mb-2 max-w-2xl">
            "{quote.text}"
          </p>
          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">
            — {quote.source}
          </p>
        </div>

        {/* Separator */}
        <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary" />
            <span className="font-heading font-bold text-sm uppercase tracking-widest">CSClash</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/about" className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">About</Link>
            <Link to="/rules" className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">Rules</Link>
            <Link to="/privacy" className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">Privacy</Link>
            <a href="https://github.com/sherlock-hashed" target="_blank" rel="noreferrer" className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">GitHub</a>
          </nav>

          <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/50 uppercase tracking-widest text-center">
            Built for devs. Powered by competition.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
