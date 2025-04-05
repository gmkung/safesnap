
import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { connectAsync } = useConnect();
    const [isConnecting, setIsConnecting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (isConnecting) return;

        try {
            setIsConnecting(true);
            await connectAsync({ connector: injected() });
        } catch (error) {
            console.error('Failed to connect:', error);
            if (!(error instanceof Error) || !error.message.includes('UserRejectedRequestError')) {
                toast({
                    variant: "destructive",
                    title: "Connection Error",
                    description: "Failed to connect wallet. Please try again."
                });
            }
        } finally {
            setIsConnecting(false);
        }
    };

    if (isConnected) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-tron-light">Connected:</span>
                <code className="text-sm bg-tron-dark/30 px-2 py-1 rounded">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</code>
            </div>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            variant="outline"
            className="border-tron"
            disabled={isConnecting}
        >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}
