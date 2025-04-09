
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData } from '@/utils/questionUtils';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from '@/lib/utils';
import { ExternalLink, Info, Calculator, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import CopyButton from '../CopyButton';

interface ProposalInfoProps {
  question: Question;
  proposalData?: any;
  hashVerification?: any;
  onViewHashDetails?: () => void;
}

export default function ProposalInfo({ 
  question, 
  proposalData, 
  hashVerification, 
  onViewHashDetails 
}: ProposalInfoProps) {
  const parsedData = parseQuestionData(question);
  
  if (!parsedData?.proposalId && !parsedData?.transactionHash) {
    return null;
  }
  
  const getSnapshotUrl = (spaceId: string, proposalId: string) => {
    return `https://v1.snapshot.box/#/${spaceId}/proposal/${proposalId}`;
  };
  
  const StatusIcon = hashVerification?.match 
    ? CheckCircle 
    : hashVerification?.calculatedHash 
      ? XCircle 
      : AlertTriangle;

  const tooltipText = hashVerification?.match 
    ? "Hash in question matches calculated hash from Snapshot Proposal" 
    : hashVerification?.calculatedHash 
      ? "Hash mismatch: The expected hash does not match the calculated hash" 
      : "Unable to verify: No transactions found in proposal to calculate hash";

  return (
    <div className="border-t border-space-dark/30 p-4 relative">
      <span className="absolute top-0 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></span>
      
      <dl className="grid grid-cols-1 gap-4">
        {parsedData?.proposalId && (
          <div>
            <dt className="font-medium text-space-light/70 flex items-center">
              Proposal ID
              {proposalData && (
                <a 
                  href={getSnapshotUrl(proposalData.space.id, proposalData.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2"
                >
                  <ExternalLink className="h-4 w-4 text-space-light/70 hover:text-space transition-colors" />
                </a>
              )}
            </dt>
            <dd className="mt-1 flex items-center">
              <code className="text-foreground font-mono text-sm break-all">
                {parsedData.proposalId}
              </code>
              {parsedData.proposalId.startsWith('0x') && (
                <CopyButton textToCopy={parsedData.proposalId} className="ml-1" />
              )}
            </dd>
          </div>
        )}
        
        {parsedData?.transactionHash && (
          <div>
            <dt className="font-medium text-space-light/70 flex items-center gap-2">
              Expected Transaction Array Hash
              
              {hashVerification && (
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
                        <span>{hashVerification.match ? "Match" : "Invalid"}</span>
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
              )}
            </dt>
            <dd className="mt-1 flex items-center">
              <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                {parsedData.transactionHash}
              </code>
              <CopyButton textToCopy={parsedData.transactionHash} className="ml-1" />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
