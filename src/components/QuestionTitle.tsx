
import { Question } from 'reality-kleros-subgraph';
import { Info, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { parseQuestionData } from '@/utils/questionUtils';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface SnapshotProposal {
    id: string;
    title?: string;
    body?: string;
    choices?: string[];
    start?: number;
    end?: number;
    state?: string;
    scores?: number[];
    space?: {
        id?: string;
        name?: string;
    };
}

interface QuestionTitleProps {
    question: Question;
    onViewProposal?: (proposalId: string) => void;
    proposalData?: SnapshotProposal | null;
    isProposalLoading?: boolean;
}

export default function QuestionTitle({ 
    question, 
    onViewProposal, 
    proposalData, 
    isProposalLoading = false 
}: QuestionTitleProps) {
    const parsedData = parseQuestionData(question);
    
    if (!parsedData) return <h1 className="text-3xl font-bold mb-6 text-space text-glow">{question.title}</h1>;

    return (
        <div className="space-y-4">
            {parsedData.dao && (
                <div className="text-space text-xl font-medium flex items-center gap-2">
                    DAO: <span className="ethereal-text">{parsedData.dao}</span>
                    <div className="relative inline-flex items-center group">
                        <Info className="h-4 w-4 text-space-light/70" />
                        <span className="sr-only">{question.title}</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 hidden group-hover:block minimal-chrome text-xs text-white p-2 rounded whitespace-nowrap z-10">
                            {question.title}
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Information Section */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="text-lg">
                        <span className="text-space-light/70">Proposal ID:</span>
                        <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-base font-mono text-space-light">
                            {parsedData.proposalId}
                        </code>
                    </div>
                    <div className="text-lg">
                        <span className="text-space-light/70">Transaction Array Hash:</span>
                        <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-base font-mono text-space-light">
                            {parsedData.transactionHash}
                        </code>
                    </div>
                </div>

                {/* SafeSnap Transaction Box */}
                {(parsedData.proposalId || proposalData) && (
                    <div className="steel-panel p-4 border border-space-light/20 rounded-md">
                        <div className="flex flex-col gap-3">
                            {isProposalLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ) : proposalData ? (
                                <>
                                    <div className="font-medium text-lg text-space-light">
                                        {proposalData.title || "SafeSnap Transaction"}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        {proposalData.space?.name && (
                                            <div className="bg-space-dark/30 px-2 py-1 rounded text-space-light">
                                                Space: {proposalData.space.name}
                                            </div>
                                        )}
                                        {proposalData.state && (
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                                                proposalData.state === 'active' ? 'bg-blue-500/20 text-blue-300' :
                                                proposalData.state === 'closed' ? 'bg-green-500/20 text-green-300' :
                                                'bg-space-dark/30 text-space-light'
                                            }`}>
                                                {proposalData.state === 'active' ? 
                                                    <Clock className="h-3.5 w-3.5" /> : 
                                                    proposalData.state === 'closed' ? 
                                                        <CheckCircle className="h-3.5 w-3.5" /> : 
                                                        <Info className="h-3.5 w-3.5" />
                                                }
                                                {proposalData.state.charAt(0).toUpperCase() + proposalData.state.slice(1)}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-space-light/70">
                                    SafeSnap Transaction Information
                                </div>
                            )}
                            
                            {parsedData.proposalId && onViewProposal && (
                                <div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-space flex items-center gap-2 glass-panel"
                                        onClick={() => onViewProposal(parsedData.proposalId || '')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View Full Proposal
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
