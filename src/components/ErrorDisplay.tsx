
import { ArrowLeft } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onBack: () => void;
}

export default function ErrorDisplay({ error, onBack }: ErrorDisplayProps) {
  return (
    <div className="p-4 text-red-500 max-w-6xl mx-auto">
      <div className="steel-panel p-6">
        <h2 className="text-xl font-semibold mb-4 ethereal-text">Error</h2>
        <p>{error}</p>
        <button onClick={onBack} className="steel-button mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </button>
      </div>
    </div>
  );
}
