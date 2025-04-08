
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { DAOList } from './DAOList';
import { useDAOList } from '@/hooks/useDAOList';
import { useQuestions } from '@/hooks/useQuestions';

export default function AppSidebar() {
  const navigate = useNavigate();
  const { '*': ensPath } = useParams();
  const { questions, isLoading } = useQuestions();
  const daoList = useDAOList(questions);
  
  return (
    <Sidebar>
      <SidebarHeader className="pt-6 pb-2">
        <div className="flex flex-col items-center space-y-3 px-3">
          <img 
            src="/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png" 
            alt="Kleros Logo" 
            className="w-16 h-16"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-space via-space-light to-space bg-clip-text text-transparent animate-ethereal-fade">
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
          <SidebarGroupLabel>Filter by DAO</SidebarGroupLabel>
          <SidebarGroupContent>
            <DAOList daoList={daoList} currentDao={ensPath} />
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
