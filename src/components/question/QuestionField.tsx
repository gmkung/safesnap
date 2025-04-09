
import React from 'react';
import CopyButton from '../CopyButton';

interface QuestionFieldProps {
  label: string;
  children: React.ReactNode;
  copyText?: string;
  className?: string;
}

export default function QuestionField({ label, children, copyText, className }: QuestionFieldProps) {
  return (
    <div className={className}>
      <dt className="font-medium text-space-light/70">{label}</dt>
      <dd className="mt-1 flex items-center">
        {children}
        {copyText && <CopyButton textToCopy={copyText} className="ml-1" />}
      </dd>
    </div>
  );
}
