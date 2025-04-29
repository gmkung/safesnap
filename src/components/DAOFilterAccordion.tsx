
import { useState } from 'react';
import { ChevronDown, Shield, ShieldCheck } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { Toggle } from "@/components/ui/toggle";
import { whitelistedDAOs } from '@/config/daoWhitelist';

interface DAOFilterAccordionProps {
  daoList: { name: string; count: number }[];
  currentDao: string | null;
}

export function DAOFilterAccordion({ daoList, currentDao }: DAOFilterAccordionProps) {
  const [open, setOpen] = useState(true);
  const [showOnlyWhitelisted, setShowOnlyWhitelisted] = useState(true);
  const navigate = useNavigate();

  const handleDaoClick = (daoName: string) => {
    if (daoName === currentDao) {
      navigate('/');
    } else {
      navigate(`/ens/${daoName}`);
    }
  };

  // Filter the list based on whitelist toggle
  const filteredDaoList = showOnlyWhitelisted
    ? daoList.filter(dao => whitelistedDAOs.some(wl => wl.ens === dao.name))
    : daoList;

  const handleWhitelistToggle = () => {
    setShowOnlyWhitelisted(!showOnlyWhitelisted);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        <span>DAOs</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-auto mr-1" 
                     style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex items-center justify-between mb-2 mt-2 text-xs">
          <span className="text-muted-foreground">Filter Mode</span>
          <Toggle 
            size="sm" 
            pressed={showOnlyWhitelisted}
            onPressedChange={handleWhitelistToggle}
            className="h-6 text-xs p-0.5"
          >
            {showOnlyWhitelisted ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
            {showOnlyWhitelisted ? "Whitelisted" : "All"}
          </Toggle>
        </div>

        <div className="space-y-1 mt-2">
          {filteredDaoList.map((dao) => {
            const whitelistedDAO = whitelistedDAOs.find(wl => wl.ens === dao.name);
            return (
              <button
                key={dao.name}
                onClick={() => handleDaoClick(dao.name)}
                className={`
                  flex items-center w-full px-2 py-1.5 text-sm rounded-md
                  ${currentDao === dao.name ? 'bg-space/15 text-space font-medium' : 'hover:bg-space-darkBlue/20 text-space-light/90'}
                  transition-colors duration-200
                `}
              >
                {whitelistedDAO && (
                  <img 
                    src={whitelistedDAO.logo} 
                    alt={`${dao.name} logo`} 
                    className="h-4 w-4 mr-2 rounded-full" 
                  />
                )}
                <span className="truncate">{dao.name}</span>
                {whitelistedDAO && (
                  <ShieldCheck className="h-3 w-3 ml-2 text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
