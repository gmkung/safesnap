import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';
import { namehash, normalize } from 'viem/ens';
import { useParams } from 'react-router-dom';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// ENS Resolver contract address
const ENS_RESOLVER_ADDRESS = '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63';


// Create Viem public client
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

  // Get ENS name from URL path
  const { '*': ensPath } = useParams();
  const ensName = ensPath || null;  // If we have a path under /ens/*, use it directly

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
              userFilter = textRecord.toLowerCase(); // Ensure lowercase for consistency
              console.log('Using user filter:', userFilter);
            }
          } catch (err) {
            console.error('Error fetching ENS text record:', err);
            setError(`Failed to fetch ENS data for ${ensName}`);
            return;
          }
        }

        // Keep track of accumulated questions
        let accumulatedQuestions: Question[] = [];

        await retrieveQuestions(
          1, // Ethereum mainnet
          { 
            batchSize: 100,
            ...(userFilter && { user: userFilter }) // Changed from user to arbitrator
          },
          (progress) => {
            setProgress(progress);
            // Get new questions since last update
            const newQuestions = accumulatedQuestions.slice(questions.length, progress.processed);
            if (newQuestions.length > 0) {
              setQuestions(prev => [...prev, ...newQuestions]);
            }
          }
        ).then(fetchedQuestions => {
          accumulatedQuestions = fetchedQuestions;
          setQuestions(fetchedQuestions);
        });

        setError(null);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [ensName]); // Re-run when ENS name changes

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        RealityETH Questions
        {ensName && <span className="text-gray-600 ml-2">for {ensName}</span>}
      </h1>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {/* Progress indicator */}
          {progress.total > 0 && (
            <div className="mb-4 p-2 bg-gray-100 rounded">
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

          {/* Questions display */}
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="border p-4 rounded-lg">
                <h2 className="text-xl font-semibold">{question.title}</h2>
                <p className="text-gray-600 mt-2">{question.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {question.phase}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Current Answer:</span> {question.currentAnswer}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Time Remaining:</span> {question.timeRemaining}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Created:</span> {new Date(question.createdTimestamp * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && questions.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading questions...</p>
            </div>
          )}

          {/* No results */}
          {!isLoading && questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {ensName ? `No questions found for ${ensName}` : 'No questions found'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
