
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DAOListProps {
  daoList: string[];
  currentDao: string | null;
}

export function DAOList({ daoList, currentDao }: DAOListProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
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
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-between text-xs h-8"
        >
          {currentDao ? currentDao : "Select DAO"}
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
        
        {daoList.map((dao) => (
          <DropdownMenuItem
            key={dao}
            className={currentDao === dao ? "bg-accent text-accent-foreground" : ""}
            onClick={() => handleDaoClick(dao)}
          >
            <Filter className="mr-2 h-3 w-3" />
            {dao}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
