'use client';

import { useAuthCheck } from '@/hooks/use-auth-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/kpi-card';
import { 
  Globe, 
  TrendingUp, 
  Activity, 
  Clock,
  AlertTriangle,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const responseTimeData = [
  { name: 'Mon', value: 234 },
  { name: 'Tue', value: 289 },
  { name: 'Wed', value: 201 },
  { name: 'Thu', value: 315 },
  { name: 'Fri', value: 267 },
  { name: 'Sat', value: 245 },
  { name: 'Sun', value: 289 },
];

const websiteStatusData = [
  {
    id: 1,
    name: 'API Server',
    url: 'api.example.com',
    status: 'up',
    responseTime: 145,
    lastChecked: '2 minutes ago',
    uptime: '99.98%'
  },
  {
    id: 2,
    name: 'Web App',
    url: 'app.example.com',
    status: 'up',
    responseTime: 234,
    lastChecked: '1 minute ago',
    uptime: '99.95%'
  },
  {
    id: 3,
    name: 'Database',
    url: 'db.example.com',
    status: 'down',
    responseTime: 0,
    lastChecked: 'Just now',
    uptime: '98.5%'
  },
  {
    id: 4,
    name: 'CDN Service',
    url: 'cdn.example.com',
    status: 'up',
    responseTime: 89,
    lastChecked: '3 minutes ago',
    uptime: '99.99%'
  },
];

export default function DashboardPage() {
  useAuthCheck();

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground font-light">Welcome back! Here's your monitoring overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          icon={Globe}
          label="Total Sites Monitored"
          value="24"
          subtext="Active monitors"
          variant="accent"
        />
        <KPICard
          icon={Activity}
          label="Sites Up"
          value="23"
          subtext="All running smoothly"
          trend={{ direction: 'up', value: 5 }}
          variant="success"
        />
        <KPICard
          icon={AlertTriangle}
          label="Sites Down"
          value="1"
          subtext="Requires attention"
          variant="destructive"
        />
        <KPICard
          icon={Clock}
          label="Avg Response Time"
          value="189ms"
          subtext="Slightly improved"
          trend={{ direction: 'down', value: 3 }}
        />
        <KPICard
          icon={TrendingUp}
          label="Uptime %"
          value="99.92%"
          subtext="This month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Time Chart */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average response times over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: `1px solid var(--color-border)`,
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-primary)" 
                  name="Response Time (ms)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Status Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Operational</span>
                <span className="text-xl font-bold text-green-600">95.8%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '95.8%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Degraded</span>
                <span className="text-xl font-bold text-yellow-600">3.2%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600" style={{ width: '3.2%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Down</span>
                <span className="text-xl font-bold text-red-600">1.0%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: '1%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Website Status Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Website Status</CardTitle>
              <CardDescription>Real-time status of your monitored websites</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Add Monitor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Website</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">URL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Response</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Last Checked</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Uptime</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {websiteStatusData.map((site) => (
                  <tr key={site.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">{site.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-muted-foreground font-mono">{site.url}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            site.status === 'up' ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold uppercase ${
                            site.status === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {site.status === 'up' ? 'Up' : 'Down'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-foreground">{site.responseTime}ms</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-muted-foreground">{site.lastChecked}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-foreground">{site.uptime}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Monitor</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Monitor</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
