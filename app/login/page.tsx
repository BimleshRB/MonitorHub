'use client';

import React from "react"

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const user = data.user;
      sessionStorage.setItem('user', JSON.stringify(user));

      const destination = user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      window.location.href = destination;
    } catch (err) {
      setError('Unable to sign in right now');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      {/* Back to Home Link */}
      <Link href="/" className="absolute top-4 left-4 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
        ← Back to Home
      </Link>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 w-fit">
              <h1 className="text-4xl font-bold text-foreground">MonitorHub</h1>
            </Link>
            <p className="text-lg text-muted-foreground">AI-Powered Website Health Monitoring</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Real-time Monitoring</p>
                  <p className="text-sm text-muted-foreground">Track your websites 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">AI Insights</p>
                  <p className="text-sm text-muted-foreground">Understand issues with AI analysis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Instant Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified immediately</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-secondary/50 border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-secondary/50 border-border/50"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or</span>
                </div>
              </div>

              <Link href="/forgot-password" className="text-sm text-accent hover:text-accent/80 transition-colors">
                Forgot password?
              </Link>

              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent hover:text-accent/80 transition-colors font-semibold">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
