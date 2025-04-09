
import { Question } from 'reality-kleros-subgraph';
import { formatBond, formatDate, getHumanReadableAnswer } from '@/utils/questionUtils';
import { FileText } from 'lucide-react';
import { QuestionDetailsSkeleton } from './ui/skeleton';
import QuestionHeader from './question/QuestionHeader';
import QuestionField from './question/QuestionField';
import QuestionStatus from './question/QuestionStatus';
import QuestionActionButtons from './question/QuestionActionButtons';
import ProposalInfo from './question/ProposalInfo';

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
    
    return (
        <div className="steel-panel h-full relative overflow-hidden tron-grid">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-space/20 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-space/20 to-transparent"></div>
                <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-space/20 to-transparent"></div>
            </div>
            
            <QuestionHeader question={question} />
            
            <dl className="grid grid-cols-1 gap-4 p-4">
                <QuestionField label="Question ID" copyText={question.id}>
                    <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                        {question.id}
                    </code>
                </QuestionField>
                
                <div>
                    <dt className="font-medium text-space-light/70">Status</dt>
                    <dd className="mt-1">
                        <QuestionStatus 
                            question={question} 
                            onArbitrationRequested={onArbitrationRequested} 
                        />
                    </dd>
                </div>
                
                <QuestionField label="Current Answer">
                    <span className="text-foreground">
                        {question.currentAnswer ? getHumanReadableAnswer(question.currentAnswer, question) : 'No answer yet'}
                    </span>
                </QuestionField>
                
                <QuestionField label="Current Bond">
                    <span className="text-foreground">
                        {formatBond(question.currentBond, question)}
                    </span>
                </QuestionField>
                
                <QuestionField label="Minimum Bond">
                    <span className="text-foreground">
                        {formatBond(question.minimumBond, question)}
                    </span>
                </QuestionField>
                
                <QuestionField label="Time Remaining">
                    <span className="text-foreground">
                        {question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}
                    </span>
                </QuestionField>
                
                <QuestionField label="Opening Time">
                    <span className="text-foreground">
                        {formatDate(question.openingTimestamp * 1000)}
                    </span>
                </QuestionField>
                
                {question.arbitrationRequestedBy && (
                    <QuestionField 
                        label="Arbitration Requested By" 
                        copyText={question.arbitrationRequestedBy.startsWith('0x') ? question.arbitrationRequestedBy : undefined}
                    >
                        <span className="text-foreground font-mono">
                            {question.arbitrationRequestedBy}
                        </span>
                    </QuestionField>
                )}
                
                <QuestionActionButtons question={question} />
            </dl>
            
            <ProposalInfo 
                question={question}
                proposalData={proposalData}
                hashVerification={hashVerification}
                onViewHashDetails={onViewHashDetails}
            />
        </div>
    );
}
