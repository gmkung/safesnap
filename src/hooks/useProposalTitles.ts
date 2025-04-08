
import { useState, useEffect } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { parseQuestionData } from '@/utils/questionUtils';

export function useProposalTitles(questions: Question[]) {
  const [proposalTitles, setProposalTitles] = useState<Record<string, string>>({});
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProposalTitles = async () => {
      for (const question of questions) {
        const parsedData = parseQuestionData(question);
        if (parsedData?.proposalId) {
          const proposalId = parsedData.proposalId;
          
          if (proposalTitles[proposalId] || loadingProposals[proposalId]) continue;
          
          setLoadingProposals(prev => ({ ...prev, [proposalId]: true }));
          
          try {
            const proposalData = await getProposalDetails(proposalId);
            setProposalTitles(prev => ({ 
              ...prev, 
              [proposalId]: proposalData.title 
            }));
          } catch (error) {
            console.error(`Error fetching proposal ${proposalId}:`, error);
          } finally {
            setLoadingProposals(prev => ({ ...prev, [proposalId]: false }));
          }
        }
      }
    };

    fetchProposalTitles();
  }, [questions, proposalTitles, loadingProposals]);

  return { proposalTitles, loadingProposals };
}
