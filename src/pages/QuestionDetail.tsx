import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Question } from 'reality-kleros-subgraph';
import { configForAddress } from '@reality.eth/contracts';

interface ContractConfig {
  address: string;
  arbitrators: string[];
  version_number: string;
  chain_id: string;
  contract_name: string;
  contract_version: string;
  token_ticker: string;
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [question, setQuestion] = useState<Question | null>(location.state?.question || null);
  const [contractConfig, setContractConfig] = useState<ContractConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestionDetails = async () => {
      try {
        setLoading(true);
        
        if (question?.contract) {
          const config = configForAddress(question.contract);
          setContractConfig(config);
        }
      } catch (err) {
        console.error('Error loading question details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question details');
      } finally {
        setLoading(false);
      }
    };

    loadQuestionDetails();
  }, [question]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-4">
        Question not found. This might happen if you accessed this page directly.
        Please go back to the questions list and click on a question to view its details.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{question.title}</h1>

      {/* Question Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Question Details</h2>
        <dl className="grid grid-cols-1 gap-4">
          <div>
            <dt className="font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">{question.description}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 py-1 text-sm font-semibold rounded-full 
                ${question.phase === 'OPEN' ? 'bg-green-100 text-green-800' : 
                  question.phase === 'PENDING_ARBITRATION' ? 'bg-yellow-100 text-yellow-800' :
                  question.phase === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {question.phase}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Current Answer</dt>
            <dd className="mt-1 text-gray-900">{question.currentAnswer || 'No answer yet'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Current Bond</dt>
            <dd className="mt-1 text-gray-900">{question.currentBond}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Minimum Bond</dt>
            <dd className="mt-1 text-gray-900">{question.minimumBond}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(question.createdTimestamp * 1000).toLocaleString()}
            </dd>
          </div>
          {question.options && question.options.length > 0 && (
            <div>
              <dt className="font-medium text-gray-500">Options</dt>
              <dd className="mt-1 space-y-1">
                {question.options.map((option, index) => (
                  <div key={index} className="text-gray-900">
                    {index + 1}. {option}
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Contract Information */}
      {contractConfig && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="font-medium text-gray-500">Contract Address</dt>
              <dd className="mt-1 text-gray-900">{contractConfig.address}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Contract Name</dt>
              <dd className="mt-1 text-gray-900">{contractConfig.contract_name}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-gray-900">{contractConfig.contract_version}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Token</dt>
              <dd className="mt-1 text-gray-900">{contractConfig.token_ticker}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Chain ID</dt>
              <dd className="mt-1 text-gray-900">{contractConfig.chain_id}</dd>
            </div>
            {contractConfig.arbitrators.length > 0 && (
              <div>
                <dt className="font-medium text-gray-500">Arbitrators</dt>
                <dd className="mt-1 space-y-1">
                  {contractConfig.arbitrators.map((arbitrator, index) => (
                    <div key={index} className="text-gray-900">{arbitrator}</div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
} 