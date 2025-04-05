
import { Question } from 'reality-kleros-subgraph';
import RequestArbitrationButton from './RequestArbitration';
import { formatBond, formatDate, getHumanReadableAnswer, getStatusBadgeClass, parseQuestionData } from '@/utils/questionUtils';
import { ExternalLink, Info, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import TemplateInfo from './TemplateInfo';
import ContractInfo from './ContractInfo';

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
            <h2 className="text-xl font-semibold mb-4 ethereal-text p-4 border-b border-space-dark/30">Question Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
                
                <div className="md:col-span-2 flex space-x-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="steel" size="sm">
                                <Info className="mr-2 h-4 w-4" />
                                Additional Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl ethereal-text">Additional Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                {question.description && (
                                    <div>
                                        <h3 className="text-lg font-medium text-space-light/70 mb-2">Description</h3>
                                        <div className="glass-panel p-4">{question.description}</div>
                                    </div>
                                )}
                                {question.data && (
                                    <div>
                                        <h3 className="text-lg font-medium text-space-light/70 mb-2">Raw Data</h3>
                                        <pre className="glass-panel p-4 overflow-x-auto text-sm whitespace-pre-wrap">
                                            {question.data}
                                        </pre>
                                    </div>
                                )}
                                <TemplateInfo question={question} />
                                
                                {question.options && question.options.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-space-light/70 mb-2">Options</h3>
                                        <div className="glass-panel p-4">
                                            {question.options.map((option, index) => (
                                                <div key={index} className="text-foreground">
                                                    {index + 1}. {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-lg font-medium text-space-light/70 mb-2">Question Type</h3>
                                    <div className="glass-panel p-4">
                                        <p className="text-foreground">{question.qType}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="steel" size="sm">
                                <Database className="mr-2 h-4 w-4" />
                                Oracle Contract Info
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl ethereal-text">Oracle Contract Information</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                <ContractInfo question={question} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </dl>
            
            {/* Additional data at the bottom */}
            {(parsedData?.proposalId || parsedData?.transactionHash) && (
                <div className="border-t border-space-dark/30 p-4">
                    <dl className="grid grid-cols-1 gap-4">
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
                    </dl>
                </div>
            )}
        </div>
    );
}
