import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SetupProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    phone: "",
    password: "",
    skill_level: "beginner" as "beginner" | "intermediate" | "advanced",
    gender: "prefer_not_to_say",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const username = form.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      toast.error("Username: 3-20 chars, only letters, numbers, underscores");
      return;
    }
    if (!form.display_name.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error("A valid 10-digit phone number is required");
      return;
    }

    setLoading(true);
    try {
      // Set password if provided (for Google OAuth users who want username/phone login later)
      if (form.password.trim().length >= 6) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: form.password.trim(),
        });
        if (pwError) {
          console.error("Password set error:", pwError);
          // Non-blocking — continue with profile creation
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || null,
        skill_level: form.skill_level,
        gender: form.gender,
      }, { onConflict: "id" });

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("phone")) {
            toast.error("This phone number is already linked to another account!");
          } else {
            toast.error("Username already taken!");
          }
        } else {
          toast.error("Failed to create profile: " + error.message);
          console.error("Profile creation error:", error);
        }
        setLoading(false);
        return;
      }

      await refreshProfile();
      toast.success("Welcome to Paddle Up! 🏓");
      navigate("/");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-gradient-brand">Set Up Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose your identity on Paddle Up</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" placeholder="e.g. smashking42" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <p className="text-[11px] text-muted-foreground">3-20 chars, letters, numbers & underscores</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input id="display_name" placeholder="Your name" value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="10-digit phone number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <p className="text-[11px] text-muted-foreground">Used for phone+password login</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Set Password (optional)</Label>
            <Input id="password" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="text-[11px] text-muted-foreground">Lets you log in with username or phone + password</p>
          </div>

          <div className="space-y-2">
            <Label>Skill Level</Label>
            <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v as typeof form.skill_level })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🟢 Beginner</SelectItem>
                <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                <SelectItem value="advanced">🔴 Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gender (optional)</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Profile 🏓"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfilePage;
