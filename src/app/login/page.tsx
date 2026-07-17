"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
        window.location.href = "/login";
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-elegant-sans">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-serif">Welcome Back.</h1>
            <p className="text-muted-foreground text-lg">Sign in to manage your premium store.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-full bg-destructive rounded-full" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-muted bg-transparent focus:border-primary focus:ring-0 outline-none transition-all duration-300 text-base"
                  placeholder="admin@ZS Decor.com"
                />
              </div>
            </div>
            
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Password</label>
                <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-muted bg-transparent focus:border-primary focus:ring-0 outline-none transition-all duration-300 text-base font-medium tracking-wider"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 rounded-xl text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center justify-center">
                {loading ? "Authenticating..." : (
                  <>Sign In <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" /></>
                )}
              </span>
            </Button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              Secured by advanced encryption.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Visual */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 opacity-40" />
        </div>
        
        {/* Glassmorphism Card */}
        <div className="relative z-10 max-w-lg p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-150">
          <Sparkles className="w-10 h-10 text-primary mb-6" />
          <h2 className="text-4xl font-serif text-white font-bold leading-tight mb-4">
            Manage your empire with precision.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            The all-in-one powerful dashboard for processing orders, analyzing customer behavior, and scaling your premium storefront.
          </p>
          
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-950">1</div>
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-950">2</div>
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-950">3</div>
            </div>
            <div className="text-sm text-white/60 font-medium">
              Join thousands of top vendors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
