
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DAOListProps {
  daoList: string[];
  currentDao: string | null;
}

export function DAOList({ daoList, currentDao }: DAOListProps) {
  const navigate = useNavigate();
  
  if (daoList.length === 0) {
    return null;
  }
  
  const handleDaoClick = (dao: string) => {
    // Navigate to filtered view for selected DAO
    navigate(`/${dao}`);
  };
  
  const handleAllDaosClick = () => {
    // Navigate to the home page (unfiltered)
    navigate('/');
  };
  
  return (
    <div className="space-y-2 text-sm">
      <Button 
        variant={!currentDao ? "default" : "outline"}
        size="sm" 
        className="w-full justify-start text-xs h-8"
        onClick={handleAllDaosClick}
      >
        <Filter className="mr-2 h-3 w-3" />
        All DAOs
      </Button>
      
      {daoList.map((dao) => (
        <Button 
          key={dao}
          variant={currentDao === dao ? "default" : "outline"}
          size="sm" 
          className="w-full justify-start text-xs h-8"
          onClick={() => handleDaoClick(dao)}
        >
          <Filter className="mr-2 h-3 w-3" />
          {dao}
        </Button>
      ))}
    </div>
  );
}
