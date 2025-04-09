
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

interface DAOFilterAccordionProps {
  daoList: { name: string; count: number }[];
  currentDao: string | null;
}

export function DAOFilterAccordion({ daoList, currentDao }: DAOFilterAccordionProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleDaoClick = (daoName: string) => {
    if (daoName === currentDao) {
      navigate('/');
    } else {
      navigate(`/ens/${daoName}`);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        <span>DAOs</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-auto mr-1" 
                     style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 mt-2">
          {daoList.map((dao) => (
            <button
              key={dao.name}
              onClick={() => handleDaoClick(dao.name)}
              className={`
                flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md
                ${currentDao === dao.name ? 'bg-space/15 text-space font-medium' : 'hover:bg-space-darkBlue/20 text-space-light/90'}
                transition-colors duration-200
              `}
            >
              <span className="truncate">{dao.name}</span>
              <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-space-darkBlue/30">
                {dao.count}
              </span>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
