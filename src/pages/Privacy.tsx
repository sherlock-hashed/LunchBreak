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

        <div className="border border-border bg-card p-6 sm:p-10 text-left space-y-8">
          
          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">1. Information We Collect</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We collect minimal information required to provide you with the best experience on CSClash. This includes your name, username, email address, optional profile details (like your college and social links), and your match statistics (such as game history, ratings, and accuracy). If you authenticate using Google, we collect your basic profile information from your Google account.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">2. How We Use Your Information</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground text-sm sm:text-base space-y-1">
              <li>Manage your account and authentication securely.</li>
              <li>Provide accurate matchmaking and global leaderboards.</li>
              <li>Track your performance, compute Elo ratings, and create statistical insights.</li>
              <li>Display your public profile and game history to other players.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">3. Data Security</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We take the security of your data seriously. All passwords are cryptographically hashed using industry-standard bcrypt before being stored in our database. We utilize secure, HTTP-only JSON Web Tokens (JWT) for session management to protect against cross-site scripting (XSS) attacks. Furthermore, our platform runs entirely over HTTPS, ensuring your data is encrypted in transit. We do not store plain-text passwords under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">4. Cookies and Tracking</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              CSClash uses strictly necessary cookies solely for the purpose of authentication and session preservation. We do not use third-party advertising or tracking cookies to track your behavior across other sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">5. Data Sharing</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We do not sell, trade, or otherwise exploit your personal data to outside parties. Your username, avatar, college, and gameplay statistics are visible to other users as part of the public leaderboard and profile pages. 
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-3 text-primary">6. Your Rights</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              You have the right to access and update your profile information at any time via your account settings. If you wish to permanently delete your account and associated data from our systems, please contact the administrators.
            </p>
          </section>

          <div className="pt-4 border-t border-border mt-8">
            <p className="text-sm text-muted-foreground italic">
              Last Updated: March 2026
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
