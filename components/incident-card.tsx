import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface IncidentCardProps {
  siteName: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'resolved' | 'ongoing';
  aiExplanation: string;
}

export function IncidentCard({
  siteName,
  startTime,
  endTime,
  duration,
  status,
  aiExplanation,
}: IncidentCardProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={siteName} asChild>
        <Card className="border-border/50">
          <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-start gap-4 text-left flex-1">
              <div className={`p-2 rounded-lg mt-1 ${
                status === 'resolved' 
                  ? 'bg-green-600/10' 
                  : 'bg-red-600/10'
              }`}>
                {status === 'resolved' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{siteName}</h3>
                <p className={`text-sm font-medium mt-1 ${
                  status === 'resolved' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {status === 'resolved' ? 'Resolved' : 'Ongoing'}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Down Since</p>
                  <p className="font-semibold text-foreground">{startTime}</p>
                </div>
                {status === 'resolved' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recovered</p>
                    <p className="font-semibold text-foreground">{endTime}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold text-foreground">{duration}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/30 space-y-2">
                <h4 className="font-semibold text-foreground text-sm">AI Analysis</h4>
                <p className="text-sm text-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg">
                  {aiExplanation}
                </p>
              </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
