import { ethers } from 'ethers';

// Simple in-memory cache for proposals
const proposalCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

interface SnapshotProposal {
    id: string;
    ipfs: string;
    title: string;
    body: string;
    discussion: string;
    choices: string[];
    labels: string[];
    start: number;
    end: number;
    snapshot: string;
    state: string;
    author: string;
    created: number;
    plugins: any;
    network: string;
    type: string;
    quorum: number;
    quorumType: string;
    symbol: string;
    privacy: string;
    validation: {
        name: string;
        params: any;
    };
    strategies: Array<{
        name: string;
        network: string;
        params: any;
    }>;
    space: {
        id: string;
        name: string;
    };
    scores_state: string;
    scores: number[];
    scores_by_strategy: number[][];
    scores_total: number;
    votes: number;
    flagged: boolean;
}

// Add exponential backoff for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProposalDetails(proposalId: string): Promise<SnapshotProposal> {
    // Check if we have a cached version that's still valid
    if (proposalCache[proposalId] && 
        (Date.now() - proposalCache[proposalId].timestamp) < CACHE_DURATION) {
        console.log(`Using cached proposal data for ${proposalId}`);
        return proposalCache[proposalId].data;
    }
    
    // Implement retry logic with exponential backoff
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
        try {
            console.log(`Fetching proposal ${proposalId} (attempt ${retries + 1})`);
            
            const response = await fetch('https://hub.snapshot.org/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operationName: 'Proposal',
                    variables: { id: proposalId },
                    query: `query Proposal($id: String!) {
                        proposal(id: $id) {
                            id
                            ipfs
                            title
                            body
                            discussion
                            choices
                            labels
                            start
                            end
                            snapshot
                            state
                            author
                            created
                            plugins
                            network
                            type
                            quorum
                            quorumType
                            symbol
                            privacy
                            validation {
                                name
                                params
                            }
                            strategies {
                                name
                                network
                                params
                            }
                            space {
                                id
                                name
                            }
                            scores_state
                            scores
                            scores_by_strategy
                            scores_total
                            votes
                            flagged
                        }
                    }`
                })
            });

            const result = await response.json();
            
            if (response.status === 429) {
                console.warn('Rate limit hit for Snapshot API, backing off...');
                retries += 1;
                if (retries <= maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s, etc.
                    const backoffTime = Math.pow(2, retries) * 1000;
                    console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                    await sleep(backoffTime);
                    continue;
                } else {
                    throw new Error('Rate limit exceeded after maximum retries');
                }
            }
            
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            // Cache the result
            proposalCache[proposalId] = {
                data: result.data.proposal,
                timestamp: Date.now()
            };
            
            return result.data.proposal;
        } catch (error) {
            retries += 1;
            console.error(`Error fetching proposal (attempt ${retries}):`, error);
            
            if (retries <= maxRetries) {
                // Exponential backoff: 1s, 2s, 4s, etc.
                const backoffTime = Math.pow(2, retries) * 1000;
                console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                await sleep(backoffTime);
            } else {
                // If we have a cached version but it's stale, return it anyway as fallback
                if (proposalCache[proposalId]) {
                    console.log('Using stale cached proposal data as fallback');
                    return proposalCache[proposalId].data;
                }
                throw error;
            }
        }
    }
    
    throw new Error('Failed to fetch proposal after maximum retries');
}

export function calculateTransactionArrayHash(proposal: SnapshotProposal): { 
    calculatedHash: string | null, 
    transactionHashes: string[] 
} {
    if (!proposal.plugins?.safeSnap?.safes || proposal.plugins.safeSnap.safes.length === 0) {
        return { calculatedHash: null, transactionHashes: [] };
    }

    try {
        // Get all transaction hashes from the SafeSnap plugin
        const transactionHashes: string[] = [];
        
        proposal.plugins.safeSnap.safes.forEach((safe: any) => {
            if (safe.txs && safe.txs.length > 0) {
                safe.txs.forEach((tx: any) => {
                    if (tx.hash) {
                        transactionHashes.push(tx.hash);
                    }
                });
            }
        });

        if (transactionHashes.length === 0) {
            return { calculatedHash: null, transactionHashes: [] };
        }

        // Concatenate all transaction hashes
        const concatenatedHashes = transactionHashes.join('');
        
        // Remove '0x' prefix from each hash for proper concatenation if needed
        const cleanedConcatenation = concatenatedHashes.replace(/0x/g, '');
        
        // Calculate keccak256 hash of the concatenated transaction hashes
        const calculatedHash = ethers.keccak256('0x' + cleanedConcatenation);
        
        return { calculatedHash, transactionHashes };
    } catch (error) {
        console.error('Error calculating transaction array hash:', error);
        return { calculatedHash: null, transactionHashes: [] };
    }
}

export function compareTransactionHashes(expectedHash: string, calculatedHash: string | null): {
    match: boolean;
    matchText: string;
    matchClass: string;
} {
    if (!calculatedHash) {
        return { 
            match: false, 
            matchText: 'No transactions found to verify', 
            matchClass: 'text-yellow-500'
        };
    }

    // Normalize hashes for comparison (ensure both have 0x prefix and same case)
    const normalizedExpected = expectedHash.startsWith('0x') ? expectedHash.toLowerCase() : `0x${expectedHash.toLowerCase()}`;
    const normalizedCalculated = calculatedHash.toLowerCase();

    const match = normalizedExpected === normalizedCalculated;

    return {
        match,
        matchText: match 
            ? 'Hash MATCH ✓ - Transactions are valid' 
            : 'Hash MISMATCH ✗ - Transactions differ from expected',
        matchClass: match ? 'text-green-500 font-bold' : 'text-red-500 font-bold'
    };
}
