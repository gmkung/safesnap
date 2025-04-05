import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits } from 'viem';

interface ContractConfig {
    address: string;
    arbitrators: string[];
    version_number: string;
    chain_id: string;
    contract_name: string;
    contract_version: string;
    token_ticker: string;
}

export default function QuestionDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(location.state?.question || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuestionDetails = async () => {
            try {
                setLoading(true);
                // No need to load contract config separately as it's already in the question data
            } catch (err) {
                console.error('Error loading question details:', err);
                setError(err instanceof Error ? err.message : 'Failed to load question details');
            } finally {
                setLoading(false);
            }
        };

        loadQuestionDetails();
    }, [question]);

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatBond = (bond: string) => {
        if (!question?.contract?.config) return `${bond} ETH`;

        try {
            // Convert from wei to the appropriate unit
            const formattedAmount = formatUnits(BigInt(bond), 18);
            return `${formattedAmount} ${question.contract.config.token_ticker}`;
        } catch (error) {
            console.error('Error formatting bond:', error);
            return `${bond} ${question?.contract?.config?.token_ticker || 'ETH'}`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error: {error}
            </div>
        );
    }

    if (!question) {
        return (
            <div className="p-4">
                Question not found. This might happen if you accessed this page directly.
                Please go back to the questions list and click on a question to view its details.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Back button */}
            <button
                onClick={handleBack}
                className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Questions
            </button>

            <h1 className="text-3xl font-bold mb-6">{question.title}</h1>

            {/* Basic Question Details */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Question Details</h2>
                <dl className="grid grid-cols-1 gap-4">
                    <div>
                        <dt className="font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-gray-900">{question.description}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full 
                ${question.phase === 'OPEN' ? 'bg-green-100 text-green-800' :
                                    question.phase === 'PENDING_ARBITRATION' ? 'bg-yellow-100 text-yellow-800' :
                                        question.phase === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                {question.phase}
                            </span>
                        </dd>
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div>
                            <dt className="font-medium text-gray-500">Options</dt>
                            <dd className="mt-1 space-y-1">
                                {question.options.map((option, index) => (
                                    <div key={index} className="text-gray-900">
                                        {index + 1}. {option}
                                    </div>
                                ))}
                            </dd>
                        </div>
                    )}
                    <div>
                        <dt className="font-medium text-gray-500">Question Type</dt>
                        <dd className="mt-1 text-gray-900">{question.qType}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Raw Data</dt>
                        <dd className="mt-1">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                                {question.data}
                            </pre>
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Current Answer</dt>
                        <dd className="mt-1 text-gray-900">{question.currentAnswer || 'No answer yet'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Current Bond</dt>
                        <dd className="mt-1 text-gray-900">{formatBond(question.currentBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Minimum Bond</dt>
                        <dd className="mt-1 text-gray-900">{formatBond(question.minimumBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Time Remaining</dt>
                        <dd className="mt-1 text-gray-900">{question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Time to Open</dt>
                        <dd className="mt-1 text-gray-900">{question.timeToOpen ? `${Math.floor(question.timeToOpen / 1000)} seconds` : 'Already open'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Created</dt>
                        <dd className="mt-1 text-gray-900">{formatDate(question.createdTimestamp * 1000)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-gray-500">Opening Time</dt>
                        <dd className="mt-1 text-gray-900">{formatDate(question.openingTimestamp * 1000)}</dd>
                    </div>
                    {question.arbitrationRequestedBy && (
                        <div>
                            <dt className="font-medium text-gray-500">Arbitration Requested By</dt>
                            <dd className="mt-1 text-gray-900">{question.arbitrationRequestedBy}</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Template Information */}
            {question.template && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Template Information</h2>
                    <dl className="grid grid-cols-1 gap-4">
                        <div>
                            <dt className="font-medium text-gray-500">Template ID</dt>
                            <dd className="mt-1 text-gray-900">{question.template.templateId}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Question Text</dt>
                            <dd className="mt-1 text-gray-900">{question.template.questionText}</dd>
                        </div>
                        {question.template.creator && (
                            <div>
                                <dt className="font-medium text-gray-500">Creator</dt>
                                <dd className="mt-1 text-gray-900">{question.template.creator}</dd>
                            </div>
                        )}
                        {question.template.creationTimestamp && (
                            <div>
                                <dt className="font-medium text-gray-500">Created</dt>
                                <dd className="mt-1 text-gray-900">{formatDate(question.template.creationTimestamp * 1000)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}

            {/* Answers History */}
            {question.answers && question.answers.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Answer History</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bond</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {question.answers.map((answer, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{answer.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBond(answer.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(answer.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Responses */}
            {question.responses && question.responses.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Responses</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bond</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {question.responses.map((response, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.user}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBond(response.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(response.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Contract Information */}
            {question.contract && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="font-medium text-gray-500">Contract Address</dt>
                            <dd className="mt-1 text-gray-900 font-mono">{question.contract.address}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Contract Name</dt>
                            <dd className="mt-1 text-gray-900">{question.contract.config?.contract_name}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Contract Version</dt>
                            <dd className="mt-1 text-gray-900">{question.contract.config?.contract_version}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Version Number</dt>
                            <dd className="mt-1 text-gray-900">{question.contract.config?.version_number}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Chain ID</dt>
                            <dd className="mt-1 text-gray-900">{question.contract.config?.chain_id}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Token Ticker</dt>
                            <dd className="mt-1 text-gray-900">{question.contract.config?.token_ticker}</dd>
                        </div>
                        {question.contract.config?.arbitrators && question.contract.config.arbitrators.length > 0 && (
                            <div className="md:col-span-2">
                                <dt className="font-medium text-gray-500">Arbitrators</dt>
                                <dd className="mt-1 space-y-1">
                                    {question.contract.config.arbitrators.map((arbitrator, index) => (
                                        <div key={index} className="text-gray-900 font-mono">{arbitrator}</div>
                                    ))}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}
        </div>
    );
} 