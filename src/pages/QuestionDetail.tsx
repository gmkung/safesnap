
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { ArrowLeft } from 'lucide-react';
import QuestionTitle from '@/components/QuestionTitle';
import TransactionHashModal from '@/components/TransactionHashModal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { getProposalDetails, calculateTransactionArrayHash, compareTransactionHashes } from '@/lib/snapshotQuery';
import { useToast } from '@/hooks/use-toast';
import { parseQuestionData } from '@/utils/questionUtils';

// Import our new components
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import NotFoundDisplay from '@/components/NotFoundDisplay';
import QuestionDetailsPanel from '@/components/QuestionDetailsPanel';
import SnapshotProposalSummary from '@/components/SnapshotProposalSummary';

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

    // Conditional rendering based on state
    if (loading && !question) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorDisplay error={error} onBack={handleBack} />;
    }

    if (!question) {
        return <NotFoundDisplay onBack={handleBack} />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
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

            <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
                {/* Left Column: Question Details & Answer History */}
                <ResizablePanel defaultSize={65} minSize={40}>
                    <QuestionDetailsPanel
                        question={question}
                        onArbitrationRequested={loadQuestionDetails}
                        hashVerification={hashVerification}
                        onViewHashDetails={() => setHashModalOpen(true)}
                        proposalData={proposalData}
                    />
                </ResizablePanel>

                {/* Resizable Handle */}
                <ResizableHandle withHandle />

                {/* Right Column: Snapshot Proposal Summary */}
                <ResizablePanel defaultSize={35} minSize={30}>
                    <div className="pl-4">
                        <SnapshotProposalSummary
                            proposalLoading={proposalLoading}
                            proposalData={proposalData}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* Transaction Hash Modal */}
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
        </div>
    );
}
