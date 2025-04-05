import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { ArrowLeft, Info, Database, Loader2, CheckCircle, XCircle, AlertTriangle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubmitAnswerButton from '@/components/SubmitAnswer';
import QuestionTitle from '@/components/QuestionTitle';
import QuestionDetails from '@/components/QuestionDetails';
import TemplateInfo from '@/components/TemplateInfo';
import ResponseHistory from '@/components/ResponseHistory';
import ContractInfo from '@/components/ContractInfo';
import TransactionHashModal from '@/components/TransactionHashModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getProposalDetails, calculateTransactionArrayHash, compareTransactionHashes } from '@/lib/snapshotQuery';
import { useToast } from '@/hooks/use-toast';
import { parseQuestionData } from '@/utils/questionUtils';
import { cn } from '@/lib/utils';

export default function QuestionDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(location.state?.question || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [proposalData, setProposalData] = useState<any>(null);
    const [proposalLoading, setProposalLoading] = useState(false);
    const [hashVerification, setHashVerification] = useState<{
        calculatedHash: string | null;
        match: boolean;
        matchText: string;
        matchClass: string;
        transactionHashes: string[];
    } | null>(null);
    const [hashModalOpen, setHashModalOpen] = useState(false);
    const { toast } = useToast();

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

    useEffect(() => {
        if (question) {
            const parsedData = parseQuestionData(question);
            if (parsedData?.proposalId) {
                fetchProposalData(parsedData.proposalId);
            }
        }
    }, [question]);

    useEffect(() => {
        if (proposalData && question) {
            validateTransactionHash();
        }
    }, [proposalData, question]);

    const validateTransactionHash = () => {
        const parsedData = parseQuestionData(question!);
        if (!parsedData?.transactionHash || !proposalData) return;

        const { calculatedHash, transactionHashes } = calculateTransactionArrayHash(proposalData);
        const verification = compareTransactionHashes(parsedData.transactionHash, calculatedHash);

        setHashVerification({
            calculatedHash,
            match: verification.match,
            matchText: verification.matchText,
            matchClass: verification.matchClass,
            transactionHashes
        });
    };

    const fetchProposalData = async (proposalId: string) => {
        try {
            setProposalLoading(true);
            const data = await getProposalDetails(proposalId);
            setProposalData(data);
        } catch (error) {
            console.error('Failed to fetch proposal:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load proposal details. Please try again."
            });
        } finally {
            setProposalLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const getSnapshotUrl = (spaceId: string, proposalId: string) => {
        return `https://v1.snapshot.box/#/${spaceId}/proposal/${proposalId}`;
    };

    if (loading && !question) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-circuit-flow h-12 w-12 rounded-full border-2 border-space relative">
                    <div className="absolute inset-0 rounded-full shadow-steel"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 max-w-4xl mx-auto">
                <div className="steel-panel p-6">
                    <h2 className="text-xl font-semibold mb-4 ethereal-text">Error</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className="steel-button mt-4">
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
                <div className="steel-panel p-6">
                    <h2 className="text-xl font-semibold mb-4 ethereal-text">Question Not Found</h2>
                    <p className="mb-4">This might happen if you accessed this page directly.
                        Please go back to the questions list and click on a question to view its details.</p>
                    <button onClick={handleBack} className="steel-button">
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
                    className="steel-button inline-flex items-center"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Questions
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-6 ethereal-text text-glow">
                <QuestionTitle question={question} />
            </h1>

            <div className="flex flex-col gap-6 mb-8">
                <div className="w-full">
                    <QuestionDetails 
                        question={question} 
                        onArbitrationRequested={loadQuestionDetails}
                        onViewProposal={() => {}} 
                        proposalData={proposalData}
                    />
                </div>
                
                {proposalLoading ? (
                    <div className="w-full steel-panel p-6 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-space" />
                        <span className="ml-2">Loading proposal details...</span>
                    </div>
                ) : proposalData ? (
                    <div className="w-full steel-panel">
                        <h2 className="text-xl font-semibold ethereal-text p-4 border-b border-space-dark/30">Proposal Details</h2>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-xl font-bold text-space">
                                    {proposalData.title}
                                </div>
                            </div>
                            
                            {hashVerification && (
                                <div className={cn(
                                    "p-4 rounded-md border",
                                    hashVerification.match 
                                        ? "border-green-500/30 bg-green-500/10" 
                                        : hashVerification.calculatedHash 
                                            ? "border-red-500/30 bg-red-500/10"
                                            : "border-yellow-500/30 bg-yellow-500/10"
                                )}>
                                    <div className="flex items-center gap-2 mb-3">
                                        {hashVerification.match ? (
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : hashVerification.calculatedHash ? (
                                            <XCircle className="h-6 w-6 text-red-500" />
                                        ) : (
                                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                        )}
                                        <span className={cn("text-lg font-medium", hashVerification.matchClass)}>
                                            {hashVerification.matchText}
                                        </span>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="ml-auto"
                                            onClick={() => setHashModalOpen(true)}
                                        >
                                            <Calculator className="h-4 w-4 mr-2" />
                                            View Calculation Details
                                        </Button>
                                    </div>
                                    
                                    {hashVerification.calculatedHash && (
                                        <div className="text-sm mt-2">
                                            <span className="font-medium text-space-light/70">Calculated Hash:</span>
                                            <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded text-sm font-mono break-all">
                                                {hashVerification.calculatedHash}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            )}

                            {hashVerification && (
                                <TransactionHashModal 
                                    open={hashModalOpen} 
                                    onOpenChange={setHashModalOpen}
                                    calculatedHash={hashVerification.calculatedHash}
                                    expectedHash={parseQuestionData(question)?.transactionHash || ''}
                                    transactionHashes={hashVerification.transactionHashes}
                                    match={hashVerification.match}
                                    proposalData={proposalData}
                                />
                            )}

                            <div className="text-sm text-space-light/70">
                                Space: {proposalData.space.name}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-space-light/70">Author:</span>
                                    <code className="ml-2 bg-space-dark/30 px-2 py-1 rounded">
                                        {`${proposalData.author.slice(0, 6)}...${proposalData.author.slice(-4)}`}
                                    </code>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">State:</span>
                                    <span className="ml-2 capitalize">{proposalData.state}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Start:</span>
                                    <span className="ml-2">{formatDate(proposalData.start)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">End:</span>
                                    <span className="ml-2">{formatDate(proposalData.end)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Created:</span>
                                    <span className="ml-2">{formatDate(proposalData.created)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Snapshot:</span>
                                    <span className="ml-2">{proposalData.snapshot}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Network:</span>
                                    <span className="ml-2">{proposalData.network}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Type:</span>
                                    <span className="ml-2 capitalize">{proposalData.type}</span>
                                </div>
                                {proposalData.quorum && (
                                    <div>
                                        <span className="font-medium text-space-light/70">Quorum:</span>
                                        <span className="ml-2">{proposalData.quorum} {proposalData.symbol}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-space-light/70">Privacy:</span>
                                    <span className="ml-2 capitalize">{proposalData.privacy}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-space-light/70">Total Votes:</span>
                                    <span className="ml-2">{proposalData.votes}</span>
                                </div>
                                {proposalData.scores_total !== undefined && (
                                    <div>
                                        <span className="font-medium text-space-light/70">Score:</span>
                                        <span className="ml-2">{proposalData.scores_total.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {proposalData.labels && proposalData.labels.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-space-light/70 mb-2">Labels:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {proposalData.labels.map((label, index) => (
                                            <span key={index} className="px-2 py-1 bg-space-dark/30 rounded">
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {proposalData.choices && proposalData.choices.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-space-light/70 mb-2">Choices:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {proposalData.choices.map((choice, index) => (
                                            <li key={index}>
                                                {choice}
                                                {proposalData.scores && proposalData.scores[index] !== undefined && (
                                                    <span className="ml-2 text-space-light/70">
                                                        ({proposalData.scores[index].toFixed(2)} {proposalData.symbol})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {proposalData.strategies && proposalData.strategies.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-space-light/70 mb-2">Voting Strategies:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {proposalData.strategies.map((strategy, index) => (
                                            <li key={index}>
                                                {strategy.name} ({strategy.network})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {proposalData.plugins?.safeSnap && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-space-light/70 mb-2">SafeSnap Transactions:</h3>
                                    <div className="space-y-4">
                                        {proposalData.plugins.safeSnap.safes.map((safe, safeIndex) => (
                                            <div key={safeIndex} className="bg-space-dark/30 p-4 rounded">
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                    <div>
                                                        <span className="font-medium text-space-light/70">Network:</span>
                                                        <span className="ml-2">{safe.network}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-space-light/70">Reality Address:</span>
                                                        <code className="ml-2 bg-space-dark/50 px-2 py-1 rounded">
                                                            {`${safe.realityAddress.slice(0, 6)}...${safe.realityAddress.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-space-light/70">MultiSend Address:</span>
                                                        <code className="ml-2 bg-space-dark/50 px-2 py-1 rounded">
                                                            {`${safe.multiSendAddress.slice(0, 6)}...${safe.multiSendAddress.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-space-light/70">Safe Hash:</span>
                                                        <code className="ml-2 bg-space-dark/50 px-2 py-1 rounded">
                                                            {`${safe.hash.slice(0, 6)}...${safe.hash.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {safe.txs.map((tx, txIndex) => (
                                                        <div key={txIndex} className="bg-space-dark/50 p-3 rounded">
                                                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                                <div>
                                                                    <span className="font-medium text-space-light/70">Transaction Hash:</span>
                                                                    <code className="ml-2 bg-space-dark/70 px-2 py-1 rounded">
                                                                        {`${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`}
                                                                    </code>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-space-light/70">Nonce:</span>
                                                                    <span className="ml-2">{tx.nonce}</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                {tx.transactions.map((subTx, subTxIndex) => (
                                                                    <div key={subTxIndex} className="bg-space-dark/70 p-2 rounded text-xs">
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            <div>
                                                                                <span className="font-medium text-space-light/70">To:</span>
                                                                                <code className="ml-2">
                                                                                    {`${subTx.to.slice(0, 6)}...${subTx.to.slice(-4)}`}
                                                                                </code>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-space-light/70">Value:</span>
                                                                                <span className="ml-2">{subTx.value}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-space-light/70">Operation:</span>
                                                                                <span className="ml-2">{subTx.operation}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-space-light/70">Nonce:</span>
                                                                                <span className="ml-2">{subTx.nonce}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <span className="font-medium text-space-light/70">Data:</span>
                                                                            <code className="ml-2 break-all">
                                                                                {subTx.data}
                                                                            </code>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {proposalData.discussion && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-space-light/70 mb-2">Discussion:</h3>
                                    <a 
                                        href={proposalData.discussion}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-space hover:underline"
                                    >
                                        View Discussion →
                                    </a>
                                </div>
                            )}

                            {proposalData.flagged && (
                                <div className="mt-4 text-amber-500">
                                    ⚠️ This proposal has been flagged
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="steel-panel p-6 text-center text-space-light/70">
                        No proposal data available
                    </div>
                )}
                
                <div className="w-full">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-between">
                                <div className="text-xl font-semibold ethereal-text">Answer History</div>
                                <SubmitAnswerButton
                                    question={question}
                                    onAnswerSubmitted={loadQuestionDetails}
                                />
                            </div>
                            <ResponseHistory question={question} />
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="steel" className="w-full">
                                <Info className="mr-2 h-4 w-4" />
                                Additional Question Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl ethereal-text">Additional Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                {question.description && (
                                    <div>
                                        <h3 className="text-lg font-medium text-space-light/70 mb-2">Description</h3>
                                        <div className="glass-panel p-4">{question.description}</div>
                                    </div>
                                )}
                                {question.data && (
                                    <div>
                                        <h3 className="text-lg font-medium text-space-light/70 mb-2">Raw Data</h3>
                                        <pre className="glass-panel p-4 overflow-x-auto text-sm whitespace-pre-wrap">
                                            {question.data}
                                        </pre>
                                    </div>
                                )}
                                <TemplateInfo question={question} />
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="steel" className="w-full">
                                <Database className="mr-2 h-4 w-4" />
                                Oracle Contract Info
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl ethereal-text">Oracle Contract Information</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                <ContractInfo question={question} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
