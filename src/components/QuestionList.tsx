
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';

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

  const handleQuestionClick = (question: Question) => {
    navigate(`/question/${question.id}`, { state: { question } });
  };

  return (
    <Card className="tron-card max-w-5xl mx-auto">
      <div className="p-4 space-y-4">
        {/* Questions Table */}
        <div className="overflow-x-auto rounded-lg border border-tron-dark/30">
          <Table className="tron-table min-w-full divide-y divide-tron-dark/30">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-tron-gray/50 text-tron-light">Title</TableHead>
                <TableHead className="bg-tron-gray/50 text-tron-light">Status</TableHead>
                <TableHead className="bg-tron-gray/50 text-tron-light">Created</TableHead>
                <TableHead className="bg-tron-gray/50 text-tron-light">Bond</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-tron-dark/20 bg-tron-black/20">
              {/* Loading state with animated rows */}
              {isLoading && (
                <>
                  {Array(5).fill(0).map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-3/4 bg-tron-dark/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 bg-tron-dark/30 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-tron-dark/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 bg-tron-dark/30" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              {/* Empty state */}
              {!isLoading && questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-tron-light/70">
                    <div className="flex flex-col items-center">
                      <Loader className="h-10 w-10 text-tron-light/40 mb-4 animate-pulse" />
                      <p>No questions available yet.</p>
                      <p className="text-sm mt-2">Questions will appear here as they load.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Actual questions */}
              {!isLoading && questions.map((question) => (
                <TableRow 
                  key={question.id}
                  onClick={() => handleQuestionClick(question)}
                  className="transition-colors duration-200 hover:bg-tron-dark/20 cursor-pointer"
                >
                  <TableCell className="font-medium text-tron-light">
                    {question.title}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-tron-light/70">
                    {formatDate(question.createdTimestamp)}
                  </TableCell>
                  <TableCell className="text-tron-light/70">
                    {question.currentBond}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Only show pagination when we have questions */}
        {questions.length > 0 && (
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
        )}
      </div>
    </Card>
  );
}
