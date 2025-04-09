
// Central configuration file for chain-related constants
export const CHAIN_ID = 1; // Ethereum mainnet
export const CHAIN_NAME = "mainnet";

// Function to get Reality.eth URL for a question
export function getRealityEthUrl(questionId: string): string {
  return `https://reality.eth.limo/app/index.html#!/network/${CHAIN_ID}/question/${questionId}`;
}
