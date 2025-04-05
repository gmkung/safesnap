
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { formatUnits } from 'viem';
import { ChevronLeft, ChevronRight, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CardSkeleton } from './ui/skeleton';

interface QuestionListProps {
  questions: Question[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  totalQuestions: number;
}

const ITEMS_PER_PAGE = 20;

export function QuestionList({ questions, currentPage, onPageChange, isLoading, totalQuestions }: QuestionListProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);

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

  const handleQuestionClick = (question: Question) => {
    navigate(`/question/${question.id}`, { state: { question } });
  };

  // Show skeletons while loading
  if (isLoading && questions.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {Array(6).fill(0).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Questions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((question) => {
          const parsedData = parseQuestionData(question);
          
          return (
            <Card 
              key={question.id} 
              className={cn(
                "steel-panel transition-all duration-300 hover:translate-y-[-5px] hover:shadow-holo cursor-pointer",
                "animate-float"
              )}
              onClick={() => handleQuestionClick(question)}
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  {parsedData?.dao && (
                    <div className="text-space font-medium text-sm">
                      DAO: {parsedData.dao}
                    </div>
                  )}
                  <Badge 
                    className={cn(
                      "ml-auto",
                      question.phase === 'OPEN' ? 'bg-space/20 text-space border-space/30' : 
                      question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                      question.phase === 'FINALIZED' ? 'bg-tron-blue/20 text-tron-blue border-tron-blue/30' :
                      'bg-space-gray/20 text-space-light/70 border-space-light/20'
                    )}
                  >
                    {question.phase}
                  </Badge>
                </div>
                
                {parsedData && (
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">
                      <span className="text-space-light/70">Proposal ID:</span>
                      <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-xs overflow-hidden text-ellipsis block whitespace-nowrap">
                        {parsedData.proposalId}
                      </code>
                    </div>
                    <div className="text-sm">
                      <span className="text-space-light/70">Transaction Array Hash:</span>
                      <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-xs overflow-hidden text-ellipsis block whitespace-nowrap">
                        {parsedData.transactionHash}
                      </code>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center text-space-light/70">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(question.createdTimestamp)}
                  </div>
                  <div className="flex items-center text-space-light/70">
                    <Tag className="h-3 w-3 mr-1" />
                    {formatBond(question.currentBond, question)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-5 py-3 border-t border-space-dark/30 flex justify-end">
                <Button variant="tron" size="sm" className="text-xs group">
                  View Details
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-space-dark/30 px-4 py-3 steel-panel rounded-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="tron"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="tron"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-space-light/70">
              Showing <span className="font-medium text-space-light">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
              <span className="font-medium text-space-light">{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)}</span> of{' '}
              <span className="font-medium text-space-light">{totalQuestions}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="tron"
                className="rounded-l-md p-2"
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
                      variant={currentPage === pageNum ? "default" : "tron"}
                      className={cn(
                        "border-space/20",
                        currentPage === pageNum ? 'bg-space hover:bg-space/90' : ''
                      )}
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
                variant="tron"
                className="rounded-r-md p-2"
                size="icon"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
