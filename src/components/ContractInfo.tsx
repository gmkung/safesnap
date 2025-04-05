
import { Question } from 'reality-kleros-subgraph';
import CopyButton from './CopyButton';

interface ContractInfoProps {
    question: Question;
}

export default function ContractInfo({ question }: ContractInfoProps) {
    if (!question.contract) return null;

    return (
        <div className="glass-panel p-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <dt className="font-medium text-space-light/70">Contract Address</dt>
                    <dd className="mt-1 flex items-center">
                        <span className="text-foreground font-mono text-sm break-all">
                            {question.contract.address}
                        </span>
                        <CopyButton textToCopy={question.contract.address} className="ml-1" />
                    </dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Contract Name</dt>
                    <dd className="mt-1 text-foreground">{question.contract.config?.contract_name}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Contract Version</dt>
                    <dd className="mt-1 text-foreground">{question.contract.config?.contract_version}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Version Number</dt>
                    <dd className="mt-1 text-foreground">{question.contract.config?.version_number}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Chain ID</dt>
                    <dd className="mt-1 text-foreground">{question.contract.config?.chain_id}</dd>
                </div>
                <div>
                    <dt className="font-medium text-space-light/70">Token Ticker</dt>
                    <dd className="mt-1 text-foreground">{question.contract.config?.token_ticker}</dd>
                </div>
                {question.contract.config?.arbitrators && question.contract.config.arbitrators.length > 0 && (
                    <div className="md:col-span-2">
                        <dt className="font-medium text-space-light/70">Arbitrators</dt>
                        <dd className="mt-1 space-y-1">
                            {question.contract.config.arbitrators.map((arbitrator, index) => (
                                <div key={index} className="flex items-center">
                                    <span className="text-foreground font-mono text-sm break-all">{arbitrator}</span>
                                    <CopyButton textToCopy={arbitrator} className="ml-1" />
                                </div>
                            ))}
                        </dd>
                    </div>
                )}
            </dl>
        </div>
    );
}
