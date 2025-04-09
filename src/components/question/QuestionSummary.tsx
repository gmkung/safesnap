
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData } from '@/utils/questionUtils';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/utils/questionUtils';
import CopyButton from '../CopyButton';

interface QuestionSummaryProps {
  question: Question;
  proposalData: any;
}

export default function QuestionSummary({ question, proposalData }: QuestionSummaryProps) {
  const parsedData = parseQuestionData(question);

  const getSnapshotUrl = (spaceId: string, proposalId: string) => {
    return `https://snapshot.org/#/${spaceId}/proposal/${proposalId}`;
  };

  return (
    <Card className="steel-panel mb-6">
      <div className="p-4 border-b border-space-dark/30 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-space" />
        <CardTitle className="text-xl font-semibold ethereal-text">Question Summary</CardTitle>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-space-light/70">Question ID</h3>
            <div className="mt-1 flex items-center">
              <code className="bg-space-dark/30 px-2 py-1 rounded text-xs font-mono break-all flex-grow">
                {question.id.slice(0, 10)}...{question.id.slice(-8)}
              </code>
              <CopyButton textToCopy={question.id} size="xs" className="ml-1" />
            </div>
          </div>
          
          {parsedData?.proposalId && (
            <div>
              <h3 className="text-sm font-medium text-space-light/70 flex items-center">
                Proposal ID
                {proposalData && (
                  <a 
                    href={getSnapshotUrl(proposalData.space.id, proposalData.id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    <ExternalLink className="h-4 w-4 text-space-light/70 hover:text-space transition-colors" />
                  </a>
                )}
              </h3>
              <div className="mt-1 flex items-center">
                <code className="text-foreground font-mono text-xs break-all flex-grow">
                  {parsedData.proposalId.slice(0, 10)}...{parsedData.proposalId.slice(-8)}
                </code>
                <CopyButton textToCopy={parsedData.proposalId} size="xs" className="ml-1" />
              </div>
            </div>
          )}
          
          {proposalData && (
            <>
              <div>
                <h3 className="text-sm font-medium text-space-light/70">Proposal Title</h3>
                <p className="mt-1 text-sm">{proposalData.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Author
                </h3>
                <div className="mt-1 flex items-center">
                  <code className="text-foreground font-mono text-xs">
                    {`${proposalData.author.slice(0, 6)}...${proposalData.author.slice(-4)}`}
                  </code>
                  <CopyButton textToCopy={proposalData.author} size="xs" className="ml-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created
                </h3>
                <p className="mt-1 text-sm">{formatDate(proposalData.created * 1000)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-space-light/70 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> End Date
                </h3>
                <p className="mt-1 text-sm">{formatDate(proposalData.end * 1000)}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
