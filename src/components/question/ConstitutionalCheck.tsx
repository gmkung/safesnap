
import { Question } from 'reality-kleros-subgraph';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, BookText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { parseQuestionData } from '@/utils/questionUtils';

interface ConstitutionalCheckProps {
  question: Question;
}

export default function ConstitutionalCheck({ question }: ConstitutionalCheckProps) {
  const parsedData = parseQuestionData(question);
  const daoName = parsedData?.dao || null;
  
  if (!daoName) return null;
  
  const constitutionUrl = daoName ? `https://example.com/dao/${daoName}/constitution` : "https://example.com/constitution";
  
  return (
    <div className="flex items-center gap-2 my-1">
      <span className="text-sm text-space-light/70 min-w-24">Constitution Check:</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                "flex items-center gap-1 cursor-pointer",
                "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/30"
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Manual Review</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs glass-panel border-space/30">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>This check requires manual review. Please read the DAO constitution to ensure this proposal complies with all governance rules.</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button 
        variant="ghost"
        size="sm"
        asChild
        className="text-space hover:text-space-accent transition-colors text-xs gap-1 h-auto py-1"
      >
        <a 
          href={constitutionUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookText className="h-3 w-3 mr-1" />
          <span>View DAO Constitution</span>
        </a>
      </Button>
    </div>
  );
}
