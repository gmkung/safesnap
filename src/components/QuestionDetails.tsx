
import { Question } from 'reality-kleros-subgraph';
import RequestArbitrationButton from './RequestArbitration';
import { formatBond, formatDate, getHumanReadableAnswer, getStatusBadgeClass, parseQuestionData } from '@/utils/questionUtils';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface QuestionDetailsProps {
    question: Question;
    onArbitrationRequested: () => void;
    onViewProposal: (proposalId: string) => void;
    proposalData?: any;
}

export default function QuestionDetails({ 
    question, 
    onArbitrationRequested,
    onViewProposal,
    proposalData
}: QuestionDetailsProps) {
    const parsedData = parseQuestionData(question);
    
    const getSnapshotUrl = (spaceId: string, proposalId: string) => {
        return `https://v1.snapshot.box/#/${spaceId}/proposal/${proposalId}`;
    };
    
    return (
        <div className="steel-panel h-full">
            <h2 className="text-xl font-semibold mb-4 ethereal-text p-4 border-b border-space-dark/30">Question Status</h2>
            <dl className="grid grid-cols-1 gap-4 p-4">
                {parsedData?.proposalId && (
                    <div>
                        <dt className="font-medium text-space-light/70 flex items-center">
                            Proposal ID
                            {proposalData && (
                                <a 
                                    href={getSnapshotUrl(proposalData.space.id, proposalData.id)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2"
                                >
                                    <ExternalLink className="h-4 w-4 text-space-light/70 hover:text-space" />
                                </a>
                            )}
                        </dt>
                        <dd className="mt-1 text-foreground font-mono text-sm break-all">
                            {parsedData.proposalId}
                        </dd>
                    </div>
                )}
                
                {parsedData?.transactionHash && (
                    <div>
                        <dt className="font-medium text-space-light/70">Expected Transaction Array Hash</dt>
                        <dd className="mt-1 text-foreground font-mono text-sm break-all">
                            {parsedData.transactionHash}
                        </dd>
                    </div>
                )}
                
                <div>
                    <dt className="font-medium text-space-light/70">Status</dt>
                    <dd className="mt-1 flex items-center gap-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(question.phase)}`}>
                            {question.phase}
                        </span>
                        <RequestArbitrationButton
                            question={question}
                            onArbitrationRequested={onArbitrationRequested}
                        />
                    </dd>
                </div>
                {question.options && question.options.length > 0 && (
                    <div>
                        <dt className="font-medium text-space-light/70">Options</dt>
                        <dd className="mt-1 space-y-1">
                            {question.options.map((option, index) => (
                                <div key={index} className="text-foreground">
                                    {index + 1}. {option}
                                </div>
                            ))}
                        </dd>
                    </div>
                )}
                <div>
                    <dt className="font-medium text-space-light/70">Question Type</dt>
                    <dd className="mt-1 text-foreground">{question.qType}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Current Answer</dt>
                    <dd className="mt-1 flex items-center gap-4">
                        <span className="text-foreground">
                            {question.currentAnswer ? getHumanReadableAnswer(question.currentAnswer, question) : 'No answer yet'}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Current Bond</dt>
                    <dd className="mt-1 text-foreground">{formatBond(question.currentBond, question)}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Minimum Bond</dt>
                    <dd className="mt-1 text-foreground">{formatBond(question.minimumBond, question)}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Time Remaining</dt>
                    <dd className="mt-1 text-foreground">{question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Opening Time</dt>
                    <dd className="mt-1 text-foreground">{formatDate(question.openingTimestamp * 1000)}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Created</dt>
                    <dd className="mt-1 text-foreground">{formatDate(question.createdTimestamp * 1000)}</dd>
                </div>
                {question.arbitrationRequestedBy && (
                    <div>
                        <dt className="font-medium text-space-light/70">Arbitration Requested By</dt>
                        <dd className="mt-1 text-foreground font-mono">{question.arbitrationRequestedBy}</dd>
                    </div>
                )}
            </dl>
        </div>
    );
}
