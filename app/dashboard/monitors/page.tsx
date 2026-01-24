'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { MonitorCard } from '@/components/monitor-card';
import { AddMonitorModal } from '@/components/add-monitor-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthCheck } from '@/hooks/use-auth-check';

type MonitorItem = {
  id: string
  name: string
  url: string
  status: 'up' | 'down'
  responseTime?: number | null
  uptime?: number | null
  lastChecked?: string
  interval?: string
}

export default function MonitorsPage() {
  const { user, loading: authLoading } = useAuthCheck()
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMonitors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/monitors', { cache: 'no-store' })
      if (!res.ok) {
        setError('Unable to load monitors')
        setLoading(false)
        return
      }
      const data = await res.json()
      const mapped: MonitorItem[] = (data.monitors || []).map((m: any) => ({
        id: m._id,
        name: m.name,
        url: m.url,
        status: m.status === 'DOWN' ? 'down' : 'up',
        responseTime: m.lastResponseTime ?? null,
        uptime: m.uptime ?? null,
        lastChecked: m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleString() : '—',
        interval: m.interval ? `${Math.round(m.interval / 60)} min` : undefined,
      }))
      setMonitors(mapped)
      setError('')
    } catch (err) {
      setError('Unable to load monitors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadMonitors()
    }
  }, [authLoading, user])

  const { upCount, downCount } = useMemo(() => {
    return {
      upCount: monitors.filter((m) => m.status === 'up').length,
      downCount: monitors.filter((m) => m.status === 'down').length,
    }
  }, [monitors])

  const degradedCount = 0

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Monitors</h1>
          <p className="text-lg text-muted-foreground font-light">Manage and track your website monitors</p>
        </div>
        <AddMonitorModal onCreated={loadMonitors} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Operational</p>
              <p className="text-3xl font-bold text-green-600">{upCount}</p>
              <p className="text-xs text-muted-foreground">All checks passing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Degraded</p>
              <p className="text-3xl font-bold text-yellow-600">{degradedCount}</p>
              <p className="text-xs text-muted-foreground">Slow response times</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Down</p>
              <p className="text-3xl font-bold text-red-600">{downCount}</p>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({monitors.length})</TabsTrigger>
          <TabsTrigger value="up">Up ({upCount})</TabsTrigger>
          <TabsTrigger value="degraded">Degraded ({degradedCount})</TabsTrigger>
          <TabsTrigger value="down">Down ({downCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading monitors...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  name={monitor.name}
                  url={monitor.url}
                  status={monitor.status}
                  responseTime={monitor.responseTime ?? 0}
                  uptime={monitor.uptime ?? 99.99}
                  lastChecked={monitor.lastChecked || '—'}
                  interval={monitor.interval || '—'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="up" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitors
              .filter((m) => m.status === 'up')
              .map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  name={monitor.name}
                  url={monitor.url}
                  status={monitor.status}
                  responseTime={monitor.responseTime ?? 0}
                  uptime={monitor.uptime ?? 99.99}
                  lastChecked={monitor.lastChecked || '—'}
                  interval={monitor.interval || '—'}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="degraded" className="space-y-4">
          <div className="text-sm text-muted-foreground">No degraded threshold configured yet.</div>
        </TabsContent>

        <TabsContent value="down" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitors
              .filter((m) => m.status === 'down')
              .map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  name={monitor.name}
                  url={monitor.url}
                  status={monitor.status}
                  responseTime={monitor.responseTime ?? 0}
                  uptime={monitor.uptime ?? 99.99}
                  lastChecked={monitor.lastChecked || '—'}
                  interval={monitor.interval || '—'}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
