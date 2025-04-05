import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits, parseUnits } from 'viem';
import { ArrowLeft, Plus, ExternalLink, Info } from 'lucide-react';
import { useAccount, useChains, useWalletClient, useConnect, usePublicClient } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RealityEthV3Abi__factory } from '@/types/contracts/factories/RealityEthV3Abi__factory';
import { RealityEthV21Witharbitratorappeals__factory } from '@/types/contracts/factories/RealityEthV21Witharbitratorappeals__factory';
import { injected } from 'wagmi/connectors';
import ProposalModal from '@/components/ProposalModal';
import SubmitAnswerButton from '@/components/SubmitAnswer';

interface ContractConfig {
    address: string;
    arbitrators: string[];
    version_number: string;
    chain_id: string;
    contract_name: string;
    contract_version: string;
    token_ticker: string;
}

interface SubmitAnswerButtonProps {
    question: Question;
    onAnswerSubmitted: () => void;
}

const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { connectAsync } = useConnect();
    const [isConnecting, setIsConnecting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (isConnecting) return;

        try {
            setIsConnecting(true);
            await connectAsync({ connector: injected() });
        } catch (error) {
            console.error('Failed to connect:', error);
            if (!(error instanceof Error) || !error.message.includes('UserRejectedRequestError')) {
                toast({
                    variant: "destructive",
                    title: "Connection Error",
                    description: "Failed to connect wallet. Please try again."
                });
            }
        } finally {
            setIsConnecting(false);
        }
    };

    if (isConnected) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-tron-light">Connected:</span>
                <code className="text-sm bg-tron-dark/30 px-2 py-1 rounded">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</code>
            </div>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            variant="outline"
            className="border-tron"
            disabled={isConnecting}
        >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}

