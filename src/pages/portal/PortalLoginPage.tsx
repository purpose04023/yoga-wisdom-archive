import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

const PortalLoginPage = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await signIn(email.trim(), password);
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-gradient-to-br from-background via-muted/40 to-background">
        <div className="w-full max-w-md">
          <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-premium p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Sanctum</p>
              <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to manage the wisdom archive.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@wisdomarchive.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-gold hover:opacity-90 text-primary-foreground border-0 shadow-gold"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Access is by invitation only. Contact an existing curator for an account.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PortalLoginPage;
