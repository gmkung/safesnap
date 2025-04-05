
import { Question } from 'reality-kleros-subgraph';
import { Info } from 'lucide-react';
import { parseQuestionData } from '@/utils/questionUtils';

interface QuestionTitleProps {
    question: Question;
}

export default function QuestionTitle({ question }: QuestionTitleProps) {
    const parsedData = parseQuestionData(question);
    
    if (!parsedData) return <h1 className="text-3xl font-bold mb-6 text-tron text-glow">{question.title}</h1>;

    return (
        <div className="space-y-2">
            {parsedData.dao && (
                <div className="text-tron text-xl font-medium flex items-center gap-2">
                    DAO: {parsedData.dao}
                    <Info className="h-4 w-4 text-tron-light/70" title={question.title} />
                </div>
            )}
            <div className="space-y-2">
                <div className="text-lg">
                    <span className="text-tron-light/70">Proposal ID:</span>
                    <code className="ml-2 bg-tron-dark/30 px-2 py-1 rounded text-base">
                        {parsedData.proposalId}
                    </code>
                </div>
                <div className="text-lg">
                    <span className="text-tron-light/70">Transaction Array Hash:</span>
                    <code className="ml-2 bg-tron-dark/30 px-2 py-1 rounded text-base">
                        {parsedData.transactionHash}
                    </code>
                </div>
            </div>
        </div>
    );
}
