
import { useState, useEffect } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData } from '@/utils/questionUtils';
import { whitelistedDAOs } from '@/config/daoWhitelist';

export function useDAOList(questions: Question[]) {
  const [daoList, setDaoList] = useState<string[]>([]);
  
  useEffect(() => {
    // Use a Set to collect unique DAOs from questions
    const uniqueDaos = new Set<string>();
    
    for (const question of questions) {
      const parsedData = parseQuestionData(question);
      if (parsedData?.dao) {
        uniqueDaos.add(parsedData.dao);
      }
    }
    
    // Sort alphabetically, but put whitelisted DAOs first
    const allDaos = Array.from(uniqueDaos);
    const whitelistedENS = new Set(whitelistedDAOs.map(dao => dao.ens));
    
    allDaos.sort((a, b) => {
      // If both or neither are whitelisted, sort alphabetically
      const aWhitelisted = whitelistedENS.has(a);
      const bWhitelisted = whitelistedENS.has(b);
      
      if (aWhitelisted === bWhitelisted) {
        return a.localeCompare(b);
      }
      
      // Whitelisted DAOs come first
      return aWhitelisted ? -1 : 1;
    });
    
    setDaoList(allDaos);
  }, [questions]);
  
  return daoList;
}
