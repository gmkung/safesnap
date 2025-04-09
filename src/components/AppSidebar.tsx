
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { useDAOList } from '@/hooks/useDAOList';
import { useQuestions } from '@/hooks/useQuestions';
import { QuestionPhaseValue } from './StatusFilter';
import { StatusFilterAccordion } from './StatusFilterAccordion';
import { DAOFilterAccordion } from './DAOFilterAccordion';
import { parseQuestionData } from '@/utils/questionUtils';

export default function AppSidebar() {
  const navigate = useNavigate();
  const { '*': ensPath } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get status filters from URL
  const statusParamString = searchParams.get('statuses');
  const initialStatuses = statusParamString 
    ? statusParamString.split(',').filter(s => ["NOT_CREATED", "UPCOMING", "OPEN", "PENDING_ARBITRATION", "FINALIZED"].includes(s)) as QuestionPhaseValue[]
    : [];
  const [selectedStatuses, setSelectedStatuses] = useState<QuestionPhaseValue[]>(initialStatuses);
  
  const { questions, isLoading } = useQuestions();
  const rawDaoList = useDAOList(questions);
  
  // Transform the string[] into the expected format for DAOFilterAccordion
  const formattedDaoList = rawDaoList.map(dao => ({
    name: dao,
    count: questions.filter(q => {
      const parsedData = parseQuestionData(q);
      return parsedData?.dao === dao;
    }).length
  }));
  
  const handleStatusChange = (statuses: QuestionPhaseValue[]) => {
    setSelectedStatuses(statuses);
    
    // Update URL with selected statuses
    if (statuses.length > 0) {
      searchParams.set('statuses', statuses.join(','));
    } else {
      searchParams.delete('statuses');
    }
    setSearchParams(searchParams);
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="pt-6 pb-2">
        <div className="flex flex-col items-center space-y-3 px-3">
          <img 
            src="/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png" 
            alt="Kleros Logo" 
            className="w-16 h-16"
          />
          <h1 className="text-xl font-bold text-space">
            Kleros SafeSnap
          </h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/')}
                  tooltip="Home"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>All Questions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent className="px-3 py-2">
            <div className="space-y-4">
              <StatusFilterAccordion 
                selectedStatuses={selectedStatuses}
                onChange={handleStatusChange}
              />
              
              <DAOFilterAccordion 
                daoList={formattedDaoList} 
                currentDao={ensPath} 
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="pb-6">
        <div className="px-3 text-xs text-muted-foreground">
          <p className="text-center">Kleros SafeSnap © 2025</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
