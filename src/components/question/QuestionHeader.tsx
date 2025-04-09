
import { Question } from 'reality-kleros-subgraph';
import { ExternalLink } from 'lucide-react';
import { CHAIN_ID } from '@/config/chainConfig';

interface QuestionHeaderProps {
  question: Question;
}

// Function to get Reality.eth URL for a question
export function getRealityEthUrl(question: Question): string {
  return `https://reality.eth.limo/app/index.html#!/network/${CHAIN_ID}/question/${question.contract.address}-${question.id}`;
}

export default function QuestionHeader({ question }: QuestionHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-space-dark/30 relative">
      <h2 className="text-xl font-semibold ethereal-text">
        Question Details
      </h2>
      <a 
        href={getRealityEthUrl(question)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-space hover:text-space-accent transition-colors text-sm"
      >
        <span>View on Reality.eth</span>
        <ExternalLink className="ml-1 h-3.5 w-3.5" />
      </a>
      <span className="absolute bottom-0 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-space/30 to-transparent"></span>
    </div>
  );
}
