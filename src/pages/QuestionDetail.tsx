
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits } from 'viem';
import { ArrowLeft } from 'lucide-react';

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

    const getStatusBadgeClass = (phase: string) => {
        switch (phase) {
            case 'OPEN':
                return 'bg-tron/20 text-tron border-tron/30';
            case 'PENDING_ARBITRATION':
                return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'FINALIZED':
                return 'bg-tron-blue/20 text-tron-blue border-tron-blue/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading && !question) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-circuit-flow h-12 w-12 rounded-full border-2 border-tron relative">
                    <div className="absolute inset-0 rounded-full shadow-tron"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 max-w-4xl mx-auto">
                <div className="tron-card p-6">
                    <h2 className="text-xl font-semibold mb-4 text-tron">Error</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className="tron-button mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Questions
                    </button>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="tron-card p-6">
                    <h2 className="text-xl font-semibold mb-4 text-tron">Question Not Found</h2>
                    <p className="mb-4">This might happen if you accessed this page directly.
                        Please go back to the questions list and click on a question to view its details.</p>
                    <button onClick={handleBack} className="tron-button">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Questions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Back button */}
            <button
                onClick={handleBack}
                className="mb-6 tron-button inline-flex items-center"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Questions
            </button>

            <h1 className="text-3xl font-bold mb-6 text-tron text-glow">{question.title}</h1>

            {/* Basic Question Details */}
            <div className="tron-card mb-6">
                <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Question Details</h2>
                <dl className="grid grid-cols-1 gap-6 p-6">
                    <div>
                        <dt className="font-medium text-tron-light/70">Description</dt>
                        <dd className="mt-1 text-foreground">{question.description}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Status</dt>
                        <dd className="mt-1">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(question.phase)}`}>
                                {question.phase}
                            </span>
                        </dd>
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div>
                            <dt className="font-medium text-tron-light/70">Options</dt>
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
                        <dt className="font-medium text-tron-light/70">Question Type</dt>
                        <dd className="mt-1 text-foreground">{question.qType}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Raw Data</dt>
                        <dd className="mt-1">
                            <pre className="bg-tron-black/30 p-4 rounded-md overflow-x-auto text-sm border border-tron-dark/30">
                                {question.data}
                            </pre>
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Current Answer</dt>
                        <dd className="mt-1 text-foreground">{question.currentAnswer || 'No answer yet'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Current Bond</dt>
                        <dd className="mt-1 text-foreground">{formatBond(question.currentBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Minimum Bond</dt>
                        <dd className="mt-1 text-foreground">{formatBond(question.minimumBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Time Remaining</dt>
                        <dd className="mt-1 text-foreground">{question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Time to Open</dt>
                        <dd className="mt-1 text-foreground">{question.timeToOpen ? `${Math.floor(question.timeToOpen / 1000)} seconds` : 'Already open'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Created</dt>
                        <dd className="mt-1 text-foreground">{formatDate(question.createdTimestamp * 1000)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Opening Time</dt>
                        <dd className="mt-1 text-foreground">{formatDate(question.openingTimestamp * 1000)}</dd>
                    </div>
                    {question.arbitrationRequestedBy && (
                        <div>
                            <dt className="font-medium text-tron-light/70">Arbitration Requested By</dt>
                            <dd className="mt-1 text-foreground">{question.arbitrationRequestedBy}</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Template Information */}
            {question.template && (
                <div className="tron-card mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Template Information</h2>
                    <dl className="grid grid-cols-1 gap-6 p-6">
                        <div>
                            <dt className="font-medium text-tron-light/70">Template ID</dt>
                            <dd className="mt-1 text-foreground">{question.template.templateId}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Question Text</dt>
                            <dd className="mt-1 text-foreground">{question.template.questionText}</dd>
                        </div>
                        {question.template.creator && (
                            <div>
                                <dt className="font-medium text-tron-light/70">Creator</dt>
                                <dd className="mt-1 text-foreground">{question.template.creator}</dd>
                            </div>
                        )}
                        {question.template.creationTimestamp && (
                            <div>
                                <dt className="font-medium text-tron-light/70">Created</dt>
                                <dd className="mt-1 text-foreground">{formatDate(question.template.creationTimestamp * 1000)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}

            {/* Answers History */}
            {question.answers && question.answers.length > 0 && (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{answer.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(answer.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(answer.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Responses */}
            {question.responses && question.responses.length > 0 && (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{response.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(response.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(response.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Contract Information */}
            {question.contract && (
                <div className="tron-card">
                    <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Contract Information</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        <div>
                            <dt className="font-medium text-tron-light/70">Contract Address</dt>
                            <dd className="mt-1 text-foreground font-mono">{question.contract.address}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Contract Name</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.contract_name}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Contract Version</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.contract_version}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Version Number</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.version_number}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Chain ID</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.chain_id}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-tron-light/70">Token Ticker</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.token_ticker}</dd>
                        </div>
                        {question.contract.config?.arbitrators && question.contract.config.arbitrators.length > 0 && (
                            <div className="md:col-span-2">
                                <dt className="font-medium text-tron-light/70">Arbitrators</dt>
                                <dd className="mt-1 space-y-1">
                                    {question.contract.config.arbitrators.map((arbitrator, index) => (
                                        <div key={index} className="text-foreground font-mono">{arbitrator}</div>
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
