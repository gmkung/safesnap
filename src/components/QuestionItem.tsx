import { Question } from 'reality-kleros-subgraph';
import { Badge } from './ui/badge';
import { formatUnits } from 'viem';
import { Hash, Info, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { parseQuestionData } from '@/utils/questionUtils';

interface QuestionItemProps {
  question: Question;
  proposalTitles: Record<string, string | null>;
  loadingProposals: Record<string, boolean>;
  onQuestionClick: (question: Question) => void;
}

export function QuestionItem({ question, proposalTitles, loadingProposals, onQuestionClick }: QuestionItemProps) {
  const parsedData = parseQuestionData(question);
  const proposalId = parsedData?.proposalId || '';
  const isLoadingProposal = proposalId ? loadingProposals[proposalId] : false;
  const proposalTitle = proposalId ? proposalTitles[proposalId] : null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatBond = (bond: string, question: Question) => {
    if (!question?.contract?.config) return `${bond} ETH`;

    try {
      const formattedAmount = formatUnits(BigInt(bond), 18);
      return `${formattedAmount} ${question.contract.config.token_ticker}`;
    } catch (error) {
      console.error('Error formatting bond:', error);
      return `${bond} ${question?.contract?.config?.token_ticker || 'ETH'}`;
    }
  };

  const truncateId = (id: string, start = 6, end = 4) => {
    if (!id) return '';
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  const formatTitle = () => {
    if (!parsedData) return null;

    return (
      <div className="space-y-2">
        {parsedData.dao && (
          <div className="text-space text-sm font-medium flex items-center">
            <span className="bg-space/10 px-2 py-0.5 rounded border border-space/20 shadow-holo-sm">
              {parsedData.dao}
            </span>
          </div>
        )}
        
        {isLoadingProposal ? (
          <div className="text-lg font-medium text-space-light/70">
            Loading proposal details...
          </div>
        ) : proposalTitle ? (
          <div className="text-lg font-medium text-space-light">
            {proposalTitle}
          </div>
        ) : (
          <div className="text-lg font-medium text-space-light/70">
            {parsedData.dao ? `${parsedData.dao} Proposal` : 'Untitled Proposal'}
          </div>
        )}
        
        <div className="space-y-1.5 mt-2">
          <div className="text-sm flex items-center">
            <span className="text-space-light/70 font-medium min-w-24 flex items-center">
              <FileText size={14} className="mr-1" /> Question ID:
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <code className="ml-2 bg-space-darkBlue/50 border border-space/10 px-2 py-0.5 rounded text-xs font-mono text-space-light cursor-pointer">
                  {truncateId(question.id)}
                </code>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono">{question.id}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {parsedData.proposalId && (
            <div className="text-sm flex items-center">
              <span className="text-space-light/70 font-medium min-w-24 flex items-center">
                <Hash size={14} className="mr-1" /> Proposal ID:
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="ml-2 bg-space-darkBlue/50 border border-space/10 px-2 py-0.5 rounded text-xs font-mono text-space-light cursor-pointer">
                    {truncateId(parsedData.proposalId)}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-mono">{parsedData.proposalId}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {parsedData.transactionHash && (
            <div className="text-sm flex items-center">
              <span className="text-space-light/70 font-medium min-w-24 flex items-center">
                <Hash size={14} className="mr-1" /> Tx Array Hash:
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="ml-2 bg-space-darkBlue/50 border border-space/10 px-2 py-0.5 rounded text-xs font-mono text-space-light cursor-pointer">
                    {truncateId(parsedData.transactionHash)}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-mono">{parsedData.transactionHash}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={() => onQuestionClick(question)}
      className="rounded-lg border border-space/20 bg-space-darkBlue/30 transition-all duration-300 
                cursor-pointer p-4 mb-6 relative
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-space/5 before:to-transparent 
                before:rounded-lg before:-z-10 before:blur-md before:translate-y-1 before:translate-x-1"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex-1 text-left">
          <div className="font-medium text-space-light">
            {formatTitle()}
          </div>
          
          {isLoadingProposal && (
            <div className="mt-2 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-space rounded-full border-t-transparent"></div>
              <span className="text-xs text-space-light/70">Loading proposal details...</span>
            </div>
          )}
          
          {parsedData?.proposalId && !isLoadingProposal && !proposalTitles[parsedData.proposalId] && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-400 cursor-help">
                    <Info size={14} />
                    <span>Could not load proposal details</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Proposal details could not be loaded from Snapshot</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-between md:justify-end">
          <Badge 
            className={`${
              question.phase === 'OPEN' ? 'bg-space/20 text-space border-space/30' : 
              question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
              question.phase === 'FINALIZED' ? 'bg-space-accent/20 text-space-accent border-space-accent/30' :
              'bg-space-gray/20 text-space-light/70 border-space-light/20'
            } shadow-holo-sm`}
          >
            {question.phase}
          </Badge>
          <div className="text-space-light/80 whitespace-nowrap bg-space-darkBlue/30 px-2 py-0.5 rounded border border-space/10 text-xs">
            {formatDate(question.createdTimestamp)}
          </div>
          <div className="text-space whitespace-nowrap bg-space-darkBlue/30 px-2 py-0.5 rounded border border-space/10 text-xs font-medium">
            {formatBond(question.currentBond, question)}
          </div>
        </div>
      </div>
    </div>
  );
}
