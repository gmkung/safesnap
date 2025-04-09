
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionPhaseValue, statusLabels } from './StatusFilter';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface StatusFilterAccordionProps {
  selectedStatuses: QuestionPhaseValue[];
  onChange: (statuses: QuestionPhaseValue[]) => void;
}

export function StatusFilterAccordion({ selectedStatuses, onChange }: StatusFilterAccordionProps) {
  const [open, setOpen] = useState(true);

  const toggleStatus = (status: QuestionPhaseValue) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  const allStatuses: QuestionPhaseValue[] = [
    "NOT_CREATED",
    "UPCOMING",
    "OPEN",
    "PENDING_ARBITRATION",
    "FINALIZED"
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        <span>Status</span>
        {selectedStatuses.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedStatuses.length}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-auto mr-1" 
                     style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 mt-2">
          {allStatuses.map((status) => (
            <Button 
              key={status}
              variant="ghost" 
              size="sm" 
              className="justify-start h-8 px-2 text-sm font-normal w-full"
              onClick={() => toggleStatus(status)}
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                {selectedStatuses.includes(status) && (
                  <Check className="h-4 w-4 text-space-accent" />
                )}
              </div>
              <span>{statusLabels[status]}</span>
            </Button>
          ))}
          
          {selectedStatuses.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-space-gray justify-center mt-1" 
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
