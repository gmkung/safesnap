
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function QuestionListPagination({ 
  currentPage, 
  totalPages, 
  totalQuestions, 
  itemsPerPage, 
  onPageChange 
}: QuestionListPaginationProps) {
  return (
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
              {((currentPage - 1) * itemsPerPage) + 1}
            </span> to{' '}
            <span className="font-medium text-space">
              {Math.min(currentPage * itemsPerPage, totalQuestions)}
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
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
  );
}
