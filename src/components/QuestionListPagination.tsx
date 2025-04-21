
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handlePageChange = (page: number) => {
    // Preserve existing search params while updating the page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    
    // Update URL with the new page parameter
    navigate(`?${newParams.toString()}`, { replace: true });
    
    // Call the onPageChange handler
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show page 1
    pages.push(1);
    
    // Calculate the range of pages to show
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 3, 2);
    }
    
    // Add ellipsis after page 1 if needed
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Add last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col space-y-2 pt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageChange(Number(page))}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-xs text-space-light/70 text-center">
        Showing <span className="font-medium text-space">
          {totalQuestions === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}
        </span> to{' '}
        <span className="font-medium text-space">
          {Math.min(currentPage * itemsPerPage, totalQuestions)}
        </span> of{' '}
        <span className="font-medium text-space">
          {totalQuestions}
        </span> results
      </div>
    </div>
  );
}
