
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from 'react';

interface QuorumCheckProps {
  question: Question;
  proposalData: any;
}

export default function QuorumCheck({ question, proposalData }: QuorumCheckProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!proposalData || !proposalData.quorum || !proposalData.scores) {
    return null;
  }
  
  // Get the total votes from scores_total
  const totalVotes = proposalData.scores_total || 0;
  const quorumPassed = totalVotes >= proposalData.quorum;
  
  const StatusIcon = quorumPassed ? CheckCircle : XCircle;
  
  const tooltipText = quorumPassed
    ? `Quorum requirement met: ${totalVotes.toFixed(2)} ${proposalData.symbol} > ${proposalData.quorum} ${proposalData.symbol}`
    : `Quorum requirement not met: ${totalVotes.toFixed(2)} ${proposalData.symbol} < ${proposalData.quorum} ${proposalData.symbol}`;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-space-dark/30 rounded-md overflow-hidden mt-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-space-dark/20">
        <div className="flex items-center gap-2">
          <span className="text-space-light/70">Quorum Check:</span>
          
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
            <span className="text-space-light/70">{totalVotes.toFixed(2)} {proposalData.symbol} / {proposalData.quorum} {proposalData.symbol}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-space-light/70">Voting Results:</h3>
            <div className="mt-3 space-y-2">
              {proposalData.choices.map((choice: string, index: number) => {
                const score = proposalData.scores[index] || 0;
                const percentage = proposalData.scores_total ? (score / proposalData.scores_total) * 100 : 0;
                
                return (
                  <div key={index} className="glass-panel border border-space-dark/20 p-2 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{choice}</span>
                      <span>{score.toFixed(2)} {proposalData.symbol} ({percentage.toFixed(2)}%)</span>
                    </div>
                    <div className="w-full bg-space-dark/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full", 
                          index === 0 ? "bg-green-500" : "bg-blue-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-space-light/70">Total Votes:</h3>
                <p className="mt-1">{proposalData.scores_total?.toFixed(2)} {proposalData.symbol}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-space-light/70">Required Quorum:</h3>
                <p className="mt-1">{proposalData.quorum} {proposalData.symbol}</p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
