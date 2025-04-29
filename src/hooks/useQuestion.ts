
import { useState, useEffect } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { CHAIN_ID } from '@/config/chainConfig';
import { fetchQuestion } from '@/utils/questionUtils';

export function useQuestion(questionId: string | undefined) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!questionId);
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

    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  return { question, isLoading, error };
}
