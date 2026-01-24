'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Activity, AlertTriangle, BarChart3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">MonitorHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-base">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-base">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-balance leading-tight">
              Real-time Website{' '}
              <span className="text-primary">Monitoring</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed font-light">
              Keep your websites online 24/7 with AI-powered monitoring, instant alerts, and comprehensive insights. Enterprise-grade uptime tracking made simple.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base h-12 px-8">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="pt-16 grid grid-cols-3 gap-12 text-center">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground font-medium">Uptime SLA</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary">15 sec</div>
              <div className="text-sm text-muted-foreground font-medium">Check Interval</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary">Instant</div>
              <div className="text-sm text-muted-foreground font-medium">Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12 bg-card border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Powerful Features</h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">Everything you need to keep your websites running smoothly</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Real-time Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Monitor your websites every 15 seconds from multiple locations worldwide.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Instant Alerts</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Get notified immediately when downtime is detected via email, SMS, and webhooks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Detailed Analytics</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Track response times, performance metrics, and trends with interactive dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">AI-Powered Insights</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Get intelligent recommendations to optimize your website performance and uptime.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Status Pages</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Share beautiful status pages with your customers to show real-time system status.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-md border border-border/60 bg-background hover:border-primary/60 hover:bg-secondary transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Incident Management</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Track, analyze, and resolve incidents with comprehensive audit logs and reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">How It Works</h2>
            <p className="text-xl text-muted-foreground font-light">Get started in minutes with a simple setup process</p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-lg border border-primary/30">
                1
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-semibold mb-3">Add Your Website</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Simply enter your website URL and we'll start monitoring it immediately from multiple locations worldwide.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-lg border border-primary/30">
                2
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-semibold mb-3">Get Real-time Updates</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Watch your dashboards in real-time as we check your website every 15 seconds for optimal performance monitoring.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-lg border border-primary/30">
                3
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-semibold mb-3">Receive Instant Alerts</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Get notified immediately when issues are detected so you can respond quickly and minimize downtime.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-lg border border-primary/30">
                4
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-semibold mb-3">Analyze & Optimize</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Use detailed reports and AI insights to identify patterns and optimize your website for better uptime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12 bg-card border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">Start free, upgrade when you scale. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="p-10 rounded-md border border-border/60 bg-background hover:border-border transition-colors">
              <h3 className="text-2xl font-semibold mb-3">Starter</h3>
              <div className="mb-8">
                <div className="text-5xl font-bold">$0</div>
                <p className="text-muted-foreground mt-2">Forever free</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">5 monitors</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">1 minute interval</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">Email alerts</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">30-day history</span>
                </li>
              </ul>
              <Link href="/signup" className="w-full block">
                <Button variant="outline" className="w-full h-11 bg-transparent">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="p-10 rounded-md border-2 border-primary/60 bg-background relative shadow-lg shadow-primary/10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-background px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-semibold mb-3">Professional</h3>
              <div className="mb-8">
                <div className="text-5xl font-bold">$29</div>
                <p className="text-muted-foreground mt-2">/month</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">50 monitors</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">15 second interval</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">SMS & Slack alerts</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">1-year history</span>
                </li>
              </ul>
              <Link href="/signup" className="w-full block">
                <Button className="w-full h-11">Get Started</Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-10 rounded-md border border-border/60 bg-background hover:border-border transition-colors">
              <h3 className="text-2xl font-semibold mb-3">Enterprise</h3>
              <div className="mb-8">
                <div className="text-5xl font-bold">Custom</div>
                <p className="text-muted-foreground mt-2">Contact us</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">Unlimited monitors</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">Custom intervals</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">Webhook integrations</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">24/7 support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full h-11 bg-transparent" disabled>
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground font-light">
              Join thousands of teams monitoring their websites with MonitorHub.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base h-12 px-8">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">MonitorHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MonitorHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
