
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RealityEthV3Abi__factory } from '@/types/contracts/factories/RealityEthV3Abi__factory';
import { useToast } from '@/hooks/use-toast';
import { formatUnits, parseUnits, isAddress, createWalletClient, custom, getAccount, switchChain, getChainId } from 'viem';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';

// Constants for special answers
const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

type SubmitAnswerProps = {
  questionId: string;
  currentBond: string;
  minBond: string;
  token: string;
  contractAddress: string;
  questionType: string;
  options?: string[];
};

export default function SubmitAnswer({ 
  questionId, 
  currentBond, 
  minBond, 
  token, 
  contractAddress,
  questionType,
  options
}: SubmitAnswerProps) {
  const [answer, setAnswer] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [bond, setBond] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  // Calculate min bond for UI (needs to be higher than current bond)
  const minBondValue = BigInt(currentBond) > BigInt(minBond) 
    ? BigInt(currentBond) * 2n / 1n 
    : BigInt(minBond);
  
  const formattedMinBond = formatUnits(minBondValue, 18);

  const handleSubmitAnswer = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }
      
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found. Please install MetaMask or another wallet");
      }

      if (!bond || parseFloat(bond) <= 0) {
        throw new Error(`Bond must be greater than ${formattedMinBond} ${token}`);
      }

      // Check if bond is high enough
      const bondBigInt = parseUnits(bond, 18);
      if (bondBigInt <= minBondValue) {
        throw new Error(`Bond must be greater than ${formattedMinBond} ${token}`);
      }

      // Get the answer bytes
      let answerBytes: `0x${string}`;
      if (answer === "yes") {
        answerBytes = "0x0000000000000000000000000000000000000000000000000000000000000000";
      } else if (answer === "no") {
        answerBytes = "0x0000000000000000000000000000000000000000000000000000000000000001";
      } else if (answer === "too_soon") {
        answerBytes = ANSWERED_TOO_SOON as `0x${string}`;
      } else if (answer === "invalid") {
        answerBytes = INVALID_ANSWER as `0x${string}`;
      } else if (answer === "custom" && customAnswer) {
        // For numeric answers, we need to convert to hex and pad
        const numValue = parseInt(customAnswer);
        if (isNaN(numValue)) {
          throw new Error("Custom answer must be a valid number");
        }
        answerBytes = `0x${numValue.toString(16).padStart(64, '0')}` as `0x${string}`;
      } else {
        throw new Error("Please select a valid answer");
      }

      if (!isAddress(contractAddress)) {
        throw new Error("Invalid contract address");
      }

      // Create a wallet client using viem
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      // Get current chain id
      const chainId = await getChainId(walletClient);
      
      // Create contract instance for calling
      const contract = {
        address: contractAddress as `0x${string}`,
        abi: RealityEthV3Abi__factory.abi
      };
      
      // Submit the answer
      const hash = await walletClient.writeContract({
        ...contract,
        functionName: 'submitAnswer',
        args: [questionId as `0x${string}`, answerBytes, 0n], // max_previous is set to 0 for simplicity
        value: bondBigInt
      });

      toast({
        title: "Answer submitted",
        description: `Transaction hash: ${hash.substring(0, 8)}...`,
      });

      // Reset the form
      setAnswer("");
      setCustomAnswer("");
      setBond("");
    } catch (err) {
      console.error("Submit answer error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      toast({
        variant: "destructive",
        title: "Failed to submit answer",
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tron-card p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Submit Answer</h2>
      
      <div className="space-y-4 p-4">
        {!isConnected && (
          <div className="bg-yellow-500/20 text-yellow-500 p-4 rounded-md border border-yellow-500/30 mb-4">
            Please connect your wallet to submit an answer
          </div>
        )}
        
        <div className="space-y-2">
          <label className="font-medium text-tron-light/70">Select Answer</label>
          <Select value={answer} onValueChange={setAnswer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes (0)</SelectItem>
              <SelectItem value="no">No (1)</SelectItem>
              {questionType === "multiple-choice" && options && options.map((option, index) => (
                index > 1 && <SelectItem key={index} value={`custom-${index}`}>{option} ({index})</SelectItem>
              ))}
              <SelectItem value="custom">Custom Numeric Answer</SelectItem>
              <SelectItem value="too_soon">Answered Too Soon</SelectItem>
              <SelectItem value="invalid">Invalid Question</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {answer === "custom" && (
          <div className="space-y-2">
            <label className="font-medium text-tron-light/70">Custom Answer (numeric)</label>
            <Input
              type="number"
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Enter a numeric value"
            />
            <p className="text-sm text-tron-light/60">
              Custom answers should be numeric values appropriate for the question
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="font-medium text-tron-light/70">Bond Amount ({token})</label>
          <Input
            type="number"
            value={bond}
            onChange={(e) => setBond(e.target.value)}
            placeholder={`Min: ${formattedMinBond} ${token}`}
          />
          <p className="text-sm text-tron-light/60">
            Bond must be greater than {formattedMinBond} {token}. If your answer becomes the consensus, you'll get your bond back plus rewards.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md border border-red-500/30">
            {error}
          </div>
        )}
        
        <Button 
          className="tron-button w-full" 
          onClick={handleSubmitAnswer}
          disabled={isSubmitting || !isConnected || !answer || (answer === "custom" && !customAnswer) || !bond}
        >
          {isSubmitting ? "Submitting..." : "Submit Answer"}
        </Button>
        
        <div className="text-sm text-tron-light/60 mt-2 p-4 bg-tron-black/30 rounded-md border border-tron-dark/30">
          <p className="font-medium mb-2">Important Notes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide a higher bond than the current bond to change the answer.</li>
            <li>If your answer becomes the consensus, you'll get your bond back plus rewards.</li>
            <li>If someone disputes your answer with a higher bond, you won't get your bond back unless your answer is ultimately chosen.</li>
            <li>Questions might have an arbitrator that can make a final decision if disputed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
