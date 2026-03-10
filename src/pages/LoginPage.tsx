import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const LoginPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [usernameForm, setUsernameForm] = useState({ username: "", password: "" });
  const [phoneForm, setPhoneForm] = useState({ phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: emailForm.email,
          password: emailForm.password,
        });
        if (error) throw error;
        toast.success("Account created! Setting up your profile...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailForm.email,
          password: emailForm.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUsernameLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameForm.username || !usernameForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("get_email_by_username", {
        p_username: usernameForm.username.toLowerCase().trim(),
      });
      if (error || !data) {
        toast.error("Username not found");
        setSubmitting(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data as string,
        password: usernameForm.password,
      });
      if (signInError) throw signInError;
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneForm.phone || !phoneForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("get_email_by_phone", {
        p_phone: phoneForm.phone.trim(),
      });
      if (error || !data) {
        toast.error("Phone number not found. Please sign up first.");
        setSubmitting(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data as string,
        password: phoneForm.password,
      });
      if (signInError) throw signInError;
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
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
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-extrabold text-gradient-brand">🏓 Paddle Up</h1>
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
            <span>or use credentials</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
              <TabsTrigger value="username" className="text-xs">Username</TabsTrigger>
              <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-3">
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" placeholder="you@email.com" value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-password" className="text-xs">Password</Label>
                  <Input id="email-password" type="password" placeholder="••••••••" value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
                </Button>
                <button type="button" onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="username" className="mt-3">
              <form onSubmit={handleUsernameLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs">Username</Label>
                  <Input id="username" placeholder="smashking42" value={usernameForm.username}
                    onChange={(e) => setUsernameForm({ ...usernameForm, username: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username-password" className="text-xs">Password</Label>
                  <Input id="username-password" type="password" placeholder="••••••••" value={usernameForm.password}
                    onChange={(e) => setUsernameForm({ ...usernameForm, password: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Please wait..." : "Log In"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Set your password in profile setup after first login
                </p>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-3">
              <form onSubmit={handlePhoneLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="9876543210" value={phoneForm.phone}
                    onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone-password" className="text-xs">Password</Label>
                  <Input id="phone-password" type="password" placeholder="••••••••" value={phoneForm.password}
                    onChange={(e) => setPhoneForm({ ...phoneForm, password: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Please wait..." : "Log In"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Set your password in profile setup after first login
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
