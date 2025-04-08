import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { useParams } from 'react-router-dom';
import { QuestionList } from '../components/QuestionList';
import { Progress } from '@/components/ui/progress';

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<QuestionProgress>({
    total: 0,
    processed: 0,
    failed: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Get ENS name from URL path
  const { '*': ensPath } = useParams();
  const ensName = ensPath || null;

  // Log when ENS is detected
  useEffect(() => {
    if (ensName) {
      console.log('🔍 DAO name detected in URL:', ensName);
    } else {
      console.log('📄 No DAO name in URL - showing all questions');
    }
  }, [ensName]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setQuestions([]);
        setProgress({ total: 0, processed: 0, failed: 0 });

        // Process questions as they come in
        for await (const question of retrieveQuestions(
          1, // Ethereum mainnet
          {
            batchSize: 100,
            ...(ensName && { qTitle: ensName }),
            arbitrator: '0xf72cfd1b34a91a64f9a98537fe63fbab7530adca'
          },
          (progress) => {
            setProgress(progress);
          }
        )) {
          setQuestions(prev => [...prev, question]);
        }

        setError(null);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [ensName]);

  // Calculate paginated questions
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

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
      {ensName && (
        <div className="mb-6 text-xl">
          <span className="bg-space-dark/60 text-space px-3 py-1 rounded-md border border-space/30 shadow-holo">
            {ensName}
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
          totalQuestions={questions.length}
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
