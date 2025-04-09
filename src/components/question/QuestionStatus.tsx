
import { Question } from 'reality-kleros-subgraph';
import RequestArbitrationButton from '../RequestArbitration';
import { getStatusBadgeClass } from '@/utils/questionUtils';

interface QuestionStatusProps {
  question: Question;
  onArbitrationRequested: () => void;
}

export default function QuestionStatus({ question, onArbitrationRequested }: QuestionStatusProps) {
  return (
    <div className="flex items-center gap-4">
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(question.phase)}`}>
        {question.phase}
      </span>
      <RequestArbitrationButton
        question={question}
        onArbitrationRequested={onArbitrationRequested}
      />
    </div>
  );
}
