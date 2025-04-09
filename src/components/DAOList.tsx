
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Filter, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { whitelistedDAOs } from '@/config/daoWhitelist';

interface DAOListProps {
  daoList: string[];
  currentDao: string | null;
}

export function DAOList({ daoList, currentDao }: DAOListProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  // Changed default to true to make "Whitelisted" the default setting
  const [showOnlyWhitelisted, setShowOnlyWhitelisted] = useState(true);
  const [filteredList, setFilteredList] = useState<string[]>([]);
  
  // Update the filtered list when the whitelist toggle or daoList changes
  useEffect(() => {
    if (showOnlyWhitelisted) {
      const whitelistedENS = whitelistedDAOs.map(dao => dao.ens);
      setFilteredList(daoList.filter(dao => whitelistedENS.includes(dao)));
    } else {
      setFilteredList(daoList);
    }
  }, [showOnlyWhitelisted, daoList]);
  
  if (daoList.length === 0) {
    return null;
  }
  
  const handleDaoClick = (dao: string) => {
    // Navigate to filtered view with the /ens/ prefix
    navigate(`/ens/${dao}`);
    setIsOpen(false);
  };
  
  const handleAllDaosClick = () => {
    // Navigate to the home page (unfiltered)
    navigate('/');
    setIsOpen(false);
  };
  
  const handleWhitelistToggle = () => {
    setShowOnlyWhitelisted(!showOnlyWhitelisted);
  };
  
  // Find logo for current DAO if it's whitelisted
  const getCurrentDaoLogo = () => {
    if (!currentDao) return null;
    const whitelistedDAO = whitelistedDAOs.find(dao => dao.ens === currentDao);
    return whitelistedDAO?.logo;
  };
  
  const currentDaoLogo = getCurrentDaoLogo();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3">
        <span className="text-xs text-muted-foreground">Filter Mode</span>
        <Toggle 
          size="sm" 
          aria-label="Toggle whitelist" 
          pressed={showOnlyWhitelisted}
          onPressedChange={handleWhitelistToggle}
          className="h-6 text-xs"
        >
          {showOnlyWhitelisted ? (
            <ShieldCheck className="h-3 w-3 mr-1" />
          ) : (
            <Shield className="h-3 w-3 mr-1" />
          )}
          {showOnlyWhitelisted ? "Whitelisted" : "All"}
        </Toggle>
      </div>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between text-xs h-8"
          >
            <div className="flex items-center">
              {currentDaoLogo && (
                <img 
                  src={currentDaoLogo} 
                  alt={`${currentDao} logo`} 
                  className="h-4 w-4 mr-2 rounded-full"
                />
              )}
              {currentDao ? currentDao : "Select DAO"}
            </div>
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[200px] bg-popover border border-border shadow-md" 
          align="start"
        >
          <DropdownMenuItem 
            className={!currentDao ? "bg-accent text-accent-foreground" : ""}
            onClick={handleAllDaosClick}
          >
            <Filter className="mr-2 h-3 w-3" />
            All DAOs
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {filteredList.map((dao) => {
            const whitelistedDAO = whitelistedDAOs.find(wl => wl.ens === dao);
            return (
              <DropdownMenuItem
                key={dao}
                className={currentDao === dao ? "bg-accent text-accent-foreground" : ""}
                onClick={() => handleDaoClick(dao)}
              >
                {whitelistedDAO ? (
                  <img 
                    src={whitelistedDAO.logo} 
                    alt={`${dao} logo`} 
                    className="mr-2 h-3 w-3 rounded-full" 
                  />
                ) : (
                  <Filter className="mr-2 h-3 w-3" />
                )}
                <span className="flex-1 truncate">{dao}</span>
                {whitelistedDAO && (
                  <ShieldCheck className="h-3 w-3 ml-2 text-blue-500" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
