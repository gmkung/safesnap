
import { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionSummaryProps {
  proposalData: any;
}

interface DecodedFunction {
  address: string;
  functionName: string | null;
  value: string;
  data: string;
  loading: boolean;
  error: boolean;
}

export default function TransactionSummary({ proposalData }: TransactionSummaryProps) {
  const [decodedTransactions, setDecodedTransactions] = useState<DecodedFunction[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const decodeTransactions = async () => {
      if (!proposalData?.plugins?.safeSnap?.safes) return;
      
      const transactions: DecodedFunction[] = [];
      
      proposalData.plugins.safeSnap.safes.forEach((safe: any) => {
        if (safe.txs && safe.txs.length > 0) {
          safe.txs.forEach((tx: any) => {
            if (tx.transactions && tx.transactions.length > 0) {
              tx.transactions.forEach((subTx: any) => {
                transactions.push({
                  address: subTx.to,
                  functionName: null,
                  value: subTx.value,
                  data: subTx.data,
                  loading: true,
                  error: false
                });
              });
            }
          });
        }
      });
      
      setDecodedTransactions(transactions);
      
      // Decode each transaction's function signature
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        
        try {
          if (tx.data && tx.data.length >= 10) {
            const functionSignature = tx.data.slice(0, 10);
            
            // Skip if it's just a transfer with no data
            if (functionSignature === '0x' || functionSignature === '0x00000000') {
              setDecodedTransactions(current => 
                current.map((item, idx) => idx === i 
                  ? { ...item, functionName: 'Transfer', loading: false } 
                  : item
                )
              );
              continue;
            }
            
            const response = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${functionSignature}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              setDecodedTransactions(current => 
                current.map((item, idx) => idx === i 
                  ? { ...item, functionName: data.results[0].text_signature, loading: false } 
                  : item
                )
              );
            } else {
              setDecodedTransactions(current => 
                current.map((item, idx) => idx === i 
                  ? { ...item, functionName: 'Unknown Function', loading: false } 
                  : item
                )
              );
            }
          } else {
            setDecodedTransactions(current => 
              current.map((item, idx) => idx === i 
                ? { ...item, functionName: 'Simple Transfer', loading: false } 
                : item
              )
            );
          }
        } catch (error) {
          console.error('Error fetching function signature:', error);
          setDecodedTransactions(current => 
            current.map((item, idx) => idx === i 
              ? { ...item, loading: false, error: true, functionName: 'Error Decoding' } 
              : item
            )
          );
        }
      }
    };
    
    decodeTransactions();
  }, [proposalData]);
  
  if (!proposalData?.plugins?.safeSnap?.safes || !decodedTransactions.length) {
    return null;
  }
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatValue = (value: string) => {
    if (!value || value === "0") return "0 ETH";
    try {
      return `${ethers.formatEther(value)} ETH`;
    } catch (e) {
      return `${value} (raw)`;
    }
  };
  
  const formatFunctionName = (functionSig: string | null) => {
    if (!functionSig) return "Unknown";
    
    // For simple function names like transfer(address,uint256)
    const basicMatch = functionSig.match(/^([^(]+)\(/);
    if (basicMatch) return basicMatch[1];
    
    return functionSig;
  };
  
  const getTransactionType = (functionName: string | null, value: string) => {
    if (!functionName) return "call";
    
    const lowerFn = functionName.toLowerCase();
    if (lowerFn.includes("transfer") || lowerFn.includes("send")) return "transfer";
    if (value && value !== "0") return "transfer";
    return "call";
  };
  
  return (
    <div className="mt-4 border-t border-space-dark/20 pt-4">
      <h3 className="text-base font-medium text-space mb-3 flex items-center">
        Transaction Summary
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-space-light/70 hover:text-space-accent transition-colors"
              >
                {isExpanded ? (
                  <span className="text-xs">(collapse)</span>
                ) : (
                  <span className="text-xs">(expand)</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isExpanded ? "Collapse details" : "Expand for more details"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>
      
      <div className="space-y-3">
        {decodedTransactions.slice(0, isExpanded ? undefined : 3).map((tx, index) => (
          <div key={index} className="bg-space-dark/20 p-2 rounded-md">
            {tx.loading ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-6 w-fit px-2 text-xs",
                    getTransactionType(tx.functionName, tx.value) === "transfer" 
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  )}
                >
                  {getTransactionType(tx.functionName, tx.value) === "transfer" ? "Transfer" : "Call"}
                </Badge>
                
                <div className="flex flex-col text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-space-light/90">
                      {tx.error ? (
                        <span className="flex items-center text-red-400">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error decoding
                        </span>
                      ) : (
                        formatFunctionName(tx.functionName)
                      )}
                    </span>
                    {tx.value && tx.value !== "0" && (
                      <span className="ml-2 text-blue-400">{formatValue(tx.value)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-space-light/60">
                    <span>to: {formatAddress(tx.address)}</span>
                    <a 
                      href={`https://etherscan.io/address/${tx.address}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-space-light/50 hover:text-space-accent transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {!isExpanded && decodedTransactions.length > 3 && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full text-center text-xs text-space-light/70 hover:text-space-accent transition-colors py-1"
          >
            + {decodedTransactions.length - 3} more transactions
          </button>
        )}
      </div>
    </div>
  );
}
