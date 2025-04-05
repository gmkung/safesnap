
import { Question } from 'reality-kleros-subgraph';
import { formatBond, formatDate, getHumanReadableAnswer } from '@/utils/questionUtils';

interface AnswerHistoryProps {
    question: Question;
}

export default function AnswerHistory({ question }: AnswerHistoryProps) {
    if (!question.answers || question.answers.length === 0) return null;

    return (
        <div className="tron-card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Answer History</h2>
            <div className="overflow-x-auto p-4">
                <table className="min-w-full divide-y divide-tron-dark/30 tron-table">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Answer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Bond</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tron-dark/30">
                        {question.answers.map((answer, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{getHumanReadableAnswer(answer.value, question)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(answer.bond, question)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(answer.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
