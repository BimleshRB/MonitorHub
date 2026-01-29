'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthCheck } from '@/hooks/use-auth-check'
import {
  ArrowUpRight,
  Globe,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Gauge,
  TrendingUp,
} from 'lucide-react'

type MonitorItem = {
  _id: string
  name: string
  url: string
  status: 'UP' | 'DOWN' | 'SLOW'
  lastResponseTime?: number | null
  lastStatusCode?: number | null
  uptimePercent?: number
  lastCheckedAt?: string | null
}

type IncidentItem = {
  _id: string
  monitorId: { name: string; url: string }
  startedAt: string
  status: 'ONGOING' | 'RESOLVED'
  severity?: 'LOW' | 'MEDIUM' | 'HIGH'
  aiExplanation?: string | null
  resolvedAt?: string
}

type KPIs = {
  totalMonitors: number
  activeMonitors: number
  upMonitors: number
  downMonitors: number
  slowMonitors: number
  incidents24h: number
  averageResponseTime: number
  uptime24h: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthCheck()
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [monRes, incRes, kpiRes] = await Promise.all([
        fetch('/api/monitors?limit=100', { cache: 'no-store' }),
        fetch('/api/incidents?status=ONGOING&limit=20', { cache: 'no-store' }),
        fetch('/api/analytics', { cache: 'no-store' }),
      ])

      if (!monRes.ok) throw new Error('Failed to load monitors')
      if (!incRes.ok) throw new Error('Failed to load incidents')
      if (!kpiRes.ok) throw new Error('Failed to load analytics')

      const monData = await monRes.json()
      const incData = await incRes.json()
      const kpiData = await kpiRes.json()

      setMonitors(monData.monitors || [])
      setIncidents(incData.incidents || [])
      setKpis(kpiData.kpis || null)
    } catch (err: any) {
      console.error('Dashboard load error:', err)
      setError(err?.message || 'Unable to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
      // Refresh every 30 seconds
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    }
  }, [authLoading, user])

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'UP':
        return 'bg-green-600/10 text-green-600 border-green-600/20'
      case 'SLOW':
        return 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20'
      case 'DOWN':
        return 'bg-red-600/10 text-red-600 border-red-600/20'
      default:
        return 'bg-gray-600/10 text-gray-600 border-gray-600/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="h-4 w-4" />
      case 'SLOW':
        return <Clock className="h-4 w-4" />
      case 'DOWN':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your website health in real-time
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <ArrowUpRight className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Total Monitors</p>
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{kpis.totalMonitors}</p>
              <p className="text-xs text-muted-foreground">{kpis.activeMonitors} active</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Uptime (24h)</p>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {kpis.uptime24h.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">{kpis.upMonitors} up now</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Avg Response</p>
                <Gauge className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {kpis.averageResponseTime}ms
              </p>
              <p className="text-xs text-muted-foreground">
                {kpis.downMonitors} down
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">
                  Incidents (24h)
                </p>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {kpis.incidents24h}
              </p>
              <p className="text-xs text-muted-foreground">
                {incidents.length} ongoing
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monitors Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Monitors</CardTitle>
          <CardDescription>
            Real-time status of your monitored websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : monitors.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No monitors yet. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monitors.map((monitor) => (
                <div
                  key={monitor._id}
                  className="border border-border/60 rounded-lg p-4 space-y-3 hover:bg-muted/30 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {monitor.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {monitor.url}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 whitespace-nowrap ${statusBadgeClass(
                        monitor.status
                      )}`}
                    >
                      {getStatusIcon(monitor.status)}
                      {monitor.status === 'SLOW' ? 'Slow' : monitor.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Response Time</p>
                      <p className="font-semibold text-foreground">
                        {monitor.lastResponseTime
                          ? `${monitor.lastResponseTime}ms`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Uptime</p>
                      <p className="font-semibold text-foreground">
                        {monitor.uptimePercent
                          ? `${monitor.uptimePercent.toFixed(1)}%`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Status Code</p>
                      <p className="font-semibold text-foreground">
                        {monitor.lastStatusCode || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>
            Issues detected and being tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No active incidents. All systems operational!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident._id}
                  className="border border-border/60 rounded-lg p-4 space-y-2 hover:bg-muted/30 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">
                        {incident.monitorId.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(incident.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {incident.severity && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            incident.severity === 'HIGH'
                              ? 'bg-red-600/10 text-red-600'
                              : incident.severity === 'MEDIUM'
                                ? 'bg-yellow-600/10 text-yellow-600'
                                : 'bg-blue-600/10 text-blue-600'
                          }`}
                        >
                          {incident.severity}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          incident.status === 'RESOLVED'
                            ? 'bg-green-600/10 text-green-600'
                            : 'bg-amber-600/10 text-amber-600'
                        }`}
                      >
                        {incident.status === 'RESOLVED'
                          ? 'Resolved'
                          : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {incident.aiExplanation && (
                    <p className="text-sm text-muted-foreground">
                      {incident.aiExplanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}