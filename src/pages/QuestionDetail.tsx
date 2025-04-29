
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { ArrowLeft } from 'lucide-react';
import TransactionHashModal from '@/components/TransactionHashModal';
import { getProposalDetails, calculateTransactionArrayHash, compareTransactionHashes } from '@/lib/snapshotQuery';
import { useToast } from '@/hooks/use-toast';
import { parseQuestionData } from '@/utils/questionUtils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CHAIN_ID } from '@/config/chainConfig';
import { useQuestion } from '@/hooks/useQuestion';

// Import our components
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import NotFoundDisplay from '@/components/NotFoundDisplay';
import QuestionSummary from '@/components/question/QuestionSummary';
import QuestionChecks from '@/components/question/QuestionChecks';
import ResponseHistory from '@/components/ResponseHistory';
import SubmitAnswerButton from '@/components/SubmitAnswer';
import RequestArbitrationButton from '@/components/RequestArbitration';
import { Card, CardContent } from '@/components/ui/card';

export default function QuestionDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Use the router state if available, otherwise it will be null
    const questionFromState = location.state?.question || null;
    
    // Use the useQuestion hook when we don't have the question from state
    const { question: fetchedQuestion, isLoading, error } = useQuestion(
        questionFromState ? undefined : id
    );
    
    // Use either the question from state or the fetched question
    const [question, setQuestion] = useState<Question | null>(questionFromState);
    
    const [proposalData, setProposalData] = useState<any>(null);
    const [proposalLoading, setProposalLoading] = useState(false);
    const [proposalLoadFailed, setProposalLoadFailed] = useState(false);
    const [hashVerification, setHashVerification] = useState<{
        calculatedHash: string | null;
        match: boolean;
        matchText: string;
        matchClass: string;
        transactionHashes: string[];
    } | null>(null);
    const [hashModalOpen, setHashModalOpen] = useState(false);
    const { toast } = useToast();
    const proposalFetchAttempted = useRef<boolean>(false);

    // Update question when fetched question changes
    useEffect(() => {
        if (fetchedQuestion && !question) {
            setQuestion(fetchedQuestion);
        }
    }, [fetchedQuestion, question]);

    // Handle loading proposal data when question is available
    useEffect(() => {
        if (question && !proposalFetchAttempted.current) {
            const parsedData = parseQuestionData(question);
            if (parsedData?.proposalId) {
                proposalFetchAttempted.current = true;
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
            setProposalLoadFailed(false);
            
            const data = await getProposalDetails(proposalId);
            
            if (data === null) {
                console.log('No proposal data returned from API');
                setProposalLoadFailed(true);
                toast({
                    title: "Proposal Not Found",
                    description: "This proposal was not found in Snapshot. It may not be a DAO proposal or the Snapshot API is unavailable.",
                    variant: "default"
                });
            } else {
                setProposalData(data);
            }
        } catch (error) {
            console.error('Failed to fetch proposal:', error);
            setProposalLoadFailed(true);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load proposal details. Please try again later."
            });
        } finally {
            setProposalLoading(false);
        }
    };

    // Function to reload question details
    const loadQuestionDetails = () => {
        if (id) {
            // Reset the current state
            proposalFetchAttempted.current = false;
            
            // Force a re-fetch of the question
            const { question: refetchedQuestion } = useQuestion(id);
            if (refetchedQuestion) {
                setQuestion(refetchedQuestion);
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Show loading state if we're still loading the question
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Show error if there was an error fetching the question
    if (error) {
        return <ErrorDisplay error={error} onBack={handleBack} />;
    }

    // Show not found if there's no question
    if (!question) {
        return <NotFoundDisplay onBack={handleBack} />;
    }

    return (
        <div className="w-[85%] mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handleBack}
                    className="steel-button inline-flex items-center"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Questions
                </button>
            </div>

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Question Summary Section */}
                    <QuestionSummary 
                        question={question} 
                        proposalData={proposalData}
                        proposalLoading={proposalLoading}
                        proposalLoadFailed={proposalLoadFailed}
                    />
                    
                    {/* Verification Checks Section */}
                    <QuestionChecks 
                        question={question} 
                        hashVerification={hashVerification} 
                        onViewHashDetails={() => setHashModalOpen(true)}
                        proposalData={proposalData}
                    />
                    
                    {/* Answer History Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-between">
                                <div className="text-xl font-semibold ethereal-text">Answer History</div>
                                <div className="flex items-center gap-2">
                                    <RequestArbitrationButton
                                        question={question}
                                        onArbitrationRequested={loadQuestionDetails}
                                    />
                                    <SubmitAnswerButton
                                        question={question}
                                        onAnswerSubmitted={loadQuestionDetails}
                                    />
                                </div>
                            </div>
                            <ResponseHistory question={question} />
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>

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
