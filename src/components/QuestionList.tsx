
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { QuestionRowSkeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { formatUnits } from 'viem';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { extractDaoName } from '@/utils/daoUtils';

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
      // Extract DAO name using our utility function
      const dao = extractDaoName(question);
      return {
        proposalId: parts[0],
        transactionHash: parts[1],
        dao
      };
    }
    return null;
  };

  const formatTitle = (question: Question) => {
    const parsedData = parseQuestionData(question);
    if (!parsedData) return question.title;

    return (
      <div className="space-y-2">
        {parsedData.dao && (
          <div className="text-tron text-sm font-medium">
            DAO: <span 
              className="cursor-pointer hover:underline" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dao/${parsedData.dao}`);
              }}
            >
              {parsedData.dao}
            </span>
          </div>
        )}
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-tron-light/70">Proposal ID:</span>
            <code className="ml-2 bg-tron-dark/30 px-2 py-1 rounded text-xs">
              {parsedData.proposalId}
            </code>
          </div>
          <div className="text-sm">
            <span className="text-tron-light/70">Transaction Array Hash:</span>
            <code className="ml-2 bg-tron-dark/30 px-2 py-1 rounded text-xs">
              {parsedData.transactionHash}
            </code>
          </div>
        </div>
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
    <Card className="tron-card max-w-5xl mx-auto bg-transparent backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question) => (
            <div 
              key={question.id}
              onClick={() => handleQuestionClick(question)}
              className="rounded-lg border border-tron-dark/30 bg-tron-black/20 transition-all duration-300 hover:shadow-holo-lg hover:bg-tron-dark/20 cursor-pointer p-4 mb-6 relative
                        before:absolute before:inset-0 before:bg-gradient-to-r before:from-tron/5 before:to-transparent before:rounded-lg before:-z-10 before:blur-md before:translate-y-1 before:translate-x-1
                        hover:translate-y-[-2px] hover:translate-x-[-1px]"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex-1 text-left">
                  <div className="font-medium text-tron-light">
                    {formatTitle(question)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center justify-between md:justify-end">
                  <Badge 
                    className={`${
                      question.phase === 'OPEN' ? 'bg-tron/20 text-tron border-tron/30' : 
                      question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                      question.phase === 'FINALIZED' ? 'bg-tron-blue/20 text-tron-blue border-tron-blue/30' :
                      'bg-tron-gray/20 text-tron-light/70 border-tron-light/20'
                    }`}
                  >
                    {question.phase}
                  </Badge>
                  <div className="text-tron-light/70 whitespace-nowrap">
                    {formatDate(question.createdTimestamp)}
                  </div>
                  <div className="text-tron-light/70 whitespace-nowrap">
                    {formatBond(question.currentBond, question)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-tron-dark/30 px-4 py-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="tron-button"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="tron-button"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-tron-light/70">
                Showing <span className="font-medium text-tron-light">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                <span className="font-medium text-tron-light">{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)}</span> of{' '}
                <span className="font-medium text-tron-light">{totalQuestions}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="rounded-l-md tron-button p-2"
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
                        className={`tron-button ${currentPage === pageNum ? 'bg-tron hover:bg-tron/90' : ''}`}
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
                  className="rounded-r-md tron-button p-2"
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
  );
}
