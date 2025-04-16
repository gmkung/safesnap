
import { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ethers } from 'ethers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  decodedArgs: {name: string; type: string; value: string}[] | null;
  signature: string | null;
}

interface FunctionSignature {
  id: number;
  created_at: string;
  text_signature: string;
  hex_signature: string;
}

export default function TransactionSummary({ proposalData }: TransactionSummaryProps) {
  const [decodedTransactions, setDecodedTransactions] = useState<DecodedFunction[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);

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
                  error: false,
                  decodedArgs: null,
                  signature: null
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
              // Sort by created_at date (ascending) to get the earliest signature
              const sortedResults = [...data.results].sort((a: FunctionSignature, b: FunctionSignature) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                console.log(`Comparing dates: ${a.created_at} (${dateA}) vs ${b.created_at} (${dateB})`);
                return dateA - dateB;
              });
              
              console.log('Original results:', data.results);
              console.log('Sorted results:', sortedResults);
              
              // Use the earliest signature
              const earliestSignature = sortedResults[0];
              console.log('Selected earliest signature:', earliestSignature);
              
              // Decode arguments if signature is available
              let decodedArgs = null;
              if (earliestSignature.text_signature) {
                try {
                  // Extract parameter types from the function signature
                  const signatureMatch = earliestSignature.text_signature.match(/^([^(]+)\((.*)\)$/);
                  if (signatureMatch && signatureMatch[2]) {
                    const paramTypes = signatureMatch[2].split(',');
                    
                    // Create an ABI fragment to decode with
                    const abiFragment = {
                      name: signatureMatch[1],
                      type: 'function',
                      inputs: paramTypes.map((type, idx) => ({ 
                        name: `arg${idx}`, 
                        type: type.trim() 
                      }))
                    };
                    
                    const abiInterface = new ethers.Interface([abiFragment]);
                    try {
                      const decoded = abiInterface.decodeFunctionData(
                        abiFragment.name,
                        tx.data
                      );
                      
                      // Format the decoded arguments
                      decodedArgs = abiFragment.inputs.map((input, idx) => ({
                        name: input.name,
                        type: input.type,
                        value: decoded[idx].toString()
                      }));
                      
                      console.log('Decoded arguments:', decodedArgs);
                    } catch (decodeError) {
                      console.error('Error decoding function data:', decodeError);
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing function signature:', parseError);
                }
              }
              
              setDecodedTransactions(current => 
                current.map((item, idx) => idx === i 
                  ? { 
                      ...item, 
                      functionName: earliestSignature.text_signature, 
                      loading: false,
                      decodedArgs,
                      signature: earliestSignature.text_signature
                    } 
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
    
    // Use value to determine if it's a transfer - don't rely on function name
    if (value && value !== "0") return "transfer";
    return "call";
  };
  
  const toggleExpand = (index: number) => {
    if (expandedTx === index) {
      setExpandedTx(null);
    } else {
      setExpandedTx(index);
    }
  };
  
  // Format argument value for display without auto-converting to ETH
  const formatArgValue = (value: string, type: string) => {
    if (type.includes('address')) {
      return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
    
    // Return raw value for numeric types without auto-converting to ETH
    return value;
  };
  
  if (!proposalData?.plugins?.safeSnap?.safes || !decodedTransactions.length) {
    return null;
  }
  
  return (
    <div className="w-full mt-4 border-t border-space-dark/20 pt-4">
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
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
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
                  
                  {tx.decodedArgs && tx.decodedArgs.length > 0 && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="flex items-center text-xs text-space-light/70 hover:text-space-accent transition-colors"
                    >
                      {expandedTx === index ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Hide Arguments
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Arguments
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {expandedTx === index && tx.decodedArgs && tx.decodedArgs.length > 0 && (
                  <div className="mt-2 bg-space-dark/30 p-2 rounded-md">
                    <div className="text-xs text-space-light/70 mb-1">
                      Function Signature: <span className="font-mono">{tx.signature}</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-space-dark/40">
                          <TableHead className="text-xs h-7 py-1">Name</TableHead>
                          <TableHead className="text-xs h-7 py-1">Type</TableHead>
                          <TableHead className="text-xs h-7 py-1">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tx.decodedArgs.map((arg, argIndex) => (
                          <TableRow key={argIndex} className="border-space-dark/40">
                            <TableCell className="text-xs py-1 font-mono">{arg.name}</TableCell>
                            <TableCell className="text-xs py-1 font-mono">{arg.type}</TableCell>
                            <TableCell className="text-xs py-1 font-mono">
                              <div className="flex items-center">
                                {formatArgValue(arg.value, arg.type)}
                                {arg.type.includes('address') && (
                                  <a 
                                    href={`https://etherscan.io/address/${arg.value}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-1 text-space-light/50 hover:text-space-accent transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
