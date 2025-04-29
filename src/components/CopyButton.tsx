
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  textToCopy: string;
  size?: 'sm' | 'xs';
  className?: string;
}

export default function CopyButton({ textToCopy, size = 'sm', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy text",
        duration: 2000,
      });
    }
  };

  const buttonSize = size === 'xs' ? 'h-5 w-5 p-0.5' : 'h-6 w-6 p-1';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            type="button"
            variant="ghost"
            className={`${buttonSize} ${className}`}
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle className="h-full w-full text-green-500" />
            ) : (
              <Copy className="h-full w-full text-space-light/70 hover:text-space-light" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
