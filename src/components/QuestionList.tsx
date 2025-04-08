
import { Question } from 'reality-kleros-subgraph';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { QuestionRowSkeleton } from './ui/skeleton';
import { TooltipProvider } from './ui/tooltip';
import { QuestionItem } from './QuestionItem';
import { QuestionListPagination } from './QuestionListPagination';
import { useProposalTitles } from '@/hooks/useProposalTitles';

interface QuestionListProps {
  questions: Question[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  totalQuestions: number;
}

const ITEMS_PER_PAGE = 10;

export function QuestionList({ questions, currentPage, onPageChange, isLoading, totalQuestions }: QuestionListProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);
  const { proposalTitles, loadingProposals } = useProposalTitles(questions);

  const handleQuestionClick = (question: Question) => {
    navigate(`/question/${question.id}`, { state: { question } });
  };

  if (isLoading && questions.length === 0) {
    return (
      <Card className="tron-card max-w-5xl mx-auto bg-transparent">
        <div className="p-4">
          <div className="space-y-6">
            {Array(5).fill(0).map((_, i) => (
              <QuestionRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="tron-card max-w-5xl mx-auto bg-transparent backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionItem 
                key={question.id}
                question={question} 
                proposalTitles={proposalTitles}
                loadingProposals={loadingProposals}
                onQuestionClick={handleQuestionClick}
              />
            ))}
          </div>

          <QuestionListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalQuestions={totalQuestions}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={onPageChange}
          />
        </div>
      </Card>
    </TooltipProvider>
  );
}
