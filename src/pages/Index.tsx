import { useEffect, useState } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<QuestionProgress>({
    total: 0,
    processed: 0,
    failed: 0
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setQuestions([]);
        setProgress({ total: 0, processed: 0, failed: 0 });

        // Keep track of accumulated questions
        let accumulatedQuestions: Question[] = [];

        await retrieveQuestions(
          1, // Ethereum mainnet
          { 
            batchSize: 100, // Outer batch size for API calls
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
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RealityETH Questions</h1>

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
            <div className="text-center py-8 text-gray-500">No questions found</div>
          )}
        </>
      )}
    </div>
  );
}
