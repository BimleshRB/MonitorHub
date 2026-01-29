'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  Cpu,
  Gauge,
  Globe2,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'

const featureGrid = [
  {
    title: 'Signal Mesh Monitoring',
    description: 'Parallel probes from global regions triangulate uptime with millisecond precision.',
    icon: Globe2,
  },
  {
    title: 'AI Incident Narratives',
    description: 'Auto-generated root-cause timelines with recommended fixes and severity scoring.',
    icon: Sparkles,
  },
  {
    title: 'Latency Heatmaps',
    description: 'Visualize regional slowdowns before they impact customers or conversions.',
    icon: Gauge,
  },
  {
    title: 'Runbook Automation',
    description: 'Trigger smart alerts, playbooks, and escalation paths in seconds.',
    icon: BellRing,
  },
  {
    title: 'Audit-Ready Logs',
    description: 'Immutable incident trails with compliance-ready exports and annotations.',
    icon: ShieldCheck,
  },
  {
    title: 'Performance DNA',
    description: 'Track the signature of every release with advanced performance deltas.',
    icon: BarChart3,
  },
]

const experienceSteps = [
  {
    title: 'Connect your endpoints',
    detail: 'Add your URLs or APIs in under a minute with smart URL validation and tagging.',
  },
  {
    title: 'Watch the pulse',
    detail: 'Live dashboards reveal latency spikes and response anomalies across regions.',
  },
  {
    title: 'Act before customers notice',
    detail: 'Instant alerts and AI analysis let you resolve issues before they escalate.',
  },
]

