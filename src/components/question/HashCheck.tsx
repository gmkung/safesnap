
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseQuestionData } from '@/utils/questionUtils';
import { Info, CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import CopyButton from '../CopyButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from 'react';

interface HashCheckProps {
  question: Question;
  hashVerification: any;
  onViewHashDetails: () => void;
  proposalData: any;
}

export default function HashCheck({ question, hashVerification, onViewHashDetails, proposalData }: HashCheckProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!hashVerification) return null;
  
  const parsedData = parseQuestionData(question);
  
  if (!parsedData?.transactionHash) return null;
  
  const StatusIcon = hashVerification.match 
    ? CheckCircle 
    : hashVerification.calculatedHash 
      ? XCircle 
      : AlertTriangle;
  
  const tooltipText = hashVerification.match 
    ? "Hash in question matches calculated hash from Snapshot Proposal" 
    : hashVerification.calculatedHash 
      ? "Hash mismatch: The expected hash does not match the calculated hash" 
      : "Unable to verify: No transactions found in proposal to calculate hash";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-space-dark/30 rounded-md overflow-hidden">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-space-dark/20">
        <div className="flex items-center gap-2">
          <span className="text-space-light/70">Transaction Hash Check:</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={cn(
                    "flex items-center gap-1 cursor-pointer",
                    hashVerification.match ? "bg-green-500/20 hover:bg-green-500/30 text-green-500 border-green-500/30" :
                    hashVerification.calculatedHash ? "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30" :
                    "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/30"
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span>{hashVerification.match ? "Valid" : "Invalid"}</span>
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
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-space-light/70">Expected Hash:</h3>
            <div className="mt-1 flex items-center">
              <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                {parsedData.transactionHash}
              </code>
              <CopyButton textToCopy={parsedData.transactionHash} size="xs" className="ml-1" />
            </div>
          </div>
          
          {proposalData && proposalData.transactions && proposalData.transactions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-space-light/70 mt-3">Proposal Transactions:</h3>
              <div className="mt-2 glass-panel border border-space-dark/30 rounded-md">
                {proposalData.transactions.map((tx: any, index: number) => (
                  <div key={index} className="p-3 border-b border-space-dark/20 last:border-b-0 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-space-light/70">Target:</span>
                      <code className="font-mono">{`${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}</code>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-medium text-space-light/70">Value:</span>
                      <span>{tx.value || '0'}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-medium text-space-light/70">Function:</span>
                      <span>{tx.functionSignature || 'Transfer'}</span>
                    </div>
                    {tx.parameters && (
                      <div className="mt-1">
                        <span className="font-medium text-space-light/70">Parameters:</span>
                        <pre className="mt-1 bg-space-dark/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(tx.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-2 flex justify-end">
            <button 
              className="text-space text-xs hover:text-space-accent transition-colors"
              onClick={onViewHashDetails}
            >
              View Full Hash Details
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
