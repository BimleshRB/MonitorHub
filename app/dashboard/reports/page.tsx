'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

const reportInsights = [
  {
    id: 1,
    icon: TrendingUp,
    title: 'Week Uptime Performance',
    insight: 'Your overall uptime this week was 99.92%, which is excellent and above the 99.5% industry standard.',
    color: 'text-green-600',
    bg: 'bg-green-600/10',
  },
  {
    id: 2,
    icon: AlertCircle,
    title: 'Most Common Issue',
    insight: 'Database connection timeouts were the most frequent issue (3 occurrences), primarily during peak hours (2-3 PM).',
    color: 'text-yellow-600',
    bg: 'bg-yellow-600/10',
  },
  {
    id: 3,
    icon: Lightbulb,
    title: 'Optimization Suggestion',
    insight: 'We recommend implementing connection pooling and adding read replicas to handle peak loads more efficiently.',
    color: 'text-blue-600',
    bg: 'bg-blue-600/10',
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Response Time Trend',
    insight: 'Average response times improved by 12% compared to last week. API response times decreased from 234ms to 206ms.',
    color: 'text-green-600',
    bg: 'bg-green-600/10',
  },
  {
    id: 5,
    icon: AlertCircle,
    title: 'Performance Alert',
    insight: 'CDN performance degraded on Tuesday and Wednesday. This affected 2.3% of your user traffic with 500-800ms delays.',
    color: 'text-orange-600',
    bg: 'bg-orange-600/10',
  },
  {
    id: 6,
    icon: Lightbulb,
    title: 'Cost Optimization',
    insight: 'Based on your usage patterns, you could reduce costs by 15% by switching to reserved instances during off-peak hours.',
    color: 'text-purple-600',
    bg: 'bg-purple-600/10',
  },
];

const weeklyMetrics = [
  { label: 'Total Downtime', value: '3 min 45 sec', change: '-23%' },
  { label: 'Incidents', value: '5', change: '-40%' },
  { label: 'Avg Response Time', value: '206ms', change: '-12%' },
  { label: 'Peak Load', value: '3,240 req/s', change: '+5%' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Weekly Reports</h1>
        <p className="text-lg text-muted-foreground font-light">AI-generated insights and recommendations for your monitors</p>
      </div>
      <div>
        <Button className="gap-2 bg-accent hover:bg-accent/90">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Weekly Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeklyMetrics.map((metric, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <span className="text-xs font-semibold text-green-600">{metric.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">AI-Powered Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card key={insight.id} className="border-border/50">
                <CardHeader>
                  <div className={`p-2 rounded-lg w-fit mb-2 ${insight.bg}`}>
                    <Icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{insight.insight}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <Card className="border-border/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Top Recommendations
          </CardTitle>
          <CardDescription>Actionable steps to improve your infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">1.</span>
              <span className="text-foreground">Implement database connection pooling to reduce timeout issues and improve performance during peak hours.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">2.</span>
              <span className="text-foreground">Add more CDN edge nodes in regions where you experienced degraded performance this week.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">3.</span>
              <span className="text-foreground">Set up proactive alerts for response times exceeding 300ms to catch issues before they impact users.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">4.</span>
              <span className="text-foreground">Review and optimize your API endpoints - three endpoints consistently take 2-3x longer than average.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent min-w-fit">5.</span>
              <span className="text-foreground">Consider horizontal scaling for your API servers - peak load is approaching 80% of capacity.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Previous Reports */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Previous Reports</h2>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                { date: 'Jan 13-20, 2024', uptime: '99.88%' },
                { date: 'Jan 6-13, 2024', uptime: '99.95%' },
                { date: 'Dec 30 - Jan 6, 2024', uptime: '99.92%' },
                { date: 'Dec 23-30, 2024', uptime: '99.91%' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                  <span className="text-foreground font-medium">{report.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{report.uptime} uptime</span>
                    <Button variant="ghost" size="sm">View Report</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
