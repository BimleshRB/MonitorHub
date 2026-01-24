'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monitorsData = [
  {
    id: 1,
    name: 'Production API',
    url: 'api.production.example.com',
    owner: 'John Doe',
    status: 'up',
    uptime: 99.98,
    incidents: 0,
    avgResponse: 145,
  },
  {
    id: 2,
    name: 'Web Application',
    url: 'app.production.example.com',
    owner: 'Jane Smith',
    status: 'up',
    uptime: 99.95,
    incidents: 0,
    avgResponse: 234,
  },
  {
    id: 3,
    name: 'Admin Panel',
    url: 'admin.example.com',
    owner: 'John Doe',
    status: 'down',
    uptime: 98.5,
    incidents: 2,
    avgResponse: 0,
  },
  {
    id: 4,
    name: 'CDN Service',
    url: 'cdn.example.com',
    owner: 'Alice Johnson',
    status: 'up',
    uptime: 99.99,
    incidents: 0,
    avgResponse: 89,
  },
  {
    id: 5,
    name: 'Payment Gateway',
    url: 'payment.api.example.com',
    owner: 'Bob Wilson',
    status: 'degraded',
    uptime: 99.2,
    incidents: 1,
    avgResponse: 1245,
  },
  {
    id: 6,
    name: 'Database Server',
    url: 'db.internal.example.com',
    owner: 'Alice Johnson',
    status: 'up',
    uptime: 99.99,
    incidents: 0,
    avgResponse: 56,
  },
];

export default function AdminMonitorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMonitors = monitorsData.filter((monitor) => {
    const matchesSearch =
      monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monitor.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monitor.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || monitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const upCount = monitorsData.filter((m) => m.status === 'up').length;
  const downCount = monitorsData.filter((m) => m.status === 'down').length;
  const degradedCount = monitorsData.filter((m) => m.status === 'degraded').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Manage Monitors</h1>
        <p className="text-lg text-muted-foreground font-light">View all monitors across all users</p>
      </div>
      <Button className="bg-accent hover:bg-accent/90">Create Global Monitor</Button>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Operational</p>
              <p className="text-3xl font-bold text-green-600">{upCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Degraded</p>
              <p className="text-3xl font-bold text-yellow-600">{degradedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Down</p>
              <p className="text-3xl font-bold text-red-600">{downCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitors Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>All Monitors</CardTitle>
              <CardDescription>Total: {monitorsData.length} monitors</CardDescription>
            </div>
            <div className="flex gap-4 flex-col md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search monitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Monitor Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">URL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Uptime</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Response</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Incidents</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonitors.length > 0 ? (
                  filteredMonitors.map((monitor) => (
                    <tr key={monitor.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">{monitor.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground font-mono">{monitor.url}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground">{monitor.owner}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              monitor.status === 'up'
                                ? 'bg-green-600'
                                : monitor.status === 'degraded'
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold uppercase ${
                              monitor.status === 'up'
                                ? 'text-green-600'
                                : monitor.status === 'degraded'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {monitor.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-foreground">{monitor.uptime}%</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">{monitor.avgResponse}ms</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-foreground">{monitor.incidents}</p>
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
                            <DropdownMenuItem>View History</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete Monitor</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No monitors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
