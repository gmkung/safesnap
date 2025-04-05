
import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { namehash, normalize } from 'viem/ens';
import { useParams } from 'react-router-dom';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { QuestionList } from '../components/QuestionList';
import { Progress } from '@/components/ui/progress';

const ENS_RESOLVER_ADDRESS = '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63';

const ITEMS_PER_PAGE = 20;

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

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

  const { '*': ensPath } = useParams();
  const ensName = ensPath || null;

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

        if (ensName) {
          try {
            const normalizedName = normalize(ensName);
            const node = namehash(normalizedName);
            console.log(`Namehash for ${ensName}:`, node);

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

        for await (const question of retrieveQuestions(
          1, // Ethereum mainnet
          {
            batchSize: 100,
            ...(userFilter && { user: userFilter })
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-tron text-glow">
        RealityETH Questions
        {ensName && <span className="text-muted-foreground ml-2">for {ensName}</span>}
      </h1>

      {error ? (
        <div className="text-red-500 tron-card p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {error}
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

      {isLoading && questions.length === 0 && (
        <div className="tron-card p-8 text-center">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-tron border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-r-tron border-t-transparent border-b-transparent border-l-transparent animate-spin animation-delay-200" style={{animationDelay: "0.2s"}}></div>
            <div className="absolute inset-0 rounded-full border-4 border-b-tron border-t-transparent border-r-transparent border-l-transparent animate-spin animation-delay-400" style={{animationDelay: "0.4s"}}></div>
          </div>
          <p className="mt-4 text-tron text-glow animate-pulse">Loading questions...</p>
        </div>
      )}

      {progress.total > 0 && (
        <div className="mt-6 p-4 tron-card">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing questions</span>
              <span>{progress.processed} / {progress.total}</span>
            </div>
            <Progress value={(progress.processed / progress.total) * 100} />
            
            {progress.failed > 0 && (
              <div className="text-amber-500 text-xs mt-1">
                Failed to process: {progress.failed}
              </div>
            )}
            {progress.lastTimestamp && (
              <div className="text-muted-foreground text-xs mt-1">
                Last update: {new Date(progress.lastTimestamp * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
