'use client'

import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, AlertTriangle, BarChart2, Clock3, Download, Lightbulb, RefreshCw, ShieldCheck } from 'lucide-react'
import { useAuthCheck } from '@/hooks/use-auth-check'

type MonitorItem = {
  id: string
  name: string
  url: string
  status: 'up' | 'down'
}

type IncidentItem = {
  id: string
  monitorName: string
  startedAt: Date | null
  resolvedAt: Date | null
  durationSeconds: number
  status: 'resolved' | 'ongoing'
  aiExplanation?: string | null
}

const toLocale = (value: Date | null) => (value ? value.toLocaleString() : 'Unknown')

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuthCheck()
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [monRes, incRes] = await Promise.all([
        fetch('/api/monitors', { cache: 'no-store' }),
        fetch('/api/incidents', { cache: 'no-store' }),
      ])

      if (!monRes.ok) throw new Error('Unable to load monitors')
      if (!incRes.ok) throw new Error('Unable to load incidents')

      const monData = await monRes.json()
      const incData = await incRes.json()

      setMonitors(
        (monData.monitors || []).map((m: any) => ({
          id: m._id,
          name: m.name,
          url: m.url,
          status: m.status === 'DOWN' ? 'down' : 'up',
        }))
      )

      setIncidents(
        (incData.incidents || []).map((i: any) => {
          const started = i.startedAt ? new Date(i.startedAt) : null
          const resolved = i.resolvedAt ? new Date(i.resolvedAt) : null
          const computedDuration = resolved && started ? Math.max(0, (resolved.getTime() - started.getTime()) / 1000) : 0

          return {
            id: i._id,
            monitorName: i.monitorId?.name || i.monitorId?.url || 'Monitor',
            startedAt: started,
            resolvedAt: resolved,
            durationSeconds: typeof i.durationSeconds === 'number' ? i.durationSeconds : computedDuration,
            status: resolved ? 'resolved' : 'ongoing',
            aiExplanation: i.aiExplanation,
          }
        })
      )

      setError('')
    } catch (err: any) {
      setError(err?.message || 'Unable to load reports data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    }
  }, [authLoading, user])

  const exportData = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      monitors,
      incidents: incidents.map((i) => ({
        ...i,
        startedAt: i.startedAt?.toISOString() || null,
        resolvedAt: i.resolvedAt?.toISOString() || null,
      })),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'monitor-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const weekAgo = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), [])

  const weekIncidents = useMemo(
    () => incidents.filter((i) => !i.startedAt || i.startedAt >= weekAgo),
    [incidents, weekAgo]
  )

  const derived = useMemo(() => {
    const resolved = weekIncidents.filter((i) => i.status === 'resolved')
    const ongoing = weekIncidents.filter((i) => i.status === 'ongoing')

    const downtimeMinutes = resolved.reduce((acc, i) => acc + i.durationSeconds / 60, 0)
    const avgResolution = resolved.length ? downtimeMinutes / resolved.length : 0

    const perMonitor: Record<string, number> = {}
    weekIncidents.forEach((i) => {
      perMonitor[i.monitorName] = (perMonitor[i.monitorName] || 0) + 1
    })
    const mostImpacted = Object.entries(perMonitor).sort((a, b) => b[1] - a[1])[0]

    const uptimeDenominator = monitors.length ? monitors.length * 7 * 24 * 60 : 0
    const uptime = uptimeDenominator
      ? Math.max(0, Math.min(100, 100 - (downtimeMinutes / uptimeDenominator) * 100))
      : 100

    return {
      resolvedCount: resolved.length,
      ongoingCount: ongoing.length,
      totalIncidents: weekIncidents.length,
      downtimeMinutes,
      avgResolution,
      uptime,
      mostImpacted,
    }
  }, [weekIncidents, monitors])

  const insights = useMemo(() => {
    const list = [] as { title: string; detail: string; tone: 'positive' | 'warning' | 'neutral' }[]

    if (derived.totalIncidents === 0) {
      list.push({ title: 'Quiet week', detail: 'No incidents recorded in the last 7 days. Keep monitors running to catch regressions early.', tone: 'positive' })
    } else {
      list.push({ title: 'Incident volume', detail: `${derived.totalIncidents} incidents detected in the past 7 days. ${derived.ongoingCount} still need resolution.`, tone: 'warning' })
    }

    if (derived.downtimeMinutes > 0) {
      list.push({ title: 'Downtime impact', detail: `Total downtime estimated at ${derived.downtimeMinutes.toFixed(1)} minutes across all monitors this week.`, tone: 'warning' })
    }

    if (derived.avgResolution > 0) {
      list.push({ title: 'Resolution speed', detail: `Average time to resolve incidents is ${derived.avgResolution.toFixed(1)} minutes. Aim for single-digit minutes on critical monitors.`, tone: 'neutral' })
    }

    if (derived.mostImpacted) {
      list.push({ title: 'Noisy monitor', detail: `${derived.mostImpacted[0]} triggered ${derived.mostImpacted[1]} incidents this week. Consider tighter health checks or caching.`, tone: 'warning' })
    }

    if (derived.uptime >= 99.5) {
      list.push({ title: 'Reliability', detail: `Projected uptime is ${derived.uptime.toFixed(2)}%. Great job—maintain redundancy to stay above 99.5%.`, tone: 'positive' })
    } else {
      list.push({ title: 'Reliability', detail: `Projected uptime is ${derived.uptime.toFixed(2)}%. Add redundancy or reduce downtime to raise reliability.`, tone: 'warning' })
    }

    return list
  }, [derived])

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Weekly Reports</h1>
          <p className="text-lg text-muted-foreground font-light">Live insights from your monitors and incidents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" className="gap-2" onClick={exportData}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-muted-foreground">Projected Uptime</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{derived.uptime.toFixed(2)}%</p>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Weekly
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Calculated from downtime across monitors</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-muted-foreground">Incidents (7d)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{derived.totalIncidents}</p>
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {derived.ongoingCount} open
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{derived.resolvedCount} resolved</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-muted-foreground">Downtime (7d)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{derived.downtimeMinutes.toFixed(1)} min</p>
            </div>
            <p className="text-xs text-muted-foreground">Summed from resolved incidents</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-muted-foreground">Avg Resolution</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{derived.avgResolution.toFixed(1)} min</p>
            </div>
            <p className="text-xs text-muted-foreground">Based on resolved incidents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Incident Summary (Last 7 Days)
            </CardTitle>
            <CardDescription>Shows ongoing and resolved incidents with durations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading incidents...</p>
            ) : weekIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents recorded this week.</p>
            ) : (
              <div className="space-y-3">
                {weekIncidents.map((i) => (
                  <div key={i.id} className="flex flex-col gap-1 p-4 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{toLocale(i.startedAt)}</p>
                        <p className="text-base font-semibold text-foreground">{i.monitorName}</p>
                      </div>
                      <Badge variant={i.status === 'resolved' ? 'secondary' : 'destructive'}>
                        {i.status === 'resolved' ? 'Resolved' : 'Ongoing'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        Duration: {i.status === 'resolved' ? `${(i.durationSeconds / 60).toFixed(1)} min` : 'In progress'}
                      </span>
                      <span>Last update: {toLocale(i.resolvedAt || i.startedAt)}</span>
                    </div>
                    {i.aiExplanation && <p className="text-sm text-foreground/80">{i.aiExplanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Insights
            </CardTitle>
            <CardDescription>Recommendations based on this week&apos;s data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Crunching numbers...</p>
            ) : (
              insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    insight.tone === 'positive'
                      ? 'border-green-500/20 bg-green-500/5'
                      : insight.tone === 'warning'
                        ? 'border-amber-500/20 bg-amber-500/5'
                        : 'border-border/40'
                  }`}
                >
                  <p className="font-semibold text-foreground">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">{insight.detail}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-accent" />
            Suggested Next Actions
          </CardTitle>
          <CardDescription>Operational follow-ups from this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">1.</span>
              <span className="text-foreground">Review any ongoing incidents and add AI explanations so teams can respond faster.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">2.</span>
              <span className="text-foreground">Create follow-up monitors for the most impacted service to reduce repeated alerts.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">3.</span>
              <span className="text-foreground">Target an average resolution under 10 minutes for the coming week.</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
