
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from 'lucide-react';
import Footer from './Footer';

function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const [isConnecting, setIsConnecting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (isConnecting) return;

        try {
            setIsConnecting(true);
            await connectAsync({ connector: injected() });
        } catch (error) {
            console.error('Failed to connect:', error);
            // Only show error if it's not a user rejection
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

    const handleDisconnect = async () => {
        try {
            await disconnectAsync();
            toast({
                title: "Disconnected",
                description: "Your wallet has been disconnected."
            });
        } catch (error) {
            console.error('Failed to disconnect:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to disconnect wallet. Please try again."
            });
        }
    };

    if (isConnected) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="steel"
                        className="border-space-light/20"
                    >
                        <code className="text-sm">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</code>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel backdrop-blur-lg border border-space-light/10">
                    <DropdownMenuItem
                        className="text-red-500 cursor-pointer hover:bg-space-dark/30"
                        onClick={handleDisconnect}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            variant="glass"
            className="border-space-light/20"
            disabled={isConnecting}
        >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-space-gray/30 backdrop-blur-md z-10 shadow-steel">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center">
                            <a href="/" className="ethereal-text text-xl font-bold">
                                Reality.eth
                            </a>
                        </div>
                        <ConnectWallet />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
                <Outlet />
            </main>
            
            {/* Footer */}
            <Footer />
        </div>
    );
} 
