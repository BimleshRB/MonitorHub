'use client';

import { useAuthCheck } from '@/hooks/use-auth-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/kpi-card';
import { 
  Users, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

const systemDataOverTime = [
  { name: 'Mon', users: 1200, monitors: 2400, alerts: 240 },
  { name: 'Tue', users: 1300, monitors: 2210, alerts: 221 },
  { name: 'Wed', users: 1400, monitors: 2290, alerts: 229 },
  { name: 'Thu', users: 1500, monitors: 2000, alerts: 200 },
  { name: 'Fri', users: 1600, monitors: 2181, alerts: 218 },
  { name: 'Sat', users: 1700, monitors: 2500, alerts: 250 },
  { name: 'Sun', users: 1800, monitors: 2100, alerts: 210 },
];

const recentUsersData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', monitorsCount: 12, joinedDate: '2 days ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', monitorsCount: 8, joinedDate: '1 week ago' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive', monitorsCount: 5, joinedDate: '3 weeks ago' },
  { id: 4, name: 'Alice Johnson', email: 'alice@example.com', status: 'active', monitorsCount: 15, joinedDate: '2 months ago' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', status: 'active', monitorsCount: 6, joinedDate: '1 month ago' },
];

export default function AdminDashboardPage() {
  useAuthCheck();

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Admin Overview</h1>
        <p className="text-lg text-muted-foreground font-light">System-wide monitoring and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Total Users"
          value="1,234"
          subtext="Active accounts"
          trend={{ direction: 'up', value: 12 }}
          variant="accent"
        />
        <KPICard
          icon={Eye}
          label="Total Monitors"
          value="8,942"
          subtext="Across all users"
          trend={{ direction: 'up', value: 8 }}
        />
        <KPICard
          icon={AlertTriangle}
          label="Active Incidents"
          value="23"
          subtext="Requires attention"
          variant="destructive"
        />
        <KPICard
          icon={TrendingUp}
          label="System Health"
          value="99.95%"
          subtext="Average uptime"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>System Growth</CardTitle>
            <CardDescription>Users and monitors over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemDataOverTime}>
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
                  dataKey="users"
                  stroke="var(--color-primary)"
                  name="Users"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="monitors"
                  stroke="var(--color-accent)"
                  name="Monitors"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Alerts Trend</CardTitle>
            <CardDescription>Daily alerts sent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemDataOverTime}>
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
                <Bar dataKey="alerts" fill="var(--color-destructive)" name="Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest joined accounts</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Monitors</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsersData.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">{user.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-foreground">{user.monitorsCount}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            user.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                          }`}
                        />
                        <span className={`text-xs font-semibold uppercase ${
                          user.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-muted-foreground">{user.joinedDate}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Account</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
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
