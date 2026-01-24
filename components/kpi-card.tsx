import { Type as type, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-secondary/50 text-foreground',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card className="border-border/60 hover:border-primary/40 transition-colors">
      <CardContent className="pt-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-foreground">{value}</p>
              {trend && (
                <span className={cn(
                  'text-xs font-semibold',
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
                </span>
              )}
            </div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
          <div className={cn('p-4 rounded-lg', variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
