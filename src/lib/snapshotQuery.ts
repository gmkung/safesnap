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

export async function getProposalDetails(proposalId: string): Promise<SnapshotProposal> {
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
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }

    return result.data.proposal;
} 