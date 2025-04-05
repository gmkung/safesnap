
import { Question } from 'reality-kleros-subgraph';
import { formatBond, formatDate, getHumanReadableAnswer } from '@/utils/questionUtils';

interface ResponseHistoryProps {
    question: Question;
}

export default function ResponseHistory({ question }: ResponseHistoryProps) {
    if (!question.responses || question.responses.length === 0) return null;

    return (
        <div className="tron-card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Responses</h2>
            <div className="overflow-x-auto p-4">
                <table className="min-w-full divide-y divide-tron-dark/30 tron-table">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Response</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Bond</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tron-dark/30">
                        {question.responses.map((response, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-tron-light/80">{response.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{getHumanReadableAnswer(response.value, question)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(response.bond, question)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(response.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
