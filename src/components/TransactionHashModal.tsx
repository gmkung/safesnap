
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, Copy } from 'lucide-react';
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
}

export default function TransactionHashModal({
  open,
  onOpenChange,
  calculatedHash,
  expectedHash,
  transactionHashes,
  match
}: TransactionHashModalProps) {
  const { toast } = useToast();

  // Ensure expected hash has 0x prefix
  const normalizedExpectedHash = expectedHash.startsWith('0x') ? expectedHash : `0x${expectedHash}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

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
              <div className="glass-panel p-4 space-y-3 max-h-60 overflow-y-auto">
                {transactionHashes.map((hash, index) => (
                  <div key={index} className="flex items-center">
                    <code className="bg-space-dark/30 px-2 py-1 rounded text-sm font-mono break-all flex-1">
                      {index + 1}. {hash}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2"
                      onClick={() => copyToClipboard(hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
