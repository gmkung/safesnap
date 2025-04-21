
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData, formatBond, formatDate } from '@/utils/questionUtils';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { FileText, User, Calendar, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import CopyButton from '../CopyButton';
import { getRealityEthUrl } from './QuestionHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TransactionSummary from './TransactionSummary';

interface QuestionSummaryProps {
  question: Question;
  proposalData: any;
  proposalLoading?: boolean;
  proposalLoadFailed?: boolean;
}

export default function QuestionSummary({ 
  question, 
  proposalData, 
  proposalLoading = false, 
  proposalLoadFailed = false 
}: QuestionSummaryProps) {
  const parsedData = parseQuestionData(question);

  const getSnapshotUrl = (spaceId: string, proposalId: string) => {
    return `https://snapshot.org/#/${spaceId}/proposal/${proposalId}`;
  };

  return (
    <Card className="steel-panel mb-6">
      <div className="p-4 border-b border-space-dark/30 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-space" />
        <CardTitle className="text-xl font-semibold text-space">Question Summary</CardTitle>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b border-space-dark/20 pb-4">
            <h3 className="text-base font-medium text-space mb-3 flex items-center">
              Question Information
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href={getRealityEthUrl(question)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-space-light/70 hover:text-space-accent transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Reality.eth</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-space-light/70">Question ID</h4>
                <div className="mt-1 flex items-center">
                  <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                    {question.id.slice(0, 10)}...{question.id.slice(-8)}
                  </code>
                  <CopyButton textToCopy={question.id} size="xs" className="ml-1" />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Time Remaining
                </h4>
                <p className="mt-1 text-sm">
                  {question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-space-light/70">Current Bond</h4>
                <p className="mt-1 text-sm">{formatBond(question.currentBond, question)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-space-light/70">Minimum Bond</h4>
                <p className="mt-1 text-sm">{formatBond(question.minimumBond, question)}</p>
              </div>
            </div>
          </div>
          
          {proposalLoading && (
            <div className="border-b border-space-dark/20 pb-4 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="animate-spin h-8 w-8 border-2 border-space-accent rounded-full border-t-transparent mx-auto mb-4"></div>
                <p className="text-space-light/70">Loading proposal information...</p>
              </div>
            </div>
          )}
          
          {proposalLoadFailed && (
            <div className="border-b border-space-dark/20 pb-4">
              <div className="text-center p-6 bg-space-dark/30 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-space-light mb-2">Proposal Not Found</h3>
                <p className="text-sm text-space-light/70">
                  This may not be a DAO proposal or the Snapshot API might be unavailable.
                </p>
                {parsedData?.proposalId && (
                  <div className="mt-3 text-xs text-space-light/50 flex items-center justify-center gap-1">
                    <span>ID:</span>
                    <code className="bg-space-dark/50 px-2 py-1 rounded">{parsedData.proposalId.slice(0, 8)}...{parsedData.proposalId.slice(-6)}</code>
                    <CopyButton textToCopy={parsedData.proposalId} size="xs" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {proposalData && !proposalLoading && !proposalLoadFailed && (
            <div className="border-b border-space-dark/20 pb-4">
              <h3 className="text-base font-medium text-space mb-3 flex items-center">
                Proposal Information
                {proposalData && proposalData.space && proposalData.id && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          href={getSnapshotUrl(proposalData.space.id, proposalData.id)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-2 text-space-light/70 hover:text-space-accent transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on Snapshot</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h3>
              
              <div className="space-y-3">
                {parsedData?.proposalId && (
                  <div>
                    <h4 className="text-sm font-medium text-space-light/70 flex items-center">
                      Proposal ID
                    </h4>
                    <div className="mt-1 flex items-center">
                      <code className="text-foreground font-mono text-xs break-all flex-grow">
                        {parsedData.proposalId.slice(0, 10)}...{parsedData.proposalId.slice(-8)}
                      </code>
                      <CopyButton textToCopy={parsedData.proposalId} size="xs" className="ml-1" />
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-space-light/70">Proposal Title</h4>
                  <p className="mt-1 text-sm">{proposalData.title || 'Untitled Proposal'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Author
                  </h4>
                  <div className="mt-1 flex items-center">
                    <code className="text-foreground font-mono text-xs">
                      {proposalData.author ? `${proposalData.author.slice(0, 6)}...${proposalData.author.slice(-4)}` : 'Unknown'}
                    </code>
                    {proposalData.author && (
                      <CopyButton textToCopy={proposalData.author} size="xs" className="ml-1" />
                    )}
                  </div>
                </div>
                
                {proposalData.end && (
                  <div>
                    <h4 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> End Date
                    </h4>
                    <p className="mt-1 text-sm">{formatDate(proposalData.end * 1000)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Transaction summary now at full width outside the grid */}
        {proposalData && !proposalLoading && !proposalLoadFailed && 
          <TransactionSummary proposalData={proposalData} />}
      </CardContent>
    </Card>
  );
}
