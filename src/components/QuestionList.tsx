
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { QuestionRowSkeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { formatUnits } from 'viem';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { parseQuestionData } from '@/utils/questionUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface QuestionListProps {
  questions: Question[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  totalQuestions: number;
}

const ITEMS_PER_PAGE = 10;

export function QuestionList({ questions, currentPage, onPageChange, isLoading, totalQuestions }: QuestionListProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);
  const [proposalTitles, setProposalTitles] = useState<Record<string, string>>({});
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch proposal titles for each question
    const fetchProposalTitles = async () => {
      for (const question of questions) {
        const parsedData = parseQuestionData(question);
        if (parsedData?.proposalId) {
          const proposalId = parsedData.proposalId;
          
          // Skip if already loaded or loading
          if (proposalTitles[proposalId] || loadingProposals[proposalId]) continue;
          
          // Mark as loading
          setLoadingProposals(prev => ({ ...prev, [proposalId]: true }));
          
          try {
            const proposalData = await getProposalDetails(proposalId);
            setProposalTitles(prev => ({ 
              ...prev, 
              [proposalId]: proposalData.title 
            }));
          } catch (error) {
            console.error(`Error fetching proposal ${proposalId}:`, error);
          } finally {
            setLoadingProposals(prev => ({ ...prev, [proposalId]: false }));
          }
        }
      }
    };

    fetchProposalTitles();
  }, [questions]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatBond = (bond: string, question: Question) => {
    if (!question?.contract?.config) return `${bond} ETH`;

    try {
      // Convert from wei to the appropriate unit
      const formattedAmount = formatUnits(BigInt(bond), 18);
      return `${formattedAmount} ${question.contract.config.token_ticker}`;
    } catch (error) {
      console.error('Error formatting bond:', error);
      return `${bond} ${question?.contract?.config?.token_ticker || 'ETH'}`;
    }
  };

  const parseQuestionData = (question: Question) => {
    const parts = question.data.split('␟');
    if (parts.length >= 2) {
      // Extract DAO name from the title - it's usually in the format "Did the Snapshot proposal ... in the {dao}.eth space pass ..."
      const daoMatch = question.title.match(/in the ([a-zA-Z0-9]+\.eth) space/);
      return {
        proposalId: parts[0],
        transactionHash: parts[1],
        dao: daoMatch ? daoMatch[1] : null
      };
    }
    return null;
  };

  const formatTitle = (question: Question) => {
    const parsedData = parseQuestionData(question);
    if (!parsedData) return question.title;

    const proposalId = parsedData.proposalId;
    const proposalTitle = proposalTitles[proposalId];
    
    return (
      <div className="space-y-2">
        {parsedData.dao && (
          <div className="text-space text-sm font-medium flex items-center">
            <span className="bg-space/10 px-2 py-0.5 rounded border border-space/20 shadow-holo-sm">
              {parsedData.dao}
            </span>
          </div>
        )}
        
        {/* Show original question title */}
        <div className="text-sm text-space-light/80">
          {question.title}
        </div>
        
        {/* Show proposal title if available */}
        {proposalTitle ? (
          <div className="text-lg font-medium text-space-light">
            {proposalTitle}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-sm flex items-center">
              <span className="text-space-light/70 font-medium min-w-24">Proposal ID:</span>
              <code className="ml-2 bg-space-darkBlue/50 border border-space/10 px-2 py-0.5 rounded text-xs font-mono text-space-light">
                {parsedData.proposalId}
              </code>
            </div>
            <div className="text-sm flex items-center">
              <span className="text-space-light/70 font-medium min-w-24">Tx Array Hash:</span>
              <code className="ml-2 bg-space-darkBlue/50 border border-space/10 px-2 py-0.5 rounded text-xs font-mono text-space-light overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-100px)]">
                {parsedData.transactionHash}
              </code>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleQuestionClick = (question: Question) => {
    navigate(`/question/${question.id}`, { state: { question } });
  };

  // Show skeletons while loading
  if (isLoading && questions.length === 0) {
    return (
      <Card className="tron-card max-w-5xl mx-auto bg-transparent">
        <div className="p-4">
          <div className="space-y-6">
            {Array(5).fill(0).map((_, i) => (
              <QuestionRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="tron-card max-w-5xl mx-auto bg-transparent backdrop-blur-sm">
        <div className="p-4 space-y-4">
          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question) => {
              const parsedData = parseQuestionData(question);
              const isLoadingProposal = parsedData?.proposalId ? loadingProposals[parsedData.proposalId] : false;
              
              return (
                <div 
                  key={question.id}
                  onClick={() => handleQuestionClick(question)}
                  className="rounded-lg border border-space/20 bg-space-darkBlue/30 transition-all duration-300 
                            hover:shadow-holo-lg hover:bg-space-darkBlue/40 cursor-pointer p-4 mb-6 relative
                            before:absolute before:inset-0 before:bg-gradient-to-r before:from-space/5 before:to-transparent 
                            before:rounded-lg before:-z-10 before:blur-md before:translate-y-1 before:translate-x-1
                            hover:translate-y-[-2px] hover:translate-x-[-1px] tron-scanner"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div className="flex-1 text-left">
                      <div className="font-medium text-space-light">
                        {formatTitle(question)}
                      </div>
                      
                      {isLoadingProposal && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-space rounded-full border-t-transparent"></div>
                          <span className="text-xs text-space-light/70">Loading proposal details...</span>
                        </div>
                      )}
                      
                      {parsedData?.proposalId && !isLoadingProposal && !proposalTitles[parsedData.proposalId] && (
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
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-space/20 px-4 py-3 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="holo-button"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                className="holo-button"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-space-light/70">
                  Showing <span className="font-medium text-space">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                  </span> to{' '}
                  <span className="font-medium text-space">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)}
                  </span> of{' '}
                  <span className="font-medium text-space">
                    {totalQuestions}
                  </span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-space-darkBlue/30 border border-space/20" aria-label="Pagination">
                  <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="rounded-l-md holo-button border-0 p-2"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Show limited page numbers with ellipsis */}
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Calculate which pages to show
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          className={`holo-button border-0 ${currentPage === pageNum ? 'bg-space hover:bg-space/90 text-space-dark' : ''}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  
                  <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="rounded-r-md holo-button border-0 p-2"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
