
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="animate-spin rounded-full h-14 w-14 border-2 border-tron border-t-transparent mx-auto mb-4 shadow-tron"></div>
                <p className="text-tron animate-pulse text-center">Loading question details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="tron-card border-red-500/30 max-w-4xl mx-auto mt-8">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-red-400">
                        Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-400">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!question) {
        return (
            <Card className="tron-card max-w-4xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Question Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-tron-light/70">
                        This might happen if you accessed this page directly.
                        Please go back to the questions list and click on a question to view its details.
                    </p>
                    <Button onClick={handleBack} className="tron-button mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back button */}
            <Button
                onClick={handleBack}
                variant="outline"
                className="tron-button mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Questions
            </Button>

            <Card className="tron-card mb-6">
                <CardHeader>
                    <Badge className={`${
                        question.phase === 'OPEN' ? 'bg-tron/20 text-tron border-tron/30' : 
                        question.phase === 'PENDING_ARBITRATION' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                        question.phase === 'FINALIZED' ? 'bg-tron-blue/20 text-tron-blue border-tron-blue/30' :
                        'bg-tron-gray/20 text-tron-light/70 border-tron-light/20'
                    } mb-2 self-start`}>
                        {question.phase}
                    </Badge>
                    <CardTitle className="text-2xl text-tron text-glow">{question.title}</CardTitle>
                    <CardDescription>
                        Created: {formatDate(question.createdTimestamp * 1000)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-tron-light mb-2 font-medium">Description</h3>
                            <p className="text-tron-light/80">{question.description}</p>
                        </div>

                        {question.options && question.options.length > 0 && (
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Options</h3>
                                <div className="space-y-1 bg-tron-black/30 p-3 rounded-md">
                                    {question.options.map((option, index) => (
                                        <div key={index} className="text-tron-light/80">
                                            {index + 1}. {option}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Question Type</h3>
                                <p className="text-tron-light/80">{question.qType}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Current Answer</h3>
                                <p className="text-tron-light/80">{question.currentAnswer || 'No answer yet'}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Current Bond</h3>
                                <p className="text-tron-light/80">{formatBond(question.currentBond)}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Minimum Bond</h3>
                                <p className="text-tron-light/80">{formatBond(question.minimumBond)}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Time Remaining</h3>
                                <p className="text-tron-light/80">{question.timeRemaining ? `${Math.floor(question.timeRemaining / 1000)} seconds` : 'No time remaining'}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Time to Open</h3>
                                <p className="text-tron-light/80">{question.timeToOpen ? `${Math.floor(question.timeToOpen / 1000)} seconds` : 'Already open'}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Opening Time</h3>
                                <p className="text-tron-light/80">{formatDate(question.openingTimestamp * 1000)}</p>
                            </div>
                            {question.arbitrationRequestedBy && (
                                <div>
                                    <h3 className="text-tron-light mb-2 font-medium">Arbitration Requested By</h3>
                                    <p className="text-tron-light/80">{question.arbitrationRequestedBy}</p>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="text-tron-light mb-2 font-medium">Raw Data</h3>
                            <pre className="bg-tron-black/40 text-tron-light/70 p-4 rounded-md overflow-x-auto text-sm border border-tron-dark/50">
                                {question.data}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Information */}
            {question.template && (
                <Card className="tron-card mb-6">
                    <CardHeader>
                        <CardTitle className="text-tron">Template Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Template ID</h3>
                                <p className="text-tron-light/80">{question.template.templateId}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Question Text</h3>
                                <p className="text-tron-light/80">{question.template.questionText}</p>
                            </div>
                            {question.template.creator && (
                                <div>
                                    <h3 className="text-tron-light mb-2 font-medium">Creator</h3>
                                    <p className="text-tron-light/80">{question.template.creator}</p>
                                </div>
                            )}
                            {question.template.creationTimestamp && (
                                <div>
                                    <h3 className="text-tron-light mb-2 font-medium">Created</h3>
                                    <p className="text-tron-light/80">{formatDate(question.template.creationTimestamp * 1000)}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Answers History */}
            {question.answers && question.answers.length > 0 && (
                <Card className="tron-card mb-6">
                    <CardHeader>
                        <CardTitle className="text-tron">Answer History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="tron-table min-w-full divide-y divide-tron-dark/30">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Bond</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-tron-dark/30 bg-tron-black/20">
                                    {question.answers.map((answer, index) => (
                                        <tr key={index} className="hover:bg-tron-dark/20">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light">{answer.value}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light">{formatBond(answer.bond)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(answer.timestamp)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Responses */}
            {question.responses && question.responses.length > 0 && (
                <Card className="tron-card mb-6">
                    <CardHeader>
                        <CardTitle className="text-tron">Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="tron-table min-w-full divide-y divide-tron-dark/30">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Response</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Bond</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-tron uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-tron-dark/30 bg-tron-black/20">
                                    {question.responses.map((response, index) => (
                                        <tr key={index} className="hover:bg-tron-dark/20">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light">{response.user}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light">{response.value}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light">{formatBond(response.bond)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(response.timestamp)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contract Information */}
            {question.contract && (
                <Card className="tron-card">
                    <CardHeader>
                        <CardTitle className="text-tron">Contract Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Contract Address</h3>
                                <p className="text-tron-light/80 font-mono text-sm truncate">{question.contract.address}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Contract Name</h3>
                                <p className="text-tron-light/80">{question.contract.config?.contract_name}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Contract Version</h3>
                                <p className="text-tron-light/80">{question.contract.config?.contract_version}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Version Number</h3>
                                <p className="text-tron-light/80">{question.contract.config?.version_number}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Chain ID</h3>
                                <p className="text-tron-light/80">{question.contract.config?.chain_id}</p>
                            </div>
                            <div>
                                <h3 className="text-tron-light mb-2 font-medium">Token Ticker</h3>
                                <p className="text-tron-light/80">{question.contract.config?.token_ticker}</p>
                            </div>
                            {question.contract.config?.arbitrators && question.contract.config.arbitrators.length > 0 && (
                                <div className="md:col-span-2">
                                    <h3 className="text-tron-light mb-2 font-medium">Arbitrators</h3>
                                    <div className="space-y-1 bg-tron-black/30 p-3 rounded-md">
                                        {question.contract.config.arbitrators.map((arbitrator, index) => (
                                            <div key={index} className="text-tron-light/80 font-mono text-sm truncate">{arbitrator}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
