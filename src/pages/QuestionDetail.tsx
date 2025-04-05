
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits } from 'viem';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

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
            <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
                <div className="relative h-24 w-24">
                    {/* Glowing spinner */}
                    <div className="absolute inset-0 rounded-full border-4 border-t-tron border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-r-tron border-t-transparent border-b-transparent border-l-transparent animate-spin animation-delay-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-b-tron border-t-transparent border-r-transparent border-l-transparent animate-spin animation-delay-400"></div>
                </div>
                <div className="w-full max-w-md space-y-4">
                    <Progress value={60} className="h-2" />
                    <p className="text-tron text-center text-glow animate-pulse">Loading question details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tron-card p-6 max-w-xl mx-auto my-12 text-center">
                <div className="text-red-500 flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Question</h2>
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={handleBack}
                        className="mt-6 tron-button inline-flex items-center px-4 py-2"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="tron-card p-6 max-w-xl mx-auto my-12">
                <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-tron/10 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-tron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-tron mb-4">Question Not Found</h2>
                    <p className="text-muted-foreground">This might happen if you accessed this page directly. Please go back to the questions list and click on a question to view its details.</p>
                    <button
                        onClick={handleBack}
                        className="mt-6 tron-button inline-flex items-center px-4 py-2"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
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
                className="tron-button mb-6 inline-flex items-center px-4 py-2"
            >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Questions
            </button>

            <h1 className="text-3xl font-bold mb-6 text-tron text-glow">{question.title}</h1>

            {/* Basic Question Details */}
            <div className="tron-card mb-6">
                <h2 className="text-xl font-semibold mb-4 px-6 pt-6 text-tron">Question Details</h2>
                <dl className="grid grid-cols-1 gap-4 p-6 pt-2">
                    <div>
                        <dt className="font-medium text-muted-foreground">Description</dt>
                        <dd className="mt-1 text-foreground">{question.description}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Status</dt>
                        <dd className="mt-1">
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full 
                            ${question.phase === 'OPEN' ? 'bg-tron/20 text-tron border border-tron/30' :
                                    question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                        question.phase === 'FINALIZED' ? 'bg-tron-blue/20 text-tron-blue border border-tron-blue/30' :
                                            'bg-secondary text-secondary-foreground border border-secondary/30'}`}>
                                {question.phase}
                            </span>
                        </dd>
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div>
                            <dt className="font-medium text-muted-foreground">Options</dt>
                            <dd className="mt-1 space-y-1">
                                {question.options.map((option, index) => (
                                    <div key={index} className="text-foreground py-1 px-2 bg-tron-dark/10 rounded-md">
                                        {index + 1}. {option}
                                    </div>
                                ))}
                            </dd>
                        </div>
                    )}
                    <div>
                        <dt className="font-medium text-muted-foreground">Question Type</dt>
                        <dd className="mt-1 text-foreground">{question.qType}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Raw Data</dt>
                        <dd className="mt-1">
                            <pre className="bg-tron-black/30 p-4 rounded-md overflow-x-auto text-sm text-tron-light border border-tron/20">
                                {question.data}
                            </pre>
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Current Answer</dt>
                        <dd className="mt-1 text-foreground">{question.currentAnswer || 'No answer yet'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Current Bond</dt>
                        <dd className="mt-1 text-foreground">{formatBond(question.currentBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Minimum Bond</dt>
                        <dd className="mt-1 text-foreground">{formatBond(question.minimumBond)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Time Remaining</dt>
                        <dd className="mt-1 text-foreground">{question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Time to Open</dt>
                        <dd className="mt-1 text-foreground">{question.timeToOpen ? `${Math.floor(question.timeToOpen / 1000)} seconds` : 'Already open'}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Created</dt>
                        <dd className="mt-1 text-foreground">{formatDate(question.createdTimestamp * 1000)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">Opening Time</dt>
                        <dd className="mt-1 text-foreground">{formatDate(question.openingTimestamp * 1000)}</dd>
                    </div>
                    {question.arbitrationRequestedBy && (
                        <div>
                            <dt className="font-medium text-muted-foreground">Arbitration Requested By</dt>
                            <dd className="mt-1 text-foreground">{question.arbitrationRequestedBy}</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Template Information */}
            {question.template && (
                <div className="tron-card mb-6">
                    <h2 className="text-xl font-semibold mb-4 px-6 pt-6 text-tron">Template Information</h2>
                    <dl className="grid grid-cols-1 gap-4 p-6 pt-2">
                        <div>
                            <dt className="font-medium text-muted-foreground">Template ID</dt>
                            <dd className="mt-1 text-foreground">{question.template.templateId}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Question Text</dt>
                            <dd className="mt-1 text-foreground">{question.template.questionText}</dd>
                        </div>
                        {question.template.creator && (
                            <div>
                                <dt className="font-medium text-muted-foreground">Creator</dt>
                                <dd className="mt-1 text-foreground">{question.template.creator}</dd>
                            </div>
                        )}
                        {question.template.creationTimestamp && (
                            <div>
                                <dt className="font-medium text-muted-foreground">Created</dt>
                                <dd className="mt-1 text-foreground">{formatDate(question.template.creationTimestamp * 1000)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}

            {/* Answers History */}
            {question.answers && question.answers.length > 0 && (
                <div className="tron-card mb-6">
                    <h2 className="text-xl font-semibold mb-4 px-6 pt-6 text-tron">Answer History</h2>
                    <div className="p-6 pt-2 overflow-x-auto">
                        <table className="tron-table min-w-full divide-y divide-tron-dark/30">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Answer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Bond</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-tron-dark/20 bg-tron-black/20">
                                {question.answers.map((answer, index) => (
                                    <tr key={index} className="hover:bg-tron-dark/20">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{answer.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatBond(answer.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatDate(answer.timestamp)}</td>
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
                    <h2 className="text-xl font-semibold mb-4 px-6 pt-6 text-tron">Responses</h2>
                    <div className="p-6 pt-2 overflow-x-auto">
                        <table className="tron-table min-w-full divide-y divide-tron-dark/30">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Response</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Bond</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-tron-light uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-tron-dark/20 bg-tron-black/20">
                                {question.responses.map((response, index) => (
                                    <tr key={index} className="hover:bg-tron-dark/20">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{response.user}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{response.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatBond(response.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatDate(response.timestamp)}</td>
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
                    <h2 className="text-xl font-semibold mb-4 px-6 pt-6 text-tron">Contract Information</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-2">
                        <div>
                            <dt className="font-medium text-muted-foreground">Contract Address</dt>
                            <dd className="mt-1 text-foreground font-mono break-all bg-tron-black/20 p-2 rounded-md border border-tron/10">{question.contract.address}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Contract Name</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.contract_name}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Contract Version</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.contract_version}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Version Number</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.version_number}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Chain ID</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.chain_id}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Token Ticker</dt>
                            <dd className="mt-1 text-foreground">{question.contract.config?.token_ticker}</dd>
                        </div>
                        {question.contract.config?.arbitrators && question.contract.config.arbitrators.length > 0 && (
                            <div className="md:col-span-2">
                                <dt className="font-medium text-muted-foreground">Arbitrators</dt>
                                <dd className="mt-1 space-y-1">
                                    {question.contract.config.arbitrators.map((arbitrator, index) => (
                                        <div key={index} className="text-foreground font-mono break-all bg-tron-black/20 p-2 rounded-md border border-tron/10">{arbitrator}</div>
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
