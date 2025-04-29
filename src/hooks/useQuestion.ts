
import { useState, useEffect } from 'react';
import { Question, retrieveQuestions } from 'reality-kleros-subgraph';
import { CHAIN_ID } from '@/config/chainConfig';

export async function fetchQuestion(chainId: number, questionId: string): Promise<Question | null> {
  try {
    // Use the retrieveQuestions generator but filter by specific question ID
    for await (const question of retrieveQuestions(chainId, {
      questionId: questionId,
      batchSize: 1,
      arbitrator: '0xf72cfd1b34a91a64f9a98537fe63fbab7530adca'
    })) {
      if (question.id === questionId) {
        return question;
      }
    }
    
    // If we didn't find the question
    return null;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}

export function useQuestion(questionId: string | undefined) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestion = async () => {
      if (!questionId) {
        setQuestion(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const questionData = await fetchQuestion(CHAIN_ID, questionId);
        
        if (questionData) {
          setQuestion(questionData);
          setError(null);
        } else {
          setQuestion(null);
          setError('Question not found');
        }
      } catch (err) {
        console.error('Error loading question:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question');
        setQuestion(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [questionId]);

  return { question, isLoading, error };
}
