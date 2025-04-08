import { formatDate } from '@/utils/questionUtils';
import { Loader2, ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';
import { Button } from '@/components/ui/button';

interface SnapshotProposalSummaryProps {
  proposalLoading: boolean;
  proposalData: any;
}

export default function SnapshotProposalSummary({ proposalLoading, proposalData }: SnapshotProposalSummaryProps) {
  if (proposalLoading) {
    return (
      <div className="w-full steel-panel p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-space" />
        <span className="ml-2">Loading proposal details...</span>
      </div>
    );
  }

  if (!proposalData) {
    return (
      <div className="steel-panel p-6 text-center text-space-light/70 h-full flex items-center justify-center">
        <div>
          <p className="mb-2">No proposal data available</p>
          <p className="text-sm">Proposal data may be loading or unavailable for this question</p>
        </div>
      </div>
    );
  }

  const getSnapshotProposalUrl = () => {
    if (!proposalData) return '#';
    const spaceName = proposalData.space?.id || proposalData.space?.name;
    return `https://snapshot.org/#/${spaceName}/proposal/${proposalData.id}`;
  };

  return (
    <div className="w-full steel-panel">
      <div className="flex justify-between items-center border-b border-space-dark/30 p-4">
        <h2 className="text-xl font-semibold ethereal-text">Snapshot Proposal Summary</h2>
        <Button 
          variant="tron" 
          size="sm"
          className="ml-2"
          onClick={() => window.open(getSnapshotProposalUrl(), '_blank')}
        >
          View on Snapshot <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-space">
            {proposalData.title}
          </div>
        </div>
        
        <div className="text-sm text-space-light/70">
          Space: {proposalData.space.name}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-space-light/70">Author:</span>
            <div className="flex items-center ml-2 inline-flex">
              <code className="bg-space-dark/30 px-2 py-1 rounded">
                {`${proposalData.author.slice(0, 6)}...${proposalData.author.slice(-4)}`}
              </code>
              <CopyButton textToCopy={proposalData.author} size="xs" className="ml-1" />
            </div>
          </div>
          <div>
            <span className="font-medium text-space-light/70">State:</span>
            <span className="ml-2 capitalize">{proposalData.state}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">Start:</span>
            <span className="ml-2">{formatDate(proposalData.start * 1000)}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">End:</span>
            <span className="ml-2">{formatDate(proposalData.end * 1000)}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">Created:</span>
            <span className="ml-2">{formatDate(proposalData.created * 1000)}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">Snapshot:</span>
            <span className="ml-2">{proposalData.snapshot}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">Network:</span>
            <span className="ml-2">{proposalData.network}</span>
          </div>
          <div>
            <span className="font-medium text-space-light/70">Total Votes:</span>
            <span className="ml-2">{proposalData.votes}</span>
          </div>
          {proposalData.scores_total !== undefined && (
            <div>
              <span className="font-medium text-space-light/70">Score:</span>
              <span className="ml-2">{proposalData.scores_total.toFixed(2)}</span>
            </div>
          )}
          {proposalData.quorum && (
            <div>
              <span className="font-medium text-space-light/70">Quorum:</span>
              <span className="ml-2">{proposalData.quorum} {proposalData.symbol}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-space-light/70">Privacy:</span>
            <span className="ml-2 capitalize">{proposalData.privacy}</span>
          </div>
        </div>

        {proposalData.labels && proposalData.labels.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-space-light/70 mb-2">Labels:</h3>
            <div className="flex flex-wrap gap-2">
              {proposalData.labels.map((label, index) => (
                <span key={index} className="px-2 py-1 bg-space-dark/30 rounded">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {proposalData.choices && proposalData.choices.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-space-light/70 mb-2">Choices:</h3>
            <ul className="list-disc list-inside space-y-1">
              {proposalData.choices.map((choice, index) => (
                <li key={index}>
                  {choice}
                  {proposalData.scores && proposalData.scores[index] !== undefined && (
                    <span className="ml-2 text-space-light/70">
                      ({proposalData.scores[index].toFixed(2)} {proposalData.symbol})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposalData.plugins?.safeSnap && (
          <div className="mt-6">
            <h3 className="font-medium text-space-light/70 mb-2">SafeSnap Transactions:</h3>
            <div className="space-y-4">
              {proposalData.plugins.safeSnap.safes.map((safe, safeIndex) => (
                <div key={safeIndex} className="bg-space-dark/30 p-4 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="font-medium text-space-light/70">Network:</span>
                      <span className="ml-2">{safe.network}</span>
                    </div>
                    <div>
                      <span className="font-medium text-space-light/70">Reality Address:</span>
                      <div className="flex items-center ml-2 inline-flex">
                        <code className="bg-space-dark/50 px-2 py-1 rounded">
                          {`${safe.realityAddress.slice(0, 6)}...${safe.realityAddress.slice(-4)}`}
                        </code>
                        <CopyButton textToCopy={safe.realityAddress} size="xs" className="ml-1" />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-space-light/70">MultiSend Address:</span>
                      <div className="flex items-center ml-2 inline-flex">
                        <code className="bg-space-dark/50 px-2 py-1 rounded">
                          {`${safe.multiSendAddress.slice(0, 6)}...${safe.multiSendAddress.slice(-4)}`}
                        </code>
                        <CopyButton textToCopy={safe.multiSendAddress} size="xs" className="ml-1" />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-space-light/70">Safe Hash:</span>
                      <div className="flex items-center ml-2 inline-flex">
                        <code className="bg-space-dark/50 px-2 py-1 rounded">
                          {`${safe.hash.slice(0, 6)}...${safe.hash.slice(-4)}`}
                        </code>
                        <CopyButton textToCopy={safe.hash} size="xs" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {safe.txs.map((tx, txIndex) => (
                      <div key={txIndex} className="bg-space-dark/50 p-3 rounded">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="font-medium text-space-light/70">Transaction Hash:</span>
                            <div className="flex items-center ml-2 inline-flex">
                              <code className="bg-space-dark/70 px-2 py-1 rounded">
                                {`${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`}
                              </code>
                              <CopyButton textToCopy={tx.hash} size="xs" className="ml-1" />
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-space-light/70">Nonce:</span>
                            <span className="ml-2">{tx.nonce}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {tx.transactions.map((subTx, subTxIndex) => (
                            <div key={subTxIndex} className="bg-space-dark/70 p-2 rounded text-xs">
                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <span className="font-medium text-space-light/70">To:</span>
                                  <div className="flex items-center ml-2 inline-flex">
                                    <code>
                                      {`${subTx.to.slice(0, 6)}...${subTx.to.slice(-4)}`}
                                    </code>
                                    <CopyButton textToCopy={subTx.to} size="xs" className="ml-1" />
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-space-light/70">Value:</span>
                                  <span className="ml-2">{subTx.value}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-space-light/70">Operation:</span>
                                  <span className="ml-2">{subTx.operation}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-space-light/70">Nonce:</span>
                                  <span className="ml-2">{subTx.nonce}</span>
                                </div>
                              </div>
                              <div className="mt-1">
                                <span className="font-medium text-space-light/70">Data:</span>
                                <div className="flex items-center gap-1">
                                  <code className="ml-2 break-all">
                                    {subTx.data}
                                  </code>
                                  {subTx.data && subTx.data.startsWith('0x') && (
                                    <CopyButton textToCopy={subTx.data} size="xs" />
                                  )}
                                </div>
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

        {proposalData.discussion && (
          <div className="mt-4">
            <h3 className="font-medium text-space-light/70 mb-2">Discussion:</h3>
            <a 
              href={proposalData.discussion}
              target="_blank"
              rel="noopener noreferrer"
              className="text-space hover:underline"
            >
              View Discussion →
            </a>
          </div>
        )}

        {proposalData.flagged && (
          <div className="mt-4 text-amber-500">
            ⚠️ This proposal has been flagged
          </div>
        )}
      </div>
    </div>
  );
}
