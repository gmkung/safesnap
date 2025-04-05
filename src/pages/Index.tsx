import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { namehash, normalize } from 'viem/ens';
import { useParams } from 'react-router-dom';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { QuestionList } from '../components/QuestionList';

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

        // Process questions as they come in
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

  // Calculate paginated questions
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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

      {/* Loading state */}
      {isLoading && questions.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      )}

      {/* Progress indicator */}
      {progress.total > 0 && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <div className="text-sm text-gray-600">
            <div>Loading questions: {progress.processed} / {progress.total}</div>
            {progress.failed > 0 && (
              <div className="text-yellow-500">Failed to process: {progress.failed}</div>
            )}
            {progress.lastTimestamp && (
              <div className="text-gray-400">
                Last update: {new Date(progress.lastTimestamp * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
