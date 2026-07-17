"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10 bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center justify-center p-3 bg-black text-white rounded-xl mb-8 hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">Sign in to your account</h1>
            <p className="text-gray-500 text-lg">Welcome back! Please enter your details.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
                <div className="w-1.5 h-full bg-red-500 rounded-full" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-gray-700 group-focus-within:text-black transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 group-focus-within:text-black transition-colors">Password</label>
                <Link href="#" className="text-sm font-medium text-gray-500 hover:text-black hover:underline underline-offset-4 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-sm sm:text-base font-medium tracking-wider"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-xl text-base font-bold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="font-bold text-black hover:underline underline-offset-4">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - E-commerce Visual */}
      <div className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden">
        {/* Placeholder for an aesthetic e-commerce image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1470&auto=format&fit=crop" 
            alt="E-commerce shopping" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Glassmorphism Card Overlay */}
        <div className="absolute bottom-12 left-12 right-12 z-10 p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Discover Premium Quality
          </h2>
          <p className="text-white/90 text-base leading-relaxed max-w-md">
            Shop the latest trends and exclusive collections. Sign in to access your wishlist, track orders, and unlock member-only benefits.
          </p>
        </div>
      </div>
    </div>
  );
}
