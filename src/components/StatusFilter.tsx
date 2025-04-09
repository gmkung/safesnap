
import { useState } from 'react';
import { QuestionPhase } from 'reality-kleros-subgraph';
import { Check, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatusFilterProps {
  selectedStatuses: QuestionPhase[];
  onChange: (statuses: QuestionPhase[]) => void;
}

export const statusLabels: Record<QuestionPhase, string> = {
  [QuestionPhase.NOT_CREATED]: 'Not Created',
  [QuestionPhase.UPCOMING]: 'Upcoming',
  [QuestionPhase.OPEN]: 'Open',
  [QuestionPhase.PENDING_ARBITRATION]: 'Pending Arbitration',
  [QuestionPhase.FINALIZED]: 'Finalized',
};

export function StatusFilter({ selectedStatuses, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false);

  const handleStatusToggle = (status: QuestionPhase) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  const allStatuses = Object.values(QuestionPhase);

  return (
    <div className="w-full">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter by Status</span>
            </div>
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 backdrop-blur-md bg-background/80">
          <DropdownMenuLabel>Question Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allStatuses.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => handleStatusToggle(status)}
              className="capitalize"
            >
              {statusLabels[status]}
            </DropdownMenuCheckboxItem>
          ))}
          {selectedStatuses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
