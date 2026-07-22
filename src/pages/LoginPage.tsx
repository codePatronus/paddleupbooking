import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // email, username, or phone
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sign-up state
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    display_name: "",
    phone: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!loading && user) {
      navigate(profile ? "/" : "/setup-profile");
    }
  }, [user, profile, loading, navigate]);

  async function handleGoogleLogin() {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    }
  }

  function detectIdentifierType(val: string): "email" | "phone" | "username" {
    if (val.includes("@")) return "email";
    if (/^\d{10}$/.test(val)) return "phone";
    return "username";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      toast.error("Please enter your credentials");
      return;
    }
    setSubmitting(true);
    try {
      const type = detectIdentifierType(trimmed);
      let email = trimmed;

      if (type === "username") {
        const { data, error } = await supabase.rpc("get_email_by_username", {
          p_username: trimmed.toLowerCase(),
        });
        if (error || !data) {
          toast.error("Account not found. Please sign up first.");
          setSubmitting(false);
          return;
        }
        email = data as string;
      } else if (type === "phone") {
        const { data, error } = await supabase.rpc("get_email_by_phone", {
          p_phone: trimmed,
        });
        if (error || !data) {
          toast.error("Account not found. Please sign up first.");
          setSubmitting(false);
          return;
        }
        email = data as string;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      toast.success("Welcome back!");
    } catch (err: any) {
      if (err.message?.includes("Invalid login")) {
        toast.error("Invalid credentials. Check your password.");
      } else {
        toast.error(err.message || "Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const { display_name, phone, username, email, password: pw } = signUpForm;

    if (!display_name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Valid 10-digit phone number is required");
      return;
    }
    const uname = username.trim().toLowerCase();
    if (!uname || !/^[a-z0-9_]{3,20}$/.test(uname)) {
      toast.error("Username: 3-20 chars, letters, numbers & underscores only");
      return;
    }
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      // Use a generated email if none provided
      const signUpEmail = email.trim() || `${uname}@paddleup.local`;

      const { error: authError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: pw,
      });
      if (authError) {
        if (authError.message?.includes("already registered")) {
          toast.error("An account with this email already exists. Please log in.");
        } else {
          throw authError;
        }
        return;
      }

      // Wait for session to be set, then create profile
      // The auth state change will trigger profile creation redirect to setup-profile
      // But we can try to create the profile directly here
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: sessionData.session.user.id,
          username: uname,
          display_name: display_name.trim(),
          phone: phone.trim(),
        }, { onConflict: "id" });

        if (profileError) {
          if (profileError.code === "23505") {
            if (profileError.message.includes("phone")) {
              toast.error("This phone number is already linked to another account!");
            } else if (profileError.message.includes("username")) {
              toast.error("Username already taken!");
            } else {
              toast.error("Account conflict: " + profileError.message);
            }
            return;
          }
          console.error("Profile creation error:", profileError);
        }
      }

      toast.success("Account created! Welcome to Paddle Up! 🏓");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <img src="/paddleup-logo.jpg" alt="PaddleUp Manipal" className="mx-auto h-24 w-24 rounded-2xl shadow-md object-cover" />
          <h1 className="font-heading text-3xl font-extrabold text-gradient-brand">Paddle Up Manipal</h1>
          <p className="text-muted-foreground">Manipal's Pickleball Community</p>
        </div>

        <div className="bg-card border rounded-2xl p-5 space-y-4">
          {/* Google OAuth */}
          <Button onClick={handleGoogleLogin} size="lg" className="w-full py-5 text-base gap-2" variant="outline">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {!showSignUp ? (
            /* ===== LOGIN FORM ===== */
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="identifier" className="text-xs">Email, Username, or Phone</Label>
                <Input
                  id="identifier"
                  placeholder="you@email.com / username / 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Logging in..." : "Log In"}
              </Button>
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Don't have an account? <span className="font-semibold text-primary">Sign up</span>
              </button>
            </form>
          ) : (
            /* ===== SIGN UP FORM ===== */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="su-name" className="text-xs">Display Name *</Label>
                <Input
                  id="su-name"
                  placeholder="Your name"
                  value={signUpForm.display_name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, display_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="su-phone" className="text-xs">Phone Number *</Label>
                <Input
                  id="su-phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={signUpForm.phone}
                  onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="su-username" className="text-xs">Username *</Label>
                <Input
                  id="su-username"
                  placeholder="e.g. smashking42"
                  value={signUpForm.username}
                  onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
                  required
                />
                <p className="text-[10px] text-muted-foreground">3-20 chars, shown on your public profile</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="su-email" className="text-xs">Email (optional)</Label>
                <Input
                  id="su-email"
                  type="email"
                  placeholder="you@email.com"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="su-password" className="text-xs">Password *</Label>
                <Input
                  id="su-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
              <button
                type="button"
                onClick={() => setShowSignUp(false)}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account? <span className="font-semibold text-primary">Log in</span>
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
