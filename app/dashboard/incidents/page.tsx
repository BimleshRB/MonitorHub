'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { IncidentCard } from '@/components/incident-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuthCheck } from '@/hooks/use-auth-check';

type IncidentItem = {
  id: string
  siteName: string
  startTime: string
  endTime: string
  duration: string
  status: 'resolved' | 'ongoing'
  aiExplanation?: string | null
}

export default function IncidentsPage() {
  const { user, loading: authLoading } = useAuthCheck()
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadIncidents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/incidents', { cache: 'no-store' })
      if (!res.ok) {
        setError('Unable to load incidents')
        setLoading(false)
        return
      }
      const data = await res.json()
      const mapped: IncidentItem[] = (data.incidents || []).map((i: any) => {
        const startedAt = i.startedAt ? new Date(i.startedAt) : null
        const resolvedAt = i.resolvedAt ? new Date(i.resolvedAt) : null
        const status: IncidentItem['status'] = resolvedAt ? 'resolved' : 'ongoing'

        const duration = resolvedAt && startedAt && i.durationSeconds
          ? `${Math.round(i.durationSeconds / 60)} minutes`
          : 'Ongoing'

        return {
          id: i._id,
          siteName: i.monitorId?.name || i.monitorId?.url || 'Monitor',
          startTime: startedAt ? startedAt.toLocaleString() : 'Unknown',
          endTime: resolvedAt ? resolvedAt.toLocaleString() : '—',
          duration,
          status,
          aiExplanation: i.aiExplanation,
        }
      })
      setIncidents(mapped)
      setError('')
    } catch (err) {
      setError('Unable to load incidents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadIncidents()
    }
  }, [authLoading, user])

  const { resolvedCount, ongoingCount } = useMemo(() => {
    return {
      resolvedCount: incidents.filter((i) => i.status === 'resolved').length,
      ongoingCount: incidents.filter((i) => i.status === 'ongoing').length,
    }
  }, [incidents])

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Incidents</h1>
        <p className="text-lg text-muted-foreground font-light">Track and analyze downtime events with AI insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Total resolved incidents</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-muted-foreground">Ongoing</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{ongoingCount}</p>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing ({ongoingCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading incidents...</p>
          ) : incidents.length > 0 ? (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  siteName={incident.siteName}
                  startTime={incident.startTime}
                  endTime={incident.endTime}
                  duration={incident.duration}
                  status={incident.status}
                  aiExplanation={incident.aiExplanation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No incidents recorded</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4 mt-6">
          {incidents.filter((i) => i.status === 'ongoing').length > 0 ? (
            <div className="space-y-3">
              {incidents
                .filter((i) => i.status === 'ongoing')
                .map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    siteName={incident.siteName}
                    startTime={incident.startTime}
                    endTime={incident.endTime}
                    duration={incident.duration}
                    status={incident.status}
                    aiExplanation={incident.aiExplanation}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No ongoing incidents</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {incidents.filter((i) => i.status === 'resolved').length > 0 ? (
            <div className="space-y-3">
              {incidents
                .filter((i) => i.status === 'resolved')
                .map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    siteName={incident.siteName}
                    startTime={incident.startTime}
                    endTime={incident.endTime}
                    duration={incident.duration}
                    status={incident.status}
                    aiExplanation={incident.aiExplanation}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No resolved incidents</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
