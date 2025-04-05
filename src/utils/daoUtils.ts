
import { Question } from 'reality-kleros-subgraph';

/**
 * Extract DAO name from a question
 * @param question The question object
 * @returns The DAO name or null if not found
 */
export function extractDaoName(question: Question): string | null {
  // Try to extract from title first - common format: "Did the Snapshot proposal ... in the {dao}.eth space pass ..."
  const daoMatch = question.title.match(/in the ([a-zA-Z0-9]+\.eth) space/i);
  if (daoMatch) return daoMatch[1].toLowerCase();
  
  // If not found in title, try to parse from the data
  const parts = question.data.split('␟');
  if (parts.length >= 3) {
    // Sometimes the DAO name is in the third part
    const potentialDao = parts[2].trim();
    if (potentialDao.endsWith('.eth')) return potentialDao.toLowerCase();
  }
  
  return null;
}

/**
 * Check if a question belongs to a specific DAO
 * @param question The question object
 * @param daoEns The DAO ENS name to match
 * @returns True if the question belongs to the DAO
 */
export function questionBelongsToDao(question: Question, daoEns: string): boolean {
  if (!daoEns) return true; // If no DAO filter, include all questions
  
  const normalizedDaoEns = daoEns.toLowerCase();
  const extractedDao = extractDaoName(question);
  
  return extractedDao === normalizedDaoEns;
}
