import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, Users, Trophy, UserPlus, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-heading text-xl font-bold text-gradient-brand">
            🏓 Paddle Up Manipal
          </h1>
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
          <Link to="/community">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm text-foreground">Players</p>
                <p className="text-[10px] text-muted-foreground">Find & follow</p>
              </div>
            </div>
          </Link>
          <Link to="/find-players">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:bg-secondary/50 transition-colors">
              <UserPlus className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">My Rooms</p>
                <p className="text-[10px] text-muted-foreground">Booked chats</p>
              </div>
            </div>
          </Link>
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
              <Trophy className="h-5 w-5 text-court-red" />
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
        <InfoCard icon={<MapPin className="h-5 w-5 text-primary" />} title="Location" description="Manipal, Karnataka" />
        <InfoCard icon={<Clock className="h-5 w-5 text-accent" />} title="Hours" description="8:00 AM – 10:00 PM, Every Day" />
        <InfoCard icon={<Phone className="h-5 w-5 text-court-red" />} title="Contact" description="DM us on Instagram @paddleupmanipal" />
      </section>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 Paddle Up Manipal. All rights reserved.
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
