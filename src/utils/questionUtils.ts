
import { Question } from 'reality-kleros-subgraph';

// Answer constants
export const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
export const INVALID_ANSWER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const getStatusBadgeClass = (phase: string) => {
    switch (phase) {
        case 'OPEN':
            return 'bg-tron/20 text-tron border-tron/30';
        case 'PENDING_ARBITRATION':
            return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        case 'FINALIZED':
            return 'bg-tron-blue/20 text-tron-blue border-tron-blue/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

export const getHumanReadableAnswer = (answerHex: string, question?: Question): string => {
    if (answerHex === INVALID_ANSWER) return "Invalid";
    if (answerHex === ANSWERED_TOO_SOON) return "Answered too Soon";

    if (question?.options && question.options.length > 0) {
        try {
            const index = parseInt(answerHex.slice(2), 16);
            return question.options[index] || `Unknown Option (${answerHex})`;
        } catch (error) {
            console.error('Error parsing answer hex:', error);
            return `Invalid Format (${answerHex})`;
        }
    }

    return answerHex;
};

export const getProposalId = (data: string) => {
    const parts = data.split('␟');
    return parts[0] || null;
};

export const parseQuestionData = (question: Question) => {
    const parts = question.data.split('␟');
    if (parts.length >= 2) {
        const daoMatch = question.title.match(/in the ([a-zA-Z0-9]+\.eth) space/);
        return {
            proposalId: parts[0],
            transactionHash: parts[1],
            dao: daoMatch ? daoMatch[1] : null
        };
    }
    return null;
};

export const formatBond = (bond: string, question?: Question) => {
    if (!question?.contract?.config) return `${bond} ETH`;

    try {
        const formattedAmount = (parseInt(bond) / 10**18).toString();
        return `${formattedAmount} ${question.contract.config.token_ticker}`;
    } catch (error) {
        console.error('Error formatting bond:', error);
        return `${bond} ${question?.contract?.config?.token_ticker || 'ETH'}`;
    }
};

export const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
};
