
import { useEffect, useState } from 'react';
import { retrieveQuestions, Question } from 'reality-kleros-subgraph';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const fetchedQuestions = await retrieveQuestions(1); // Ethereum mainnet
        setQuestions(fetchedQuestions.slice(0, 5)); // Get first 5 questions
        setError(null);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">RealityETH Questions</h1>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : isLoading ? (
        <div>Loading questions...</div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-2 bg-white">
              <h3 className="text-lg font-medium">{question.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">ID:</div>
                  <div className="font-mono">{question.id}</div>
                </div>
                <div>
                  <div className="font-semibold">Description:</div>
                  <div>{question.description}</div>
                </div>
                <div>
                  <div className="font-semibold">Phase:</div>
                  <div>{question.phase}</div>
                </div>
                <div>
                  <div className="font-semibold">Type:</div>
                  <div>{question.qType}</div>
                </div>
                <div>
                  <div className="font-semibold">Arbitrator:</div>
                  <div className="font-mono">{question.arbitrator}</div>
                </div>
                <div>
                  <div className="font-semibold">Contract:</div>
                  <div className="font-mono">{question.contract}</div>
                </div>
                <div>
                  <div className="font-semibold">Current Answer:</div>
                  <div>{question.currentAnswer}</div>
                </div>
                <div>
                  <div className="font-semibold">Current Bond:</div>
                  <div>{question.currentBond}</div>
                </div>
                <div>
                  <div className="font-semibold">Minimum Bond:</div>
                  <div>{question.minimumBond}</div>
                </div>
                <div>
                  <div className="font-semibold">Time Remaining:</div>
                  <div>{question.timeRemaining}</div>
                </div>
                <div>
                  <div className="font-semibold">Time to Open:</div>
                  <div>{question.timeToOpen}</div>
                </div>
                <div>
                  <div className="font-semibold">Created:</div>
                  <div>{new Date(question.createdTimestamp * 1000).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-semibold">Opening:</div>
                  <div>{new Date(question.openingTimestamp * 1000).toLocaleString()}</div>
                </div>
                {question.arbitrationRequestedBy && (
                  <div>
                    <div className="font-semibold">Arbitration Requested By:</div>
                    <div className="font-mono">{question.arbitrationRequestedBy}</div>
                  </div>
                )}
                {question.currentScheduledFinalizationTimestamp && (
                  <div>
                    <div className="font-semibold">Finalization Scheduled:</div>
                    <div>{new Date(parseInt(question.currentScheduledFinalizationTimestamp) * 1000).toLocaleString()}</div>
                  </div>
                )}
                {question.finalAnswer && (
                  <div>
                    <div className="font-semibold">Final Answer:</div>
                    <div>{question.finalAnswer}</div>
                  </div>
                )}
                {question.options.length > 0 && (
                  <div className="col-span-2">
                    <div className="font-semibold">Options:</div>
                    <ul className="list-disc list-inside">
                      {question.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.answers.length > 0 && (
                  <div className="col-span-2">
                    <div className="font-semibold">Answers:</div>
                    <ul className="list-disc list-inside">
                      {question.answers.map((answer, index) => (
                        <li key={index}>
                          Value: {answer.value} | Bond: {answer.bond} | Timestamp: {new Date(answer.timestamp).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.responses.length > 0 && (
                  <div className="col-span-2">
                    <div className="font-semibold">Responses:</div>
                    <ul className="list-disc list-inside">
                      {question.responses.map((response, index) => (
                        <li key={index}>
                          Value: {response.value} | Bond: {response.bond} | User: {response.user} | Timestamp: {new Date(response.timestamp).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.template && (
                  <div className="col-span-2">
                    <div className="font-semibold">Template:</div>
                    <div>Template ID: {question.template.templateId}</div>
                    <div>Question Text: {question.template.questionText}</div>
                    <div>Creator: {question.template.creator}</div>
                    <div>Created: {new Date(question.template.creationTimestamp * 1000).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No questions found</div>
      )}
    </div>
  );
}