const testimonials = [
  {
    quote: 'The Signal Mesh view is unreal. We caught a regional outage 7 minutes before social blew up.',
    name: 'Priya Nair',
    role: 'Head of Reliability, Cartly',
  },
  {
    quote: 'MonitorHub turned our incident response into a story, not a scramble. Teams love the clarity.',
    name: 'Marcus Reed',
    role: 'VP Engineering, Lattice Labs',
  },
  {
    quote: 'We went from reactive to proactive. The AI narratives read like a postmortem in real time.',
    name: 'Eloise Kim',
    role: 'SRE Lead, NovaBank',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-32 h-72 w-72 rounded-full bg-secondary/40 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-primary/10 blur-[160px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">MonitorHub</span>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border border-border/60 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Signal Mesh
            </span>
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

      <section className="pt-36 pb-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                             linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 10%, transparent 70%)',
            opacity: 0.3
          }} />
        </div>

        {/* Floating orbs animation */}
        <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} />
        <div className="absolute top-40 right-[15%] w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '4s'}} />
        <div className="absolute top-60 left-[20%] w-1 h-1 rounded-full bg-primary/40 animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}} />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
          <div className="space-y-10 relative z-10">
            {/* Badge with glow effect */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 backdrop-blur-sm px-5 py-2 text-sm text-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow duration-300">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="font-medium">AI-driven uptime intelligence</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                The only monitoring stack that{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-pulse" style={{animationDuration: '4s'}}>
                  reads your uptime
                </span>{' '}
                like a story.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                MonitorHub layers{' '}
                <span className="text-foreground font-semibold">global probes</span>,{' '}
                <span className="text-foreground font-semibold">AI incident context</span>, and{' '}
                <span className="text-foreground font-semibold">real-time response timelines</span>{' '}
                into a single, living narrative—so your team can act before customers notice.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                  Launch your first monitor <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent backdrop-blur-sm border-border/60 hover:bg-accent/50 transition-all duration-300 hover:border-primary/50">
                  Explore live demo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-4">
              <div className="space-y-2 group cursor-default">
                <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
                  99.98%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Historical uptime</div>
                <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
              <div className="space-y-2 group cursor-default">
                <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
                  12s
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Fastest detection</div>
                <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
              <div className="space-y-2 group cursor-default">
                <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
                  24/7
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">AI incident watch</div>
                <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-2xl group-hover:border-primary/40 transition-all duration-500">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                <span className="uppercase tracking-[0.2em] font-medium">Signal Mesh</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-semibold">Live</span>
                </div>
              </div>
              <div className="space-y-3">{[
                  { name: 'storefront.app', status: 'Healthy', latency: '86ms', icon: Activity, color: 'emerald' },
                  { name: 'payments.api', status: 'Degraded', latency: '420ms', icon: AlertTriangle, color: 'amber' },
                  { name: 'edge.gateway', status: 'Healthy', latency: '63ms', icon: Cpu, color: 'emerald' },
                ].map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 hover:bg-accent/30 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    style={{animationDelay: `${idx * 100}ms`}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'} flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${item.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className={`text-xs font-medium ${item.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.latency}</p>
                      <p className="text-xs text-muted-foreground">p95</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">AI Incident Insight</p>
                    <p className="text-muted-foreground">
                      Elevated latency in eu-west correlates with cache invalidation. Recommend rolling warmup.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-6 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-xs text-muted-foreground shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  SOC2-ready audit trail
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12 border-t border-border/40 bg-card/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">A monitoring cockpit built like an ops studio.</h2>
            <p className="text-lg text-muted-foreground">
              The Signal Mesh blends availability, latency, and incident narratives into one canvas. No tab-hopping. No context loss.
            </p>
            <div className="grid gap-4">
              {experienceSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 items-start rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-border/60 bg-background/80 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">Incident Timeline</p>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start justify-between">
                  <span>02:04 UTC — TLS negotiation spike</span>
                  <span className="text-primary">+120ms</span>
                </div>
                <div className="flex items-start justify-between">
                  <span>02:06 UTC — Edge cache reset</span>
                  <span className="text-primary">Recovered</span>
                </div>
                <div className="flex items-start justify-between">
                  <span>02:08 UTC — AI recommendation applied</span>
                  <span className="text-primary">Stable</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Operations Score</p>
              <div className="mt-4 flex items-center gap-6">
                <div className="text-5xl font-semibold">92</div>
                <div className="text-sm text-muted-foreground">
                  +6 points this week
                  <div className="mt-2 flex items-center gap-1 text-primary">
                    <Star className="w-4 h-4" />
                    Top 5% uptime teams
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Capabilities</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Built to outperform generic uptime tools.</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every surface is designed to reduce noise, amplify signal, and keep your team ahead of incidents.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureGrid.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-border/60 bg-background/70 hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12 border-t border-border/40 bg-card/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Precision alerts, calm operations.</h2>
            <p className="text-lg text-muted-foreground">
              Reduce alert fatigue with contextual triggers and AI summaries. Only the right people get the right signal at the right moment.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              {[
                'Smart suppression to avoid alert storms',
                'Role-based routing for on-call teams',
                'Incident summaries delivered to Slack and email',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <span className="font-semibold">Incident #4821</span>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Resolved</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sudden spike in latency tied to CDN cache purge. Recovery detected within 2 minutes.
            </p>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Impact window</span>
                <span className="text-foreground">2m 12s</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Suggested fix</span>
                <span className="text-foreground">Warm cache rollout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Loved by reliability teams.</h2>
            <p className="text-lg text-muted-foreground">Teams scaling from 10 to 10,000 endpoints trust MonitorHub.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl border border-border/60 bg-background/70">
                <p className="text-sm text-muted-foreground leading-relaxed">“{testimonial.quote}”</p>
                <div className="mt-6 flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-card/40 border-t border-border/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Pricing that flexes with your reliability goals.</h2>
            <p className="text-lg text-muted-foreground">
              Start free, scale as you grow. Every plan includes AI insight summaries and the Signal Mesh dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-background/80">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Starter</p>
              <div className="mt-4 text-4xl font-semibold">$0</div>
              <p className="text-sm text-muted-foreground">5 monitors · Email alerts · 30-day history</p>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full bg-transparent">Get Started</Button>
              </Link>
            </div>
            <div className="p-6 rounded-2xl border-2 border-primary/60 bg-background/90 shadow-lg shadow-primary/10">
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Studio</p>
              <div className="mt-4 text-4xl font-semibold">$29</div>
              <p className="text-sm text-muted-foreground">50 monitors · 15s checks · Slack + SMS</p>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Upgrade to Studio</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-secondary/20 p-10 text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Give your uptime a voice.</h2>
            <p className="text-lg text-muted-foreground">
              Start monitoring in minutes and get the AI context your team has been missing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base h-12 px-8">
                Start monitoring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent">
                View dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-lg">MonitorHub</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 MonitorHub. All rights reserved.</p>
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
