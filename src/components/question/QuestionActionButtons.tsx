
import { Question } from 'reality-kleros-subgraph';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Info } from 'lucide-react';
import TemplateInfo from '../TemplateInfo';
import ContractInfo from '../ContractInfo';

interface QuestionActionButtonsProps {
  question: Question;
}

export default function QuestionActionButtons({ question }: QuestionActionButtonsProps) {
  return (
    <div className="flex space-x-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="tron" size="sm" glow={false}>
            <Info className="mr-2 h-4 w-4" />
            Additional Details
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-panel max-h-[90vh] max-w-4xl w-[90vw] overflow-y-auto">
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
            
            {question.options && question.options.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-space-light/70 mb-2">Options</h3>
                <div className="glass-panel p-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="text-foreground">
                      {index + 1}. {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-space-light/70 mb-2">Question Type</h3>
              <div className="glass-panel p-4">
                <p className="text-foreground">{question.qType}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-space-light/70 mb-2">Oracle Contract Information</h3>
              <ContractInfo question={question} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
