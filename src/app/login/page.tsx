"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight">Welcome Back</h1>
          <p className="text-primary-foreground/80 mt-2 text-sm">Sign in to manage your store</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="admin@aura.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-lg text-md shadow-lg shadow-primary/25">
              {loading ? "Signing in..." : (
                <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
