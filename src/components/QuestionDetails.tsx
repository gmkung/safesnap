
import { Question } from 'reality-kleros-subgraph';
import RequestArbitrationButton from './RequestArbitration';
import { formatBond, formatDate, getHumanReadableAnswer, getStatusBadgeClass, parseQuestionData } from '@/utils/questionUtils';
import { ExternalLink, Info, Calculator, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import TemplateInfo from './TemplateInfo';
import ContractInfo from './ContractInfo';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from '@/lib/utils';
import { QuestionDetailsSkeleton } from './ui/skeleton';

interface QuestionDetailsProps {
    question: Question;
    onArbitrationRequested: () => void;
    onViewProposal?: (proposalId: string) => void;
    proposalData?: any;
    hashVerification?: any;
    onViewHashDetails?: () => void;
    isLoading?: boolean;
}

export default function QuestionDetails({ 
    question, 
    onArbitrationRequested,
    onViewProposal,
    proposalData,
    hashVerification,
    onViewHashDetails,
    isLoading = false
}: QuestionDetailsProps) {
    if (isLoading) {
        return <QuestionDetailsSkeleton />;
    }
    
    const parsedData = parseQuestionData(question);
    
    const getSnapshotUrl = (spaceId: string, proposalId: string) => {
        return `https://v1.snapshot.box/#/${spaceId}/proposal/${proposalId}`;
    };
    
    // Get the icon based on the verification status
    const StatusIcon = hashVerification?.match 
        ? CheckCircle 
        : hashVerification?.calculatedHash 
            ? XCircle 
            : AlertTriangle;
    
    // Get the tooltip text based on the verification status
    const tooltipText = hashVerification?.match 
        ? "Hash in question matches calculated hash from Snapshot Proposal" 
        : hashVerification?.calculatedHash 
            ? "Hash mismatch: The expected hash does not match the calculated hash" 
            : "Unable to verify: No transactions found in proposal to calculate hash";
    
    return (
        <div className="steel-panel h-full relative overflow-hidden tron-grid">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-space/20 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-space/20 to-transparent"></div>
                <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-space/20 to-transparent"></div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4 ethereal-text p-4 border-b border-space-dark/30 relative">
                Question Details
                <span className="absolute bottom-0 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></span>
            </h2>
            
            <dl className="grid grid-cols-1 gap-4 p-4">
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
                
                {question.arbitrationRequestedBy && (
                    <div>
                        <dt className="font-medium text-space-light/70">Arbitration Requested By</dt>
                        <dd className="mt-1 text-foreground font-mono">{question.arbitrationRequestedBy}</dd>
                    </div>
                )}
                
                <div className="flex space-x-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="tron" size="sm" glow={true}>
                                <Info className="mr-2 h-4 w-4" />
                                Additional Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel max-h-[90vh] max-w-4xl w-[90vw] overflow-y-auto">
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

                                <div>
                                    <h3 className="text-lg font-medium text-space-light/70 mb-2">Oracle Contract Information</h3>
                                    <ContractInfo question={question} />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </dl>
            
            {/* Additional data at the bottom */}
            {(parsedData?.proposalId || parsedData?.transactionHash) && (
                <div className="border-t border-space-dark/30 p-4 relative">
                    <span className="absolute top-0 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></span>
                    
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
                                            <ExternalLink className="h-4 w-4 text-space-light/70 hover:text-space transition-colors" />
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
                                <dt className="font-medium text-space-light/70 flex items-center gap-2">
                                    Expected Transaction Array Hash
                                    
                                    {hashVerification && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge 
                                                        className={cn(
                                                            "flex items-center gap-1 cursor-pointer",
                                                            hashVerification.match ? "bg-green-500/20 hover:bg-green-500/30 text-green-500 border-green-500/30" :
                                                            hashVerification.calculatedHash ? "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30" :
                                                            "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/30"
                                                        )}
                                                        onClick={onViewHashDetails}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        <span>{hashVerification.match ? "Match" : "Invalid"}</span>
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs glass-panel border-space/30">
                                                    <div className="flex items-start space-x-2">
                                                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                                        <span>{tooltipText}</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </dt>
                                <dd className="mt-1">
                                    <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                                        {parsedData.transactionHash}
                                    </code>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}
        </div>
    );
}
