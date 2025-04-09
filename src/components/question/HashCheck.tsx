
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseQuestionData } from '@/utils/questionUtils';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CopyButton from '../CopyButton';

interface HashCheckProps {
  question: Question;
  hashVerification: any;
  onViewHashDetails: () => void;
}

export default function HashCheck({ question, hashVerification, onViewHashDetails }: HashCheckProps) {
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
    <div className="flex items-center gap-2 my-1">
      <span className="text-sm text-space-light/70 min-w-24">Transaction Hash:</span>
      
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
              onClick={onViewHashDetails}
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
      
      <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
        {parsedData.transactionHash.slice(0, 10)}...{parsedData.transactionHash.slice(-8)}
      </code>
      <CopyButton textToCopy={parsedData.transactionHash} size="xs" className="shrink-0" />
    </div>
  );
}
