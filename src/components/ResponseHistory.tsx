
import { Question } from 'reality-kleros-subgraph';
import { formatBond, formatDate, getHumanReadableAnswer } from '@/utils/questionUtils';
import RequestArbitrationButton from './RequestArbitration';

interface ResponseHistoryProps {
    question: Question;
    onArbitrationRequested?: () => void;
}

export default function ResponseHistory({ question, onArbitrationRequested }: ResponseHistoryProps) {
    if (!question.responses || question.responses.length === 0) return (
        <div className="text-center p-4 glass-panel">
            <p className="text-space-light/70">No answers submitted yet</p>
        </div>
    );

    return (
        <div className="overflow-x-auto glass-panel">
            <table className="min-w-full divide-y divide-space-dark/30">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-space-light uppercase tracking-wider">Answer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-space-light uppercase tracking-wider">Bond</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-space-light uppercase tracking-wider">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-space-dark/30">
                    {question.responses.map((response, index) => (
                        <tr key={index} className="hover:bg-space-dark/20 transition-colors">
                            <td className="px-4 py-3 text-sm">{getHumanReadableAnswer(response.value, question)}</td>
                            <td className="px-4 py-3 text-sm">{formatBond(response.bond, question)}</td>
                            <td className="px-4 py-3 text-sm text-space-light/70">{formatDate(response.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
