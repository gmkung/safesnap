import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getProposalDetails } from '@/lib/snapshotQuery';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface ProposalModalProps {
    proposalId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProposalModal({ proposalId, isOpen, onClose }: ProposalModalProps) {
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchProposal() {
            if (!proposalId || !isOpen) return;
            
            try {
                setLoading(true);
                const data = await getProposalDetails(proposalId);
                setProposal(data);
            } catch (error) {
                console.error('Failed to fetch proposal:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load proposal details. Please try again."
                });
            } finally {
                setLoading(false);
            }
        }

        fetchProposal();
    }, [proposalId, isOpen, toast]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-tron" />
                    </div>
                ) : proposal ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-tron">
                                {proposal.title}
                            </DialogTitle>
                            <div className="text-sm text-tron-light/70">
                                Space: {proposal.space.name}
                            </div>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-tron-light/70">Author:</span>
                                    <code className="ml-2 bg-tron-dark/30 px-2 py-1 rounded">
                                        {`${proposal.author.slice(0, 6)}...${proposal.author.slice(-4)}`}
                                    </code>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">State:</span>
                                    <span className="ml-2 capitalize">{proposal.state}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Start:</span>
                                    <span className="ml-2">{formatDate(proposal.start)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">End:</span>
                                    <span className="ml-2">{formatDate(proposal.end)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Created:</span>
                                    <span className="ml-2">{formatDate(proposal.created)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Snapshot:</span>
                                    <span className="ml-2">{proposal.snapshot}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Network:</span>
                                    <span className="ml-2">{proposal.network}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Type:</span>
                                    <span className="ml-2 capitalize">{proposal.type}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Quorum:</span>
                                    <span className="ml-2">{proposal.quorum} {proposal.symbol}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Privacy:</span>
                                    <span className="ml-2 capitalize">{proposal.privacy}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Total Votes:</span>
                                    <span className="ml-2">{proposal.votes}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-tron-light/70">Score:</span>
                                    <span className="ml-2">{proposal.scores_total.toFixed(2)}</span>
                                </div>
                            </div>

                            {proposal.labels && proposal.labels.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Labels:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {proposal.labels.map((label, index) => (
                                            <span key={index} className="px-2 py-1 bg-tron-dark/30 rounded text-sm">
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {proposal.choices && proposal.choices.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Choices:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {proposal.choices.map((choice: string, index: number) => (
                                            <li key={index}>
                                                {choice}
                                                {proposal.scores && proposal.scores[index] !== undefined && (
                                                    <span className="ml-2 text-tron-light/70">
                                                        ({proposal.scores[index].toFixed(2)} {proposal.symbol})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {proposal.strategies && proposal.strategies.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Voting Strategies:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {proposal.strategies.map((strategy, index) => (
                                            <li key={index}>
                                                {strategy.name} ({strategy.network})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {proposal.validation && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Validation:</h3>
                                    <div className="bg-tron-dark/30 p-3 rounded">
                                        <div className="font-mono text-sm">
                                            {proposal.validation.name}
                                        </div>
                                        {proposal.validation.params && (
                                            <pre className="mt-2 text-xs overflow-x-auto">
                                                {JSON.stringify(proposal.validation.params, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}

                            {proposal.body && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Description:</h3>
                                    <div className="prose prose-invert max-w-none prose-headings:text-tron prose-a:text-tron hover:prose-a:text-tron-light prose-strong:text-tron-light prose-code:bg-tron-dark/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-tron-light prose-pre:bg-tron-dark/30 prose-pre:text-tron-light prose-pre:border prose-pre:border-tron-dark/30">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a {...props} target="_blank" rel="noopener noreferrer" className="hover:underline" />
                                                ),
                                                img: ({ node, ...props }) => (
                                                    <img {...props} className="rounded-lg border border-tron-dark/30" />
                                                ),
                                            }}
                                        >
                                            {proposal.body}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {proposal.discussion && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-tron-light/70 mb-2">Discussion:</h3>
                                    <a 
                                        href={proposal.discussion}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-tron hover:underline"
                                    >
                                        View Discussion →
                                    </a>
                                </div>
                            )}

                            {proposal.flagged && (
                                <div className="mt-4 text-amber-500">
                                    ⚠️ This proposal has been flagged
                                </div>
                            )}

                            {proposal.plugins?.safeSnap && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-tron-light/70 mb-2">SafeSnap Transactions:</h3>
                                    <div className="space-y-4">
                                        {proposal.plugins.safeSnap.safes.map((safe, safeIndex) => (
                                            <div key={safeIndex} className="bg-tron-dark/30 p-4 rounded">
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                    <div>
                                                        <span className="font-medium text-tron-light/70">Network:</span>
                                                        <span className="ml-2">{safe.network}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-tron-light/70">Reality Address:</span>
                                                        <code className="ml-2 bg-tron-dark/50 px-2 py-1 rounded">
                                                            {`${safe.realityAddress.slice(0, 6)}...${safe.realityAddress.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-tron-light/70">MultiSend Address:</span>
                                                        <code className="ml-2 bg-tron-dark/50 px-2 py-1 rounded">
                                                            {`${safe.multiSendAddress.slice(0, 6)}...${safe.multiSendAddress.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-tron-light/70">Safe Hash:</span>
                                                        <code className="ml-2 bg-tron-dark/50 px-2 py-1 rounded">
                                                            {`${safe.hash.slice(0, 6)}...${safe.hash.slice(-4)}`}
                                                        </code>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {safe.txs.map((tx, txIndex) => (
                                                        <div key={txIndex} className="bg-tron-dark/50 p-3 rounded">
                                                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                                <div>
                                                                    <span className="font-medium text-tron-light/70">Transaction Hash:</span>
                                                                    <code className="ml-2 bg-tron-dark/70 px-2 py-1 rounded">
                                                                        {`${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`}
                                                                    </code>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-tron-light/70">Nonce:</span>
                                                                    <span className="ml-2">{tx.nonce}</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                {tx.transactions.map((subTx, subTxIndex) => (
                                                                    <div key={subTxIndex} className="bg-tron-dark/70 p-2 rounded text-xs">
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            <div>
                                                                                <span className="font-medium text-tron-light/70">To:</span>
                                                                                <code className="ml-2">
                                                                                    {`${subTx.to.slice(0, 6)}...${subTx.to.slice(-4)}`}
                                                                                </code>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-tron-light/70">Value:</span>
                                                                                <span className="ml-2">{subTx.value}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-tron-light/70">Operation:</span>
                                                                                <span className="ml-2">{subTx.operation}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-tron-light/70">Nonce:</span>
                                                                                <span className="ml-2">{subTx.nonce}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <span className="font-medium text-tron-light/70">Data:</span>
                                                                            <code className="ml-2 break-all">
                                                                                {subTx.data}
                                                                            </code>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-tron-light/70">
                        No proposal data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 