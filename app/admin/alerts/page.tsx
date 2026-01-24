'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const alertsData = [
  {
    id: 1,
    type: 'incident',
    severity: 'critical',
    message: 'Admin Panel is DOWN',
    affectedUsers: 1,
    startTime: '1 hour ago',
    status: 'ongoing',
  },
  {
    id: 2,
    type: 'performance',
    severity: 'warning',
    message: 'Payment Gateway - High response times (1200ms+)',
    affectedUsers: 3,
    startTime: '45 minutes ago',
    status: 'ongoing',
  },
  {
    id: 3,
    type: 'incident',
    severity: 'high',
    message: 'Database connection timeout - 5 monitors affected',
    affectedUsers: 2,
    startTime: '2 hours ago',
    status: 'resolved',
  },
  {
    id: 4,
    type: 'system',
    severity: 'info',
    message: 'System maintenance scheduled - January 28, 2024',
    affectedUsers: 12,
    startTime: '3 hours ago',
    status: 'scheduled',
  },
  {
    id: 5,
    type: 'incident',
    severity: 'high',
    message: 'API Server - Multiple failed health checks',
    affectedUsers: 4,
    startTime: '4 hours ago',
    status: 'resolved',
  },
];

export default function AdminAlertsPage() {
  const criticalCount = alertsData.filter((a) => a.severity === 'critical' && a.status === 'ongoing').length;
  const warningCount = alertsData.filter((a) => a.severity === 'warning' && a.status === 'ongoing').length;
  const resolvedCount = alertsData.filter((a) => a.status === 'resolved').length;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600/10 text-red-600 border-red-600/20';
      case 'high':
        return 'bg-orange-600/10 text-orange-600 border-orange-600/20';
      case 'warning':
        return 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20';
      default:
        return 'bg-blue-600/10 text-blue-600 border-blue-600/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
  {/* Page Header */}
  <div className="space-y-3">
  <h1 className="text-4xl font-bold text-foreground tracking-tight">System Alerts</h1>
  <p className="text-lg text-muted-foreground font-light">Monitor system-wide alerts and incidents</p>
  </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Active incidents</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Performance issues</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({alertsData.filter(a => a.status === 'ongoing').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
          <TabsTrigger value="all">All ({alertsData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="space-y-3">
            {alertsData
              .filter((a) => a.status === 'ongoing')
              .map((alert) => (
                <Card key={alert.id} className={`border ${getSeverityStyles(alert.severity).split(' ').slice(-1)[0]}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getSeverityStyles(alert.severity)}`}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{alert.message}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Affects {alert.affectedUsers} user{alert.affectedUsers !== 1 ? 's' : ''} • Started {alert.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          <div className="space-y-3">
            {alertsData
              .filter((a) => a.status === 'resolved')
              .map((alert) => (
                <Card key={alert.id} className="border-border/50 opacity-75">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-green-600/10">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{alert.message}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Affected {alert.affectedUsers} user{alert.affectedUsers !== 1 ? 's' : ''} • Resolved
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="space-y-3">
            {alertsData.map((alert) => (
              <Card
                key={alert.id}
                className={`border ${
                  alert.status === 'ongoing' ? getSeverityStyles(alert.severity) : 'border-border/50 opacity-75'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          alert.status === 'ongoing'
                            ? getSeverityStyles(alert.severity)
                            : 'bg-green-600/10'
                        }`}
                      >
                        {alert.status === 'ongoing' ? getSeverityIcon(alert.severity) : <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{alert.message}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.status === 'ongoing'
                            ? `Affects ${alert.affectedUsers} user${alert.affectedUsers !== 1 ? 's' : ''} • Started ${alert.startTime}`
                            : `Affected ${alert.affectedUsers} user${alert.affectedUsers !== 1 ? 's' : ''} • Resolved`}
                        </p>
                      </div>
                    </div>
                    {alert.status === 'ongoing' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
