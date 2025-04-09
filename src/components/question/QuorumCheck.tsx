
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuorumCheckProps {
  question: Question;
  proposalData: any;
}

export default function QuorumCheck({ question, proposalData }: QuorumCheckProps) {
  if (!proposalData || !proposalData.quorum || !proposalData.scores) {
    return null;
  }
  
  // Find the "Yes" option index - usually it's the first choice, but we can look for "yes" in the label as well
  const yesIndex = proposalData.choices.findIndex((choice: string) => 
    choice.toLowerCase() === "yes" || choice.toLowerCase().includes("yes"));
  
  if (yesIndex === -1) return null;
  
  const yesScore = proposalData.scores[yesIndex] || 0;
  const quorumPassed = yesScore >= proposalData.quorum;
  
  const StatusIcon = quorumPassed ? CheckCircle : XCircle;
  
  const tooltipText = quorumPassed
    ? `Quorum requirement met: ${yesScore.toFixed(2)} ${proposalData.symbol} > ${proposalData.quorum} ${proposalData.symbol}`
    : `Quorum requirement not met: ${yesScore.toFixed(2)} ${proposalData.symbol} < ${proposalData.quorum} ${proposalData.symbol}`;

  return (
    <div className="flex items-center gap-2 my-1">
      <span className="text-sm text-space-light/70 min-w-24">Quorum Check:</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                "flex items-center gap-1 cursor-pointer",
                quorumPassed 
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-500 border-green-500/30" 
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30"
              )}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{quorumPassed ? "Passed" : "Failed"}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs glass-panel border-space/30">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{tooltipText}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="text-sm ml-1">
        <span className="text-space-light/70">{yesScore.toFixed(2)} {proposalData.symbol} / {proposalData.quorum} {proposalData.symbol}</span>
      </div>
    </div>
  );
}
