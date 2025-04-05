import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { useParams } from 'react-router-dom';
import { QuestionList } from '../components/QuestionList';
import { Progress } from '@/components/ui/progress';

const ITEMS_PER_PAGE = 20;

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        RealityETH Questions
        {ensName && <span className="text-gray-600 ml-2">for {ensName}</span>}
      </h1>

      {error ? (
        <div className="text-red-500">{error}</div>
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
        <div className="mt-6 max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-tron">Loading questions: {progress.processed} / {progress.total}</span>
            <span className="text-sm text-tron">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {progress.failed > 0 && (
            <div className="text-yellow-500 text-sm mt-1">Failed to process: {progress.failed}</div>
          )}
          {progress.lastTimestamp && (
            <div className="text-tron/60 text-xs">
              Last update: {new Date(progress.lastTimestamp * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
