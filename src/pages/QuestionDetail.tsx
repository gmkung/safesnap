
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { ArrowLeft, Info, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ProposalModal from '@/components/ProposalModal';
import SubmitAnswerButton from '@/components/SubmitAnswer';
import QuestionTitle from '@/components/QuestionTitle';
import QuestionDetails from '@/components/QuestionDetails';
import TemplateInfo from '@/components/TemplateInfo';
import ResponseHistory from '@/components/ResponseHistory';
import ContractInfo from '@/components/ContractInfo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { parseQuestionData } from '@/utils/questionUtils';

export default function QuestionDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(location.state?.question || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalId, setProposalId] = useState<string | null>(null);

    // Extract proposal ID from question data if available
    useEffect(() => {
        if (question) {
            const parsedData = parseQuestionData(question);
            if (parsedData?.proposalId) {
                setProposalId(parsedData.proposalId);
            }
        }
    }, [question]);

    // Fetch proposal details directly in the main view
    const { data: proposalData, isLoading: proposalLoading } = useQuery({
        queryKey: ['proposal', proposalId],
        queryFn: () => proposalId ? getProposalDetails(proposalId) : Promise.resolve(null),
        enabled: !!proposalId,
    });

    const loadQuestionDetails = async () => {
        try {
            setLoading(true);
            // Here you would normally fetch the question details from an API
            // Since we're using the state from location, we're just setting loading to false
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

    const handleViewProposal = (id: string) => {
        setProposalId(id);
        setIsProposalModalOpen(true);
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
                <QuestionTitle 
                    question={question} 
                    onViewProposal={handleViewProposal}
                    proposalData={proposalData}
                    isProposalLoading={proposalLoading}
                />
            </h1>

            <div className="flex flex-col gap-6 mb-8">
                <div className="w-full">
                    <QuestionDetails 
                        question={question} 
                        onArbitrationRequested={loadQuestionDetails}
                        onViewProposal={handleViewProposal}
                        proposalData={proposalData}
                    />
                </div>
                
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
