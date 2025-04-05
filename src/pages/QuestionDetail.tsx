
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProposalModal from '@/components/ProposalModal';
import SubmitAnswerButton from '@/components/SubmitAnswer';
import QuestionTitle from '@/components/QuestionTitle';
import QuestionDetails from '@/components/QuestionDetails';
import TemplateInfo from '@/components/TemplateInfo';
import AnswerHistory from '@/components/AnswerHistory';
import ResponseHistory from '@/components/ResponseHistory';
import ContractInfo from '@/components/ContractInfo';

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
                <QuestionTitle question={question} />
            </h1>

            <QuestionDetails 
                question={question} 
                onArbitrationRequested={loadQuestionDetails}
                onViewProposal={handleViewProposal}
            />

            <div className="flex justify-end mb-6">
                <SubmitAnswerButton
                    question={question}
                    onAnswerSubmitted={loadQuestionDetails}
                />
            </div>

            <TemplateInfo question={question} />
            <AnswerHistory question={question} />
            <ResponseHistory question={question} />
            <ContractInfo question={question} />

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
