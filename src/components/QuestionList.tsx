
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { QuestionRowSkeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { formatUnits } from 'viem';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const formatTitle = (question: Question) => {
    const parsedData = parseQuestionData(question);
    if (!parsedData) return question.title;

    return (
      <div className="space-y-2">
        {parsedData.dao && (
          <div className="text-blue-600 text-sm font-medium">
            DAO: {parsedData.dao}
          </div>
        )}
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-600">Proposal ID:</span>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
              {parsedData.proposalId}
            </code>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Transaction Array Hash:</span>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
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
      <Card className="max-w-5xl mx-auto shadow-md">
        <div className="p-4">
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <QuestionRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto shadow-md">
      <div className="p-4 space-y-4">
        {/* Questions List */}
        <div className="space-y-3">
          {questions.map((question) => (
            <div 
              key={question.id}
              onClick={() => handleQuestionClick(question)}
              className="rounded-lg border bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-4"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {formatTitle(question)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center justify-between md:justify-end">
                  <Badge 
                    className={`${
                      question.phase === 'OPEN' ? 'bg-green-100 text-green-800 border-green-300' : 
                      question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      question.phase === 'FINALIZED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {question.phase}
                  </Badge>
                  <div className="text-gray-600 whitespace-nowrap">
                    {formatDate(question.createdTimestamp)}
                  </div>
                  <div className="text-gray-600 whitespace-nowrap">
                    {formatBond(question.currentBond, question)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">({(currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)}</span> of{' '}
                <span className="font-medium">{totalQuestions}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
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
                        variant={currentPage === pageNum ? "default" : "outline"}
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
    </Card>
  );
}
