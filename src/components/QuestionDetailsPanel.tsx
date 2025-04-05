
import { Card, CardContent } from '@/components/ui/card';
import QuestionDetails from '@/components/QuestionDetails';
import ResponseHistory from '@/components/ResponseHistory';
import SubmitAnswerButton from '@/components/SubmitAnswer';
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData } from '@/utils/questionUtils';

interface QuestionDetailsPanelProps {
  question: Question;
  onArbitrationRequested: () => void;
  hashVerification: any;
  onViewHashDetails: () => void;
  proposalData: any;
}

export default function QuestionDetailsPanel({ 
  question, 
  onArbitrationRequested, 
  hashVerification, 
  onViewHashDetails,
  proposalData 
}: QuestionDetailsPanelProps) {
  const parsedData = parseQuestionData(question);
  
  return (
    <div className="flex flex-col gap-6 pr-4">
      {/* Question Details Section */}
      <div className="w-full">
        <QuestionDetails 
          question={question} 
          onArbitrationRequested={onArbitrationRequested}
          onViewProposal={() => {}} 
          proposalData={proposalData}
          hashVerification={hashVerification}
          onViewHashDetails={onViewHashDetails}
        />
      </div>
      
      {/* Answer History Section */}
      <div className="w-full">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-between">
              <div className="text-xl font-semibold ethereal-text">Answer History</div>
              <SubmitAnswerButton
                question={question}
                onAnswerSubmitted={onArbitrationRequested}
              />
            </div>
            <ResponseHistory question={question} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
