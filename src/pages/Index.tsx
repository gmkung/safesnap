import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QuestionList } from '../components/QuestionList';
import { Progress } from '@/components/ui/progress';
import { useQuestions } from '@/hooks/useQuestions';
import { QuestionPhaseValue } from '../components/StatusFilter';

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam, 10) : 1);
  
  // Get ENS name or DAO name from URL path
  const { '*': pathParam } = useParams();
  const navigate = useNavigate();
  
  // Get status filters from URL
  const statusParamString = searchParams.get('statuses');
  const statusFilters = statusParamString 
    ? statusParamString.split(',').filter(s => ["NOT_CREATED", "UPCOMING", "OPEN", "PENDING_ARBITRATION", "FINALIZED"].includes(s)) as QuestionPhaseValue[]
    : [];

  // Parse the filter param from the path
  // This handles both /ens/DAOName and direct /DAOName paths for backward compatibility
  let filterParam = pathParam || null;
  
  // Check if the path doesn't already start with 'ens/' but is still a valid filter
  if (filterParam && !filterParam.startsWith('ens/')) {
    // For backward compatibility, treat direct DAO names as filters too
    console.log('Using direct path filter:', filterParam);
  } else if (filterParam && filterParam.startsWith('ens/')) {
    // Extract the actual DAO name from the ens/ prefix
    filterParam = filterParam.substring(4);
    console.log('Using ens/ path filter:', filterParam);
  }
  
  const { questions, isLoading, error, progress } = useQuestions(filterParam);
  
  // Update URL when page changes
  useEffect(() => {
    if (pageParam && parseInt(pageParam, 10) !== currentPage) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  }, [pageParam, currentPage]);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    if (filterParam || statusFilters.length > 0) {
      // Only reset page if filter changes, while preserving it in other cases
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams);
      setCurrentPage(1);
    }
  }, [filterParam, statusFilters.join(',')]);

  // Log when filter is detected
  useEffect(() => {
    if (filterParam) {
      console.log('🔍 Filter detected in URL:', filterParam);
    } else {
      console.log('📄 No filter in URL - showing all questions');
    }
    
    if (statusFilters.length > 0) {
      console.log('🏷️ Status filters:', statusFilters);
    }
  }, [filterParam, statusFilters]);

  // Filter questions based on status
  const filteredQuestions = statusFilters.length > 0
    ? questions.filter(q => statusFilters.includes(q.phase as QuestionPhaseValue))
    : questions;

  // Calculate paginated questions
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Calculate progress percentage
  const progressPercentage = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  return (
    <div>
      {filterParam && (
        <div className="mb-6 text-xl">
          <span className="bg-space-dark/60 text-space px-3 py-1 rounded-md border border-space/30 shadow-holo">
            {filterParam}
          </span>
        </div>
      )}

      {statusFilters.length > 0 && (
        <div className="mb-6 text-sm">
          <span className="text-space-accent">
            Filtering by: {statusFilters.join(', ')}
          </span>
        </div>
      )}

      {error ? (
        <div className="text-destructive bg-destructive/10 p-4 rounded-md border border-destructive/30">
          <p className="font-medium">Error</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : (
        <QuestionList
          questions={paginatedQuestions}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          totalQuestions={filteredQuestions.length}
        />
      )}

      {/* Loading state with Tron-styled Progress */}
      {isLoading && (
        <div className="mt-6 max-w-3xl mx-auto space-y-3 bg-space-dark/20 p-4 rounded-lg border border-space/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-space font-medium">Loading questions: {progress.processed} / {progress.total}</span>
            <span className="text-sm text-space font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {progress.failed > 0 && (
            <div className="text-amber-500 text-sm mt-1 flex items-center space-x-2">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span>Failed to process: {progress.failed}</span>
            </div>
          )}
          {progress.lastTimestamp && (
            <div className="text-space-accent/60 text-xs">
              Last update: {new Date(progress.lastTimestamp * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
