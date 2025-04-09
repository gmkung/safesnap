
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, BookText, AlertTriangle, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { parseQuestionData } from '@/utils/questionUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from 'react';

interface ConstitutionalCheckProps {
  question: Question;
  proposalData: any;
}

export default function ConstitutionalCheck({ question, proposalData }: ConstitutionalCheckProps) {
  const [isOpen, setIsOpen] = useState(false);
  const parsedData = parseQuestionData(question);
  const daoName = parsedData?.dao || null;
  
  if (!daoName) return null;
  
  const constitutionUrl = daoName ? `https://example.com/dao/${daoName}/constitution` : "https://example.com/constitution";
  
  const getSnapshotUrl = (spaceId: string, proposalId: string) => {
    return `https://snapshot.org/#/${spaceId}/proposal/${proposalId}`;
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-space-dark/30 rounded-md overflow-hidden mt-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-space-dark/20">
        <div className="flex items-center gap-2">
          <span className="text-space-light/70">Constitution Check:</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={cn(
                    "flex items-center gap-1 cursor-pointer",
                    "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/30"
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Manual Review</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs glass-panel border-space/30">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>This check requires manual review. Please read the DAO constitution to ensure this proposal complies with all governance rules.</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-3">
          <p className="text-sm text-space-light/90">
            This check requires manual review to ensure the proposal complies with the DAO constitution and governance rules.
            Please review the following documents:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Button 
              variant="ghost"
              size="sm"
              asChild
              className="text-space hover:text-space-accent transition-colors text-xs gap-1 h-auto py-1 justify-start"
            >
              <a 
                href={constitutionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookText className="h-3 w-3 mr-1" />
                <span>View DAO Constitution</span>
              </a>
            </Button>
            
            {proposalData && parsedData?.proposalId && (
              <Button 
                variant="ghost"
                size="sm"
                asChild
                className="text-space hover:text-space-accent transition-colors text-xs gap-1 h-auto py-1 justify-start"
              >
                <a 
                  href={getSnapshotUrl(proposalData.space.id, proposalData.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span>View on Snapshot</span>
                </a>
              </Button>
            )}
          </div>
          
          <div className="mt-3 glass-panel border border-space-dark/20 p-3 rounded">
            <h3 className="text-sm font-medium text-space-light/70 mb-2">Constitution Compliance Checklist:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-space-light/90">
              <li>Does this proposal align with the DAO's stated mission and values?</li>
              <li>Does the proposal follow the proper governance process?</li>
              <li>Are all required stakeholders consulted in this proposal?</li>
              <li>Does the proposal respect existing policies and procedures?</li>
              <li>Is the proposal technically feasible within the scope of the DAO's capabilities?</li>
            </ul>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
