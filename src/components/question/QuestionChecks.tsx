
import { Question } from 'reality-kleros-subgraph';
import HashCheck from './HashCheck';
import QuorumCheck from './QuorumCheck';
import ConstitutionalCheck from './ConstitutionalCheck';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { GavelIcon, ShieldCheck } from 'lucide-react';

interface QuestionChecksProps {
  question: Question;
  hashVerification: any;
  onViewHashDetails: () => void;
  proposalData: any;
}

export default function QuestionChecks({ 
  question, 
  hashVerification, 
  onViewHashDetails,
  proposalData
}: QuestionChecksProps) {
  return (
    <Card className="steel-panel mb-6">
      <div className="p-4 border-b border-space-dark/30 flex items-center">
        <ShieldCheck className="h-5 w-5 mr-2 text-space" />
        <CardTitle className="text-xl font-semibold ethereal-text">Verification Checks</CardTitle>
      </div>
      <CardContent className="p-4 space-y-3">
        <HashCheck 
          question={question} 
          hashVerification={hashVerification} 
          onViewHashDetails={onViewHashDetails} 
        />
        <QuorumCheck 
          question={question} 
          proposalData={proposalData} 
        />
        <ConstitutionalCheck 
          question={question} 
        />
      </CardContent>
    </Card>
  );
}
