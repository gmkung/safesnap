
import { useState } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { formatUnits, parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealityEthV3Abi__factory } from '@/types/contracts/factories/RealityEthV3Abi__factory';
import { useAccount, useChains, useWalletClient } from 'wagmi';

// Answer constants
const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

interface SubmitAnswerButtonProps {
  question: Question;
  onAnswerSubmitted: () => void;
}

export default function SubmitAnswerButton({ question, onAnswerSubmitted }: SubmitAnswerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [bond, setBond] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chains = useChains();
  const { data: walletClient } = useWalletClient();

  const getDisabledReason = () => {
    if (question.phase === 'PENDING_ARBITRATION') return 'Question is under arbitration';
    if (question.phase === 'FINALIZED') return 'Question is already finalized';
    if (question.timeToOpen && question.timeToOpen > 0) return 'Question is not open for answers yet';
    return null;
  };

  const disabledReason = getDisabledReason();

  const getAnswerBytes = (selectedOption: string): `0x${string}` => {
    // Handle special cases
    if (selectedOption === 'invalid') return INVALID_ANSWER as `0x${string}`;
    if (selectedOption === 'too soon') return ANSWERED_TOO_SOON as `0x${string}`;

    // For single-select questions, convert the index to bytes32
    if (question.options && question.options.length > 0) {
      const index = question.options.indexOf(selectedOption);
      if (index !== -1) {
        // Convert index to hex and pad to 64 characters (32 bytes)
        return `0x${index.toString(16).padStart(64, '0')}` as `0x${string}`;
      }
    }

    // Fallback for unknown options
    return `0x${Buffer.from(selectedOption).toString('hex').padEnd(64, '0')}` as `0x${string}`;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      if (!answer) {
        throw new Error('Please select an answer');
      }

      if (!bond) {
        throw new Error('Please enter a bond amount');
      }

      // Convert bond to wei
      const bondWei = parseUnits(bond, 18);
      const minBond = BigInt(question.minimumBond);

      if (bondWei < minBond) {
        throw new Error(`Bond must be at least ${formatUnits(minBond, 18)} ${question.contract.config.token_ticker}`);
      }

      // Convert answer to bytes32 using our predefined values
      const answerBytes = getAnswerBytes(answer);

      // Convert question ID to bytes32
      const questionIdBytes = `0x${question.id.replace('0x', '').padStart(64, '0')}` as `0x${string}`;

      // Get contract instance
      const contract = RealityEthV3Abi__factory.connect(
        question.contract.address as `0x${string}`,
        walletClient as any // Type assertion needed for wagmi v2 compatibility
      );

      // Submit answer
      const tx = await contract.submitAnswer(
        questionIdBytes,
        answerBytes,
        0n, // max_previous as bigint
        { value: bondWei }
      );

      await tx.wait();

      toast({
        title: 'Answer submitted',
        description: 'Your answer has been submitted successfully.',
      });

      setIsOpen(false);
      onAnswerSubmitted();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit answer',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  disabled={!!disabledReason}
                >
                  <Plus className="w-4 h-4" />
                  Submit Answer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Submit Answer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="answer" className="text-sm font-medium">
                      Answer
                    </label>
                    <Select value={answer} onValueChange={setAnswer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show question options if they exist */}
                        {question.options?.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                        {/* Always show special options */}
                        <SelectItem value="invalid">Invalid</SelectItem>
                        <SelectItem value="too soon">Answered too Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="bond" className="text-sm font-medium">
                      Bond Amount ({question.contract.config.token_ticker})
                    </label>
                    <Input
                      id="bond"
                      type="number"
                      placeholder={`Minimum: ${formatUnits(BigInt(question.minimumBond), 18)}`}
                      value={bond}
                      onChange={(e) => setBond(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </span>
        </TooltipTrigger>
        {disabledReason && (
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
