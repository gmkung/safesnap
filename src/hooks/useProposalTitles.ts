
import { useState, useEffect, useRef } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { parseQuestionData } from '@/utils/questionUtils';
import { toast } from '@/hooks/use-toast';

export function useProposalTitles(questions: Question[]) {
  const [proposalTitles, setProposalTitles] = useState<Record<string, string>>({});
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});
  const inProgressRequests = useRef<Set<string>>(new Set());
  const erroredProposals = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchProposalTitles = async () => {
      const uniqueProposalIds = new Set<string>();
      
      // First collect all unique proposal IDs that we don't already have
      for (const question of questions) {
        try {
          const parsedData = parseQuestionData(question);
          if (parsedData?.proposalId) {
            const proposalId = parsedData.proposalId;
            
            // Skip if we already have the title or are already loading it
            if (proposalTitles[proposalId] || loadingProposals[proposalId] || inProgressRequests.current.has(proposalId) || erroredProposals.current.has(proposalId)) {
              continue;
            }
            
            uniqueProposalIds.add(proposalId);
          }
        } catch (error) {
          console.error("Error parsing question data:", error);
          // Continue to the next question if there's an error parsing this one
          continue;
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
          
          if (proposalData && proposalData.title) {
            setProposalTitles(prev => ({ 
              ...prev, 
              [proposalId]: proposalData.title 
            }));
          } else {
            // Handle case where proposal data is null or missing title
            console.warn(`Proposal ${proposalId} returned data without a title`);
            erroredProposals.current.add(proposalId);
          }
        } catch (error) {
          console.error(`Error fetching proposal ${proposalId}:`, error);
          erroredProposals.current.add(proposalId);
          
          // Display a toast only for the first few errors to avoid spamming
          if (erroredProposals.current.size <= 3) {
            toast({
              title: "Error loading proposal",
              description: `Failed to load proposal ${proposalId.slice(0, 8)}...`,
              variant: "destructive"
            });
          }
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
