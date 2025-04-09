
// Central configuration file for chain-related constants
export const CHAIN_ID = 1; // Ethereum mainnet
export const CHAIN_NAME = "mainnet";

// Function to get Reality.eth URL for a question
export function getRealityEthUrl(question: { id: string; contract?: { address: string } }): string {
  // Extract contract address and questionId parts
  const contractAddress = question.contract?.address || "";
  
  // Format: https://reality.eth.limo/app/index.html#!/network/[chainId]/question/{question.contract}-{question.questionId}
  return `https://reality.eth.limo/app/index.html#!/network/${CHAIN_ID}/question/${contractAddress}-${question.id}`;
}
