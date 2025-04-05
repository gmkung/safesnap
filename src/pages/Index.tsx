
import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { namehash, normalize } from 'viem/ens';
import { useParams } from 'react-router-dom';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { QuestionList } from '../components/QuestionList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader, AlertCircle } from 'lucide-react';

// ENS Resolver contract address
const ENS_RESOLVER_ADDRESS = '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63';

// Create Viem public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

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
      console.log('🔍 ENS name detected in URL:', ensName);
    } else {
      console.log('📄 No ENS name in URL - showing all questions');
    }
  }, [ensName]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setQuestions([]);
        setProgress({ total: 0, processed: 0, failed: 0 });

        let userFilter: string | undefined;

        // If we have an ENS name, get the SafeSnap text record
        if (ensName) {
          try {
            // Calculate namehash
            const normalizedName = normalize(ensName);
            const node = namehash(normalizedName);
            console.log(`Namehash for ${ensName}:`, node);

            // Call ENS resolver contract
            const textRecord = await publicClient.readContract({
              address: ENS_RESOLVER_ADDRESS,
              abi: [{
                name: 'text',
                type: 'function',
                inputs: [
                  { name: 'node', type: 'bytes32' },
                  { name: 'key', type: 'string' }
                ],
                outputs: [{ type: 'string' }],
                stateMutability: 'view'
              }],
              functionName: 'text',
              args: [node, 'SafeSnap']
            });

            console.log('SafeSnap text record:', textRecord);
            if (textRecord) {
              userFilter = textRecord.toLowerCase();
              console.log('Using user filter:', userFilter);
            }
          } catch (err) {
            console.error('Error fetching ENS text record:', err);
            setError(`Failed to fetch ENS data for ${ensName}`);
            return;
          }
        }

        // Initialize batch handler to update questions as they're processed
        let accumulatedQuestions: Question[] = [];
        
        await retrieveQuestions(
          1, // Ethereum mainnet
          {
            batchSize: 100,
            ...(userFilter && { user: userFilter })
          },
          (progress) => {
            setProgress(progress);
            
            // Get new questions since last update
            if (progress.processed > accumulatedQuestions.length) {
              // We have new questions to show
              const newBatchSize = progress.processed - accumulatedQuestions.length;
              console.log(`Received ${newBatchSize} new questions`);
              
              // This will trigger a re-render with the currently available questions
              // without waiting for the full retrieval to complete
              setIsLoading(progress.processed < progress.total);
            }
          }
        ).then(fetchedQuestions => {
          accumulatedQuestions = fetchedQuestions;
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        });

        setError(null);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [ensName]);

  // Update the questions array with new batch data as it comes in
  useEffect(() => {
    if (progress.processed > questions.length && progress.processed > 0) {
      console.log(`Updating questions display with ${progress.processed} questions`);
      
      // Only fetch a new batch if we have significantly more processed questions
      if (progress.processed >= questions.length + 20 || progress.processed === progress.total) {
        console.log('Refreshing questions from accumulated data');
        
        // Retrieve the currently accumulated questions again
        retrieveQuestions(
          1,
          {
            batchSize: progress.processed,
            ...(ensName && { user: ensName })
          }
        ).then(batchQuestions => {
          setQuestions(batchQuestions);
        }).catch(err => {
          console.error('Error getting batch update:', err);
        });
      }
    }
  }, [progress, questions.length, ensName]);

  // Calculate paginated questions
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-tron text-glow">
          RealityETH Questions
          {ensName && <span className="text-tron-light/70 ml-2 text-xl">for {ensName}</span>}
        </h1>
        <p className="text-tron-light/60">
          Browse and interact with questions on the RealityETH platform
        </p>
      </div>

      {error ? (
        <Card className="tron-card border-red-500/30 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-red-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <QuestionList
          questions={paginatedQuestions}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading && questions.length === 0}
          totalQuestions={questions.length}
        />
      )}

      {/* Only show loading state when no questions are loaded yet */}
      {isLoading && questions.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-tron border-t-transparent mx-auto mb-4 shadow-tron"></div>
          <p className="text-tron animate-pulse">Loading questions...</p>
        </div>
      )}

      {/* Progress indicator - always show when loading is in progress */}
      {progress.total > 0 && (
        <Card className="tron-card mt-6 max-w-md mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading Progress
            </CardTitle>
            <CardDescription className="text-xs">
              {progress.processed} of {progress.total} questions loaded
              {!isLoading && progress.processed > 0 && ' (completed)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(progress.processed / progress.total) * 100} 
              className="h-2 tron-progress-container"
            />
            
            <div className="mt-3 text-xs text-tron-light/60 grid grid-cols-2 gap-2">
              <div>
                Processed: <span className="text-tron">{progress.processed}</span>
              </div>
              {progress.failed > 0 && (
                <div className="text-amber-400">
                  Failed: {progress.failed}
                </div>
              )}
              {progress.lastTimestamp && (
                <div className="col-span-2">
                  Last update: {new Date(progress.lastTimestamp * 1000).toLocaleTimeString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
