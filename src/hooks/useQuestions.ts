
import { useState, useEffect } from 'react';
import { retrieveQuestions, Question, QuestionProgress } from 'reality-kleros-subgraph';

export function useQuestions(ensName?: string | null) {
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

  return { questions, isLoading, error, progress };
}
