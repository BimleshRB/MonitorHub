import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MonitorCardProps {
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastChecked: string;
  interval: string;
}

export function MonitorCard({
  name,
  url,
  status,
  responseTime,
  uptime,
  lastChecked,
  interval,
}: MonitorCardProps) {
  const statusConfig = {
    up: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-600/10',
      label: 'Operational',
    },
    down: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-600/10',
      label: 'Down',
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-600/10',
      label: 'Degraded',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="border-border/60 hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{url}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Monitor</DropdownMenuItem>
            <DropdownMenuItem>View History</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Monitor</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Status Row */}
          <div className="flex items-center justify-between p-4 rounded-md bg-secondary/40 border border-border/40">
            <span className={`font-semibold ${config.color}`}>{config.label}</span>
            <span className="text-xs text-muted-foreground font-medium">{interval} interval</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Response Time</p>
              <p className="text-2xl font-bold text-foreground">{responseTime}ms</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Uptime</p>
              <p className="text-2xl font-bold text-foreground">{uptime}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last Check</p>
              <p className="text-sm font-semibold text-foreground">{lastChecked}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
