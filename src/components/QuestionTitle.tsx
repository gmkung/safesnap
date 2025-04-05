
import { Question } from 'reality-kleros-subgraph';
import { Info } from 'lucide-react';
import { parseQuestionData } from '@/utils/questionUtils';

interface QuestionTitleProps {
    question: Question;
}

export default function QuestionTitle({ question }: QuestionTitleProps) {
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
            <div className="space-y-2">
                <div className="text-lg">
                    <span className="text-space-light/70">Proposal ID:</span>
                    <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-base font-mono text-space-light">
                        {parsedData.proposalId}
                    </code>
                </div>
                <div className="text-lg">
                    <span className="text-space-light/70">Expected Transaction Array Hash:</span>
                    <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-base font-mono text-space-light">
                        {parsedData.transactionHash}
                    </code>
                </div>
            </div>
        </div>
    );
}
