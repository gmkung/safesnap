
import { useState } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { useToast } from "../hooks/use-toast";
import { Info, AlertCircle } from 'lucide-react';
import { formatUnits, parseUnits, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { RealityEthV3Abi__factory } from '../types/contracts';

// Constants for special answers
const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

interface SubmitAnswerProps {
  question: Question;
}

export default function SubmitAnswer({ question }: SubmitAnswerProps) {
  const [answer, setAnswer] = useState('');
  const [bond, setBond] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Calculate minimum required bond (typically 2x the current bond)
  const currentBondBigInt = BigInt(question.currentBond || '0');
  const minimumRequiredBond = currentBondBigInt > 0 
    ? currentBondBigInt * BigInt(2) 
    : BigInt(question.minimumBond || '0');
  
  const formattedMinBond = formatUnits(minimumRequiredBond, 18);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!answer.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert bond to proper format
      const bondAmount = parseUnits(bond, 18);
      
      // Bond validation
      if (bondAmount < minimumRequiredBond) {
        toast({
          title: "Bond too low",
          description: `The minimum bond required is ${formattedMinBond} ${question.contract?.config?.token_ticker || 'ETH'}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get contract address from question
      const contractAddress = question.contract?.address;
      if (!contractAddress) {
        throw new Error("Contract address not found");
      }

      // Request wallet connection
      if (!window.ethereum) {
        toast({
          title: "Web3 Not Available",
          description: "Please install a Web3 wallet like MetaMask to submit answers",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create wallet client
      const walletClient = createWalletClient({
        transport: http(),
        chain: {
          id: Number(question.contract?.chainId || 1),
        }
      });

      // Request accounts
      const [address] = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!address) {
        throw new Error("Failed to get wallet address");
      }

      // Format the answer based on the question type and selected option
      let formattedAnswer: string;
      
      if (answer === 'yes') {
        formattedAnswer = '0x0000000000000000000000000000000000000000000000000000000000000001';
      } else if (answer === 'no') {
        formattedAnswer = '0x0000000000000000000000000000000000000000000000000000000000000000';
      } else if (answer === 'invalid') {
        formattedAnswer = INVALID_ANSWER;
      } else if (answer === 'too_soon') {
        formattedAnswer = ANSWERED_TOO_SOON;
      } else {
        // For custom answers (e.g. uint)
        if (question.qType === 'uint') {
          const numValue = parseInt(answer, 10);
          if (isNaN(numValue)) {
            throw new Error("Invalid number format");
          }
          formattedAnswer = `0x${numValue.toString(16).padStart(64, '0')}`;
        } else {
          formattedAnswer = answer; // Use as-is for other types
        }
      }

      // Get the contract interface
      const abi = RealityEthV3Abi__factory.abi;
      
      // Encode the function call
      const data = encodeFunctionData({
        abi,
        functionName: 'submitAnswer',
        args: [question.questionId as `0x${string}`, formattedAnswer as `0x${string}`, BigInt(0)]
      });

      // Submit transaction
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: contractAddress,
          value: bondAmount.toString(),
          data
        }]
      });

      toast({
        title: "Answer Submitted",
        description: `Transaction hash: ${hash}`,
      });
      
      // Reset form after submission
      setAnswer('');
      setBond('');
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if question is in a state where answers can be submitted
  const canSubmitAnswer = question.phase === 'OPEN';

  return (
    <div className="tron-card mb-6">
      <h2 className="text-xl font-semibold mb-4 text-tron p-4 border-b border-tron-dark/30">Submit Answer</h2>
      
      {!canSubmitAnswer ? (
        <div className="p-6">
          <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>This question is not currently open for answers.</span>
          </div>
          <p className="text-tron-light/70">
            Questions can only be answered when they are in the OPEN phase.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Requirements and Restrictions Info */}
          <div className="bg-tron-dark/20 border border-tron-dark/30 rounded-md p-4 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-tron mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-tron">Important Information</h3>
                <ul className="text-xs mt-2 space-y-1 text-tron-light/80">
                  <li>• Your bond must be at least {formattedMinBond} {question.contract?.config?.token_ticker || 'ETH'}.</li>
                  <li>• Bonds are locked until the question is resolved.</li>
                  <li>• You'll receive rewards only if your answer becomes the final answer.</li>
                  <li>• Once submitted, your answer cannot be changed.</li>
                  <li>• Anyone can replace your answer by doubling your bond.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-tron-light mb-1">
              Your Answer
            </label>
            {question.qType === 'bool' ? (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAnswer('yes')}
                  className={`px-4 py-2 rounded-md border ${
                    answer === 'yes'
                      ? 'bg-tron/20 border-tron text-tron'
                      : 'border-tron-dark/30 text-tron-light/70 hover:bg-tron-dark/10'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer('no')}
                  className={`px-4 py-2 rounded-md border ${
                    answer === 'no'
                      ? 'bg-tron/20 border-tron text-tron'
                      : 'border-tron-dark/30 text-tron-light/70 hover:bg-tron-dark/10'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer('invalid')}
                  className={`px-4 py-2 rounded-md border ${
                    answer === 'invalid'
                      ? 'bg-yellow-600/20 border-yellow-600 text-yellow-500'
                      : 'border-tron-dark/30 text-tron-light/70 hover:bg-tron-dark/10'
                  }`}
                >
                  Invalid
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer('too_soon')}
                  className={`px-4 py-2 rounded-md border ${
                    answer === 'too_soon'
                      ? 'bg-orange-600/20 border-orange-600 text-orange-500'
                      : 'border-tron-dark/30 text-tron-light/70 hover:bg-tron-dark/10'
                  }`}
                >
                  Too Soon
                </button>
              </div>
            ) : (
              <input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={question.qType === 'uint' ? "Enter a number" : "Enter your answer"}
                className="w-full px-4 py-2 border border-tron-dark/30 rounded-md bg-tron-black/30 text-foreground focus:outline-none focus:ring-2 focus:ring-tron/50"
                required
              />
            )}
            <p className="mt-1 text-xs text-tron-light/50">
              Question type: {question.qType}
              {question.qType === 'uint' && ' (must be a positive integer)'}
            </p>
          </div>

          {/* Bond Input */}
          <div>
            <label htmlFor="bond" className="block text-sm font-medium text-tron-light mb-1">
              Bond Amount ({question.contract?.config?.token_ticker || 'ETH'})
            </label>
            <input
              id="bond"
              type="text"
              value={bond}
              onChange={(e) => setBond(e.target.value)}
              placeholder={`Min: ${formattedMinBond}`}
              className="w-full px-4 py-2 border border-tron-dark/30 rounded-md bg-tron-black/30 text-foreground focus:outline-none focus:ring-2 focus:ring-tron/50"
              required
            />
            <p className="mt-1 text-xs text-tron-light/50">
              Minimum required bond: {formattedMinBond} {question.contract?.config?.token_ticker || 'ETH'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`tron-button w-full ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>
      )}
    </div>
  );
}
