import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, Users, Trophy, MessageCircle, LogIn, LogOut, User, Calendar } from "lucide-react";
import logo from "@/assets/paddleup-logo.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PaddleUp Manipal logo" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-heading text-lg font-bold text-gradient-brand hidden sm:inline">
              Paddle Up Manipal
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {!loading && (
              user ? (
                <div className="flex items-center gap-1">
                  {profile && (
                    <Link to={`/player/${profile.username}`}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <User className="h-3.5 w-3.5" /> {profile.display_name}
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <LogIn className="h-3.5 w-3.5" /> Login
                  </Button>
                </Link>
              )
            )}
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="animate-fade-in space-y-6 max-w-md">
          <img src={logo} alt="PaddleUp Manipal" className="mx-auto h-32 w-32 rounded-2xl shadow-lg object-cover" />
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
            Now Open — Book Your Court!
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold leading-tight text-foreground">
            Smash, Dink & <span className="text-gradient-brand">Dominate</span>
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Manipal's premium pickleball courts. 3 courts, open 8 AM – 10 PM daily.
            Book your slot instantly!
          </p>

          {/* Pricing badges */}
          <div className="flex gap-3 justify-center flex-wrap">
            <div className="flex items-center gap-2 bg-offpeak/10 text-offpeak rounded-lg px-3 py-2 text-sm font-semibold">
              ☀️ Off-Peak ₹600/hr
            </div>
            <div className="flex items-center gap-2 bg-peak/10 text-peak rounded-lg px-3 py-2 text-sm font-semibold">
              🌅 Peak ₹800/hr
            </div>
          </div>

          <Link to="/book">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl shadow-lg mt-2">
              Book a Court Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Community section */}
      <section className="container pb-6 max-w-md mx-auto px-4">
        <h3 className="font-heading font-bold text-foreground text-center mb-3">Community</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/find-players">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm text-foreground">Rooms</p>
                <p className="text-[10px] text-muted-foreground">Join open games</p>
              </div>
            </div>
          </Link>
          <Link to="/community">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">Players</p>
                <p className="text-[10px] text-muted-foreground">Find & follow</p>
              </div>
            </div>
          </Link>
          {user && (
            <Link to="/my-bookings">
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
                <Calendar className="h-5 w-5 text-offpeak" />
                <div>
                  <p className="font-semibold text-sm text-foreground">My Bookings</p>
                  <p className="text-[10px] text-muted-foreground">Track status</p>
                </div>
              </div>
            </Link>
          )}
          <Link to="/leaderboard">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <Trophy className="h-5 w-5 text-peak" />
              <div>
                <p className="font-semibold text-sm text-foreground">Leaderboard</p>
                <p className="text-[10px] text-muted-foreground">Top ranked</p>
              </div>
            </div>
          </Link>
          <Link to="/tournaments">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <Trophy className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-sm text-foreground">Tournaments</p>
                <p className="text-[10px] text-muted-foreground">Compete & win</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Info cards */}
      <section className="container pb-12 space-y-3 max-w-md mx-auto px-4">
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">Location</p>
                <p className="text-xs text-muted-foreground">PaddleUp Manipal, Karnataka</p>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/5qHaVkp92qcTHf3g8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary underline"
            >
              Open ↗
            </a>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3882.03654459489!2d74.77728207447888!3d13.348002906515415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbcbbf5ca7f49a1%3A0x7d80eee71ed53a41!2sPaddleUp%20Manipal!5e0!3m2!1sen!2sin!4v1784494031224!5m2!1sen!2sin"
            width="100%"
            height="220"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="PaddleUp Manipal location"
          />
        </div>
        <InfoCard icon={<Clock className="h-5 w-5 text-accent" />} title="Hours" description="8:00 AM – 10:00 PM, Every Day" />
        <a href="https://www.instagram.com/paddleup.manipal" target="_blank" rel="noopener noreferrer" className="block">
          <InfoCard icon={<Phone className="h-5 w-5 text-destructive" />} title="Contact" description="DM us on Instagram @paddleup.manipal ↗" />
        </a>

      </section>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground space-y-2">
        <div className="flex justify-center gap-4">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
        <div>© 2026 PaddleUp Manipal. All rights reserved.</div>
      </footer>
    </div>
  );
};

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
      {icon}
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default LandingPage;
