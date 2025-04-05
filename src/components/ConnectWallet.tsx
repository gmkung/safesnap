
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { useToast } from "@/hooks/use-toast";

export function ConnectWallet() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Format the address for display (0x1234...5678)
  const formattedAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  const handleConnect = async () => {
    try {
      // Try to connect with injected provider first, fallback to MetaMask
      connect({ connector: injected() });
    } catch (err) {
      console.error("Connection error:", err);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error?.message || "Failed to connect wallet",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <div>
      {isConnected ? (
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
          className="tron-button"
        >
          {formattedAddress} (Disconnect)
        </Button>
      ) : (
        <Button 
          variant="outline" 
          onClick={handleConnect}
          disabled={isPending}
          className="tron-button"
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}

export default ConnectWallet;
