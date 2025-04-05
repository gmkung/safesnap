
import { Question } from 'reality-kleros-subgraph';
import { formatDate } from '@/utils/questionUtils';

interface TemplateInfoProps {
    question: Question;
}

export default function TemplateInfo({ question }: TemplateInfoProps) {
    if (!question.template) return null;

    return (
        <div>
            <h3 className="text-lg font-medium text-space-light/70 mb-2">Template Information</h3>
            <div className="glass-panel p-4">
                <dl className="grid grid-cols-1 gap-4">
                    <div>
                        <dt className="font-medium text-space-light/70">Template ID</dt>
                        <dd className="mt-1 text-foreground">{question.template.templateId}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-space-light/70">Question Text</dt>
                        <dd className="mt-1 text-foreground">{question.template.questionText}</dd>
                    </div>
                    {question.template.creator && (
                        <div>
                            <dt className="font-medium text-space-light/70">Creator</dt>
                            <dd className="mt-1 text-foreground">{question.template.creator}</dd>
                        </div>
                    )}
                    {question.template.creationTimestamp && (
                        <div>
                            <dt className="font-medium text-space-light/70">Created</dt>
                            <dd className="mt-1 text-foreground">{formatDate(question.template.creationTimestamp * 1000)}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