function RequestArbitrationButton({ question, onArbitrationRequested }: { question: Question; onArbitrationRequested: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { address, isConnected } = useAccount();
    const chains = useChains();
    const chain = chains[0];
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { toast } = useToast();

    const getDisabledReason = () => {
        if (question.phase === 'PENDING_ARBITRATION') return 'Arbitration already requested';
        if (question.phase === 'FINALIZED') return 'Question is already finalized';
        if (!question.currentAnswer) return 'No answer to dispute yet';
        return null;
    };

    const disabledReason = getDisabledReason();

    const handleRequestArbitration = async () => {
        try {
            setIsSubmitting(true);

            if (!isConnected || !address) {
                throw new Error('Please connect your wallet first');
            }

            if (!walletClient) {
                throw new Error('Wallet client not available');
            }

            const questionIdBytes = `0x${question.id.replace('0x', '').padStart(64, '0')}` as `0x${string}`;

            const arbitrationFee = await publicClient.readContract({
                address: question.arbitrator as `0x${string}`,
                abi: RealityEthV21Witharbitratorappeals__factory.abi,
                functionName: 'getDisputeFee',
                args: [questionIdBytes]
            });

            const { request } = await publicClient.simulateContract({
                address: question.arbitrator as `0x${string}`,
                abi: RealityEthV21Witharbitratorappeals__factory.abi,
                functionName: 'requestArbitration',
                args: [questionIdBytes, 0n],
                value: arbitrationFee
            });

            const hash = await walletClient.writeContract(request);
            await publicClient.waitForTransactionReceipt({ hash });

            toast({
                title: 'Arbitration requested',
                description: 'Your arbitration request has been submitted successfully.',
            });

            setIsOpen(false);
            onArbitrationRequested();
        } catch (error) {
            console.error('Error requesting arbitration:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to request arbitration',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={disabledReason ? "border-gray-500 text-gray-500" : "border-yellow-500 text-yellow-500"}
                                    disabled={!!disabledReason}
                                >
                                    Request Arbitration
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Request Arbitration</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <p>
                                        Are you sure you want to request arbitration for this question? This will:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Freeze the current answer</li>
                                        <li>Require payment of the arbitration fee</li>
                                        <li>Submit the dispute to the arbitrator at {question.arbitrator}</li>
                                    </ul>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleRequestArbitration} disabled={isSubmitting}>
                                        {isSubmitting ? 'Requesting...' : 'Confirm Request'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </span>
                </TooltipTrigger>
                {disabledReason && (
                    <TooltipContent>
                        <p>{disabledReason}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}

export default function QuestionDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(location.state?.question || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalId, setProposalId] = useState<string | null>(null);

    const loadQuestionDetails = async () => {
        try {
            setLoading(true);
        } catch (err) {
            console.error('Error loading question details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load question details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const getHumanReadableAnswer = (answerHex: string): string => {
        if (answerHex === INVALID_ANSWER) return "Invalid";
        if (answerHex === ANSWERED_TOO_SOON) return "Answered too Soon";

        if (question?.options && question.options.length > 0) {
            try {
                const index = parseInt(answerHex.slice(2), 16);
                return question.options[index] || `Unknown Option (${answerHex})`;
            } catch (error) {
                console.error('Error parsing answer hex:', error);
                return `Invalid Format (${answerHex})`;
            }
        }

        return answerHex;
    };

    const getProposalId = (data: string) => {
        const parts = data.split('␟');
        return parts[0] || null;
    };

    const parseQuestionData = (question: Question) => {
        const parts = question.data.split('␟');
        if (parts.length >= 2) {
            const daoMatch = question.title.match(/in the ([a-zA-Z0-9]+\.eth) space/);
            return {
                proposalId: parts[0],
                transactionHash: parts[1],
                dao: daoMatch ? daoMatch[1] : null
            };
        }
        return null;
    };

    const formatTitle = (question: Question) => {
        const parsedData = parseQuestionData(question);
        if (!parsedData) return question.title;

        return (
            <div className="space-y-2">
                {parsedData.dao && (
                    <div className="text-tron text-xl font-medium flex items-center gap-2">
                        DAO: {parsedData.dao}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-tron-light/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-md text-sm">{question.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handleBack}
                    className="tron-button inline-flex items-center"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Questions
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-tron text-glow">
                {formatTitle(question)}
            </h1>

            <div className="tron-card mb-6">
                <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Question Details</h2>
                <dl className="grid grid-cols-1 gap-6 p-6">
                    <div>
                        <dt className="font-medium text-tron-light/70">Description</dt>
                        <dd className="mt-1 text-foreground">{question.description}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Status</dt>
                        <dd className="mt-1 flex items-center gap-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(question.phase)}`}>
                                {question.phase}
                            </span>
                            <RequestArbitrationButton
                                question={question}
                                onArbitrationRequested={() => loadQuestionDetails()}
                            />
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
                        <dt className="font-medium text-tron-light/70">Arbitrator</dt>
                        <dd className="mt-1 text-foreground font-mono">{question.arbitrator}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Raw Data</dt>
                        <dd className="mt-1">
                            <div className="flex items-start gap-4">
                                <pre className="flex-1 bg-tron-black/30 p-4 rounded-md overflow-x-auto text-sm border border-tron-dark/30">
                                    {question.data}
                                </pre>
                                {getProposalId(question.data) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-tron flex items-center gap-2"
                                        onClick={() => {
                                            setProposalId(getProposalId(question.data));
                                            setIsProposalModalOpen(true);
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View Proposal
                                    </Button>
                                )}
                            </div>
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium text-tron-light/70">Current Answer</dt>
                        <dd className="mt-1 flex items-center gap-4">
                            <span className="text-foreground">
                                {question.currentAnswer ? getHumanReadableAnswer(question.currentAnswer) : 'No answer yet'}
                            </span>
                        </dd>
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

            <div className="flex justify-end mb-6">
                {question && (
                    <SubmitAnswerButton
                        question={question}
                        onAnswerSubmitted={() => loadQuestionDetails()}
                    />
                )}
            </div>

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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getHumanReadableAnswer(answer.value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(answer.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(answer.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getHumanReadableAnswer(response.value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBond(response.bond)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tron-light/70">{formatDate(response.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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

            {proposalId && (
                <ProposalModal
                    proposalId={proposalId}
                    isOpen={isProposalModalOpen}
                    onClose={() => setIsProposalModalOpen(false)}
                />
            )}
        </div>
    );
}
