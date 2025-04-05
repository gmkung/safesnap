
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  return (
    <div className={cn(
      "p-4 rounded-md border",
      hashVerification.match 
        ? "border-green-500/30 bg-green-500/10" 
        : hashVerification.calculatedHash 
          ? "border-red-500/30 bg-red-500/10"
          : "border-yellow-500/30 bg-yellow-500/10"
    )}>
      <div className="flex items-center gap-2 mb-3">
        {hashVerification.match ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : hashVerification.calculatedHash ? (
          <XCircle className="h-6 w-6 text-red-500" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
        )}
        <span className={cn("text-lg font-medium", hashVerification.matchClass)}>
          {hashVerification.matchText}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={onViewDetails}
        >
          <Calculator className="h-4 w-4 mr-2" />
          View Calculation Details
        </Button>
      </div>
      
      {hashVerification.calculatedHash && (
        <div className="text-sm mt-2">
          <span className="font-medium text-space-light/70">Calculated Hash:</span>
          <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-sm font-mono break-all">
            {hashVerification.calculatedHash}
          </code>
        </div>
      )}
    </div>
  );
}
