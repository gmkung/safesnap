
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface HashVerificationPanelProps {
  hashVerification: {
    calculatedHash: string | null;
    match: boolean;
    matchText: string;
    matchClass: string;
    transactionHashes: string[];
  } | null;
  onViewDetails: () => void;
  question: any;
}

export default function HashVerificationPanel({ 
  hashVerification, 
  onViewDetails,
  question 
}: HashVerificationPanelProps) {
  if (!hashVerification) return null;
  
  // Get the icon based on the verification status
  const StatusIcon = hashVerification.match 
    ? CheckCircle 
    : hashVerification.calculatedHash 
      ? XCircle 
      : AlertTriangle;
  
  // Get the color based on the verification status
  const statusColor = hashVerification.match 
    ? "text-green-500" 
    : hashVerification.calculatedHash 
      ? "text-red-500" 
      : "text-yellow-500";
  
  // Get the tooltip text based on the verification status
  const tooltipText = hashVerification.match 
    ? "Hash in question matches calculated hash from Snapshot Proposal" 
    : hashVerification.calculatedHash 
      ? "Hash mismatch: The expected hash does not match the calculated hash" 
      : "Unable to verify: No transactions found in proposal to calculate hash";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-space-light/70">Expected Transaction Array Hash:</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              className={cn(
                "flex items-center gap-1 cursor-pointer",
                hashVerification.match ? "bg-green-500/20 hover:bg-green-500/30 text-green-500 border-green-500/30" :
                hashVerification.calculatedHash ? "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30" :
                "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/30"
              )}
              onClick={onViewDetails}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{hashVerification.match ? "Valid" : "Invalid"}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{tooltipText}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all">
        {question.decodedData?.transactionHash || "N/A"}
      </code>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs px-2 py-1 h-auto"
        onClick={onViewDetails}
      >
        <Calculator className="h-3 w-3 mr-1" />
        View Details
      </Button>
    </div>
  );
}
