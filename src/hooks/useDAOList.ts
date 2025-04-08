
import { useState, useEffect } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { parseQuestionData } from '@/utils/questionUtils';

export function useDAOList(questions: Question[]) {
  const [daoList, setDaoList] = useState<string[]>([]);
  
  useEffect(() => {
    const uniqueDaos = new Set<string>();
    
    for (const question of questions) {
      const parsedData = parseQuestionData(question);
      if (parsedData?.dao) {
        uniqueDaos.add(parsedData.dao);
      }
    }
    
    // Convert to array and sort alphabetically
    setDaoList(Array.from(uniqueDaos).sort());
  }, [questions]);
  
  return daoList;
}
