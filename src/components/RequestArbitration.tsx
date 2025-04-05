
import { useState } from 'react';
import { Question } from 'reality-kleros-subgraph';
import { useAccount, useChains, useWalletClient, usePublicClient } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RealityEthV21Witharbitratorappeals__factory } from '@/types/contracts/factories/RealityEthV21Witharbitratorappeals__factory';

interface RequestArbitrationButtonProps {
    question: Question;
    onArbitrationRequested: () => void;
}

export default function RequestArbitrationButton({ question, onArbitrationRequested }: RequestArbitrationButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { address, isConnected } = useAccount();
    const chains = useChains();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { toast } = useToast();

    const getDisabledReason = () => {
        if (question.phase === 'PENDING_ARBITRATION') return 'Arbitration already requested';
        if (question.phase === 'FINALIZED') return 'Question is already finalized';
        if (!question.currentAnswer) return 'No answer to dispute yet';
        return null;
    };

    const disabledReason = getDisabledReason();

    const handleRequestArbitration = async () => {
        try {
            setIsSubmitting(true);

            if (!isConnected || !address) {
                throw new Error('Please connect your wallet first');
            }

            if (!walletClient) {
                throw new Error('Wallet client not available');
            }

            const questionIdBytes = `0x${question.id.replace('0x', '').padStart(64, '0')}` as `0x${string}`;

            const arbitrationFee = await publicClient.readContract({
                address: question.arbitrator as `0x${string}`,
                abi: RealityEthV21Witharbitratorappeals__factory.abi,
                functionName: 'getDisputeFee',
                args: [questionIdBytes]
            });

            const { request } = await publicClient.simulateContract({
                address: question.arbitrator as `0x${string}`,
                abi: RealityEthV21Witharbitratorappeals__factory.abi,
                functionName: 'requestArbitration',
                args: [questionIdBytes, 0n],
                value: arbitrationFee
            });

            const hash = await walletClient.writeContract(request);
            await publicClient.waitForTransactionReceipt({ hash });

            toast({
                title: 'Arbitration requested',
                description: 'Your arbitration request has been submitted successfully.',
            });

            setIsOpen(false);
            onArbitrationRequested();
        } catch (error) {
            console.error('Error requesting arbitration:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to request arbitration',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={disabledReason ? "border-gray-500 text-gray-500" : "border-yellow-500 text-yellow-500"}
                    disabled={!!disabledReason}
                    title={disabledReason || "Request arbitration for this question"}
                >
                    Request Arbitration
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Arbitration</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>
                        Are you sure you want to request arbitration for this question? This will:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Freeze the current answer</li>
                        <li>Require payment of the arbitration fee</li>
                        <li>Submit the dispute to the arbitrator at {question.arbitrator}</li>
                    </ul>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleRequestArbitration} disabled={isSubmitting}>
                        {isSubmitting ? 'Requesting...' : 'Confirm Request'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
