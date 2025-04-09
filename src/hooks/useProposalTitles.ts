
import { useState, useEffect, useRef } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { parseQuestionData } from '@/utils/questionUtils';

export function useProposalTitles(questions: Question[]) {
  const [proposalTitles, setProposalTitles] = useState<Record<string, string>>({});
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});
  const inProgressRequests = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchProposalTitles = async () => {
      const uniqueProposalIds = new Set<string>();
      
      // First collect all unique proposal IDs that we don't already have
      for (const question of questions) {
        const parsedData = parseQuestionData(question);
        if (parsedData?.proposalId) {
          const proposalId = parsedData.proposalId;
          
          // Skip if we already have the title or are already loading it
          if (proposalTitles[proposalId] || loadingProposals[proposalId] || inProgressRequests.current.has(proposalId)) {
            continue;
          }
          
          uniqueProposalIds.add(proposalId);
        }
      }
      
      // Then fetch them with proper rate limiting
      const fetchWithDelay = async (proposalId: string, index: number) => {
        // Add delay to spread out requests
        const staggerDelay = index * 200; // 200ms between requests
        if (staggerDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, staggerDelay));
        }
        
        if (inProgressRequests.current.has(proposalId)) {
          return; // Don't make duplicate requests
        }
        
        inProgressRequests.current.add(proposalId);
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
          inProgressRequests.current.delete(proposalId);
        }
      };
      
      // Fetch proposals sequentially with staggers instead of all at once
      Array.from(uniqueProposalIds).forEach((proposalId, index) => {
        fetchWithDelay(proposalId, index);
      });
    };

    fetchProposalTitles();
  }, [questions]); // Removed dependencies that would cause too many effect runs

  return { proposalTitles, loadingProposals };
}
