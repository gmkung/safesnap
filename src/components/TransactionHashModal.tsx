
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TransactionHashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatedHash: string | null;
  expectedHash: string;
  transactionHashes: string[];
  match: boolean;
  proposalData?: any;
}

export default function TransactionHashModal({
  open,
  onOpenChange,
  calculatedHash,
  expectedHash,
  transactionHashes,
  match,
  proposalData
}: TransactionHashModalProps) {
  const { toast } = useToast();
  const [expandedTx, setExpandedTx] = useState<number | null>(null);

  // Ensure expected hash has 0x prefix
  const normalizedExpectedHash = expectedHash.startsWith('0x') ? expectedHash : `0x${expectedHash}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  // Function to toggle the expanded state of a transaction
  const toggleTxExpand = (index: number) => {
    if (expandedTx === index) {
      setExpandedTx(null);
    } else {
      setExpandedTx(index);
    }
  };

  // Get the raw transaction data from proposalData
  const getTxDataFromProposal = () => {
    if (!proposalData?.plugins?.safeSnap?.safes) return [];
    
    const txData: Array<{safeIndex: number, txIndex: number, tx: any, hash: string}> = [];
    
    proposalData.plugins.safeSnap.safes.forEach((safe: any, safeIndex: number) => {
      if (safe.txs && safe.txs.length > 0) {
        safe.txs.forEach((tx: any, txIndex: number) => {
          if (tx.hash) {
            txData.push({
              safeIndex,
              txIndex,
              tx,
              hash: tx.hash
            });
          }
        });
      }
    });
    
    return txData;
  };

  const txDataArray = getTxDataFromProposal();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold ethereal-text">
            Transaction Hash Calculation Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-space-light flex items-center gap-2">
              <Info className="h-5 w-5" />
              How the hash is calculated
            </h3>
            <div className="glass-panel p-4 space-y-4">
              <p>The transaction array hash is calculated using the following steps:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Extract all transaction hashes from the SafeSnap plugin data</li>
                <li>Concatenate all transaction hashes into a single string</li>
                <li>Remove any '0x' prefixes from the concatenated string for proper hashing</li>
                <li>Calculate the keccak256 hash of the concatenated transaction hashes</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-space-light">Expected Hash (from Question)</h3>
            <div className="flex items-center">
              <code className="glass-panel p-3 rounded text-base font-mono break-all flex-1">
                {normalizedExpectedHash}
              </code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={() => copyToClipboard(normalizedExpectedHash)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-space-light">Calculated Hash (from Proposal)</h3>
            <div className="flex items-center">
              <code className={cn(
                "glass-panel p-3 rounded text-base font-mono break-all flex-1",
                calculatedHash ? (match ? "text-green-400" : "text-red-400") : "text-yellow-400"
              )}>
                {calculatedHash || "No transactions found to calculate hash"}
              </code>
              {calculatedHash && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(calculatedHash)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {transactionHashes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-space-light">Transaction Hashes Used ({transactionHashes.length})</h3>
              <div className="glass-panel p-4 space-y-3">
                {txDataArray.map((txData, index) => (
                  <div key={index} className="space-y-2">
                    <div 
                      className="flex items-center justify-between bg-space-dark/30 px-3 py-2 rounded cursor-pointer hover:bg-space-dark/40"
                      onClick={() => toggleTxExpand(index)}
                    >
                      <div className="flex items-center">
                        {expandedTx === index ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-sm">
                          Transaction #{index + 1} from Safe #{txData.safeIndex + 1}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <code className="bg-space-dark/40 px-2 py-1 rounded text-xs font-mono break-all">
                          {txData.hash}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(txData.hash);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedTx === index && (
                      <div className="pl-4 space-y-3 bg-space-dark/20 p-3 rounded">
                        <div>
                          <h4 className="text-sm font-medium text-space-light/80 mb-1">Transaction Details:</h4>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-space-light/70">Nonce:</span>
                                <span className="ml-2">{txData.tx.nonce}</span>
                              </div>
                              <div>
                                <span className="font-medium text-space-light/70">Transaction Count:</span>
                                <span className="ml-2">{txData.tx.transactions.length}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-space-light/80">Sub-transactions:</h5>
                              {txData.tx.transactions.map((subTx: any, subIdx: number) => (
                                <div key={subIdx} className="bg-space-dark/40 p-2 rounded text-xs">
                                  <div className="grid grid-cols-2 gap-1">
                                    <div>
                                      <span className="font-medium text-space-light/70">To:</span>
                                      <code className="ml-2">
                                        {`${subTx.to.slice(0, 6)}...${subTx.to.slice(-4)}`}
                                      </code>
                                    </div>
                                    <div>
                                      <span className="font-medium text-space-light/70">Value:</span>
                                      <span className="ml-2">{subTx.value}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-space-light/70">Operation:</span>
                                      <span className="ml-2">{subTx.operation}</span>
                                    </div>
                                    {subTx.nonce !== undefined && (
                                      <div>
                                        <span className="font-medium text-space-light/70">Nonce:</span>
                                        <span className="ml-2">{subTx.nonce}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    <span className="font-medium text-space-light/70">Data:</span>
                                    <div className="mt-1">
                                      <code className="bg-space-dark/50 p-1 rounded text-xs font-mono break-all block max-h-20 overflow-y-auto">
                                        {subTx.data || "(empty)"}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-space-light/80 mb-1">How this hash is derived:</h4>
                          <div className="bg-space-dark/40 p-2 rounded text-xs">
                            <p className="mb-2">This transaction hash is derived by keccak256 hashing the encoded transaction data according to Gnosis Safe's transaction batching mechanism.</p>
                            <p className="mb-1 text-space-light/70">Factors that influence the hash:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>The transaction nonce ({txData.tx.nonce})</li>
                              <li>Each sub-transaction's recipient address, value, data and operation type</li>
                              <li>The Safe contract's batching logic</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-space-light">Concatenated Hashes (without 0x prefixes)</h3>
            {transactionHashes.length > 0 ? (
              <div className="glass-panel p-3 rounded max-h-40 overflow-y-auto">
                <code className="text-xs font-mono break-all">
                  {transactionHashes.join('').replace(/0x/g, '')}
                </code>
              </div>
            ) : (
              <div className="glass-panel p-3 rounded text-yellow-400">
                No transaction hashes to concatenate
              </div>
            )}
          </div>

          <div className="p-4 rounded-md glass-panel bg-space-dark/50">
            <h3 className="text-lg font-semibold text-space-light mb-2">Verification Result</h3>
            <div className={cn(
              "p-3 rounded-md",
              match ? "bg-green-500/20 border border-green-500/30" : 
              calculatedHash ? "bg-red-500/20 border border-red-500/30" : 
              "bg-yellow-500/20 border border-yellow-500/30"
            )}>
              <p className={cn(
                "text-lg font-medium",
                match ? "text-green-400" : calculatedHash ? "text-red-400" : "text-yellow-400"
              )}>
                {match 
                  ? "✓ MATCH - The calculated hash matches the expected hash" 
                  : calculatedHash 
                    ? "✗ MISMATCH - The calculated hash does not match the expected hash" 
                    : "⚠ INCONCLUSIVE - No transactions found to verify hash"
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
