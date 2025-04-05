
import { ArrowLeft } from 'lucide-react';

interface NotFoundDisplayProps {
  onBack: () => void;
}

export default function NotFoundDisplay({ onBack }: NotFoundDisplayProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="steel-panel p-6">
        <h2 className="text-xl font-semibold mb-4 ethereal-text">Question Not Found</h2>
        <p className="mb-4">This might happen if you accessed this page directly.
          Please go back to the questions list and click on a question to view its details.</p>
        <button onClick={onBack} className="steel-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </button>
      </div>
    </div>
  );
}
