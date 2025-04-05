
import { Question } from 'reality-kleros-subgraph';

interface QuestionTitleProps {
    question: Question;
}

export default function QuestionTitle({ question }: QuestionTitleProps) {
    return (
        <h1 className="text-3xl font-bold mb-6 text-space text-glow">{question.title}</h1>
    );
}
