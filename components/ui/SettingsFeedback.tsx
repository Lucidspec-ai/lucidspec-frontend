import React from 'react';

export type SettingsFeedbackValue = { kind: 'success' | 'error'; message: string };

export function SettingsFeedback({ feedback }: { feedback: SettingsFeedbackValue | null }) {
  if (!feedback) return null;
  return (
    <p role={feedback.kind === 'error' ? 'alert' : 'status'}
      className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${feedback.kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
      {feedback.message}
    </p>
  );
}
