import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from 'react';

interface TimeRemainingCheckProps {
  question: Question;
}

export default function TimeRemainingCheck({ question }: TimeRemainingCheckProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!question.currentAnswer) {
    return null;
  }

  const timeRemainingInSeconds = Math.floor(question.timeRemainingInPhase / 1000);
  if (timeRemainingInSeconds <= 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-space-dark/30 rounded-md overflow-hidden mt-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-space-dark/20">
          <div className="flex items-center gap-2">
            <span className="text-space-light/70">Time Remaining:</span>
            <Badge className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 border-purple-500/30">
              Phase ended
            </Badge>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
        </CollapsibleTrigger>
      </Collapsible>
    );
  }

  const days = Math.floor(timeRemainingInSeconds / 86400);
  const hours = Math.floor((timeRemainingInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
  const seconds = timeRemainingInSeconds % 60;

  let timeStr = '';
  if (days > 0) timeStr += `${days}d `;
  if (hours > 0) timeStr += `${hours}h `;
  if (minutes > 0) timeStr += `${minutes}m `;
  if (seconds > 0) timeStr += `${seconds}s`;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-space-dark/30 rounded-md overflow-hidden mt-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-space-dark/20">
        <div className="flex items-center gap-2">
          <span className="text-space-light/70">Time Remaining:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 border-purple-500/30">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeStr.trim()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs glass-panel border-space/30">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Time remaining in the current phase</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-3">
          <div className="glass-panel border border-space-dark/20 p-3 rounded">
            <h3 className="text-sm font-medium text-space-light/70 mb-2">Phase Information:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-space-light/90">
              <li>Current Phase: {question.phase}</li>
              <li>Time Remaining: {timeStr.trim()}</li>
              <li>Total Seconds: {timeRemainingInSeconds}s</li>
            </ul>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 