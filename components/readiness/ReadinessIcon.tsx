import React from 'react';

export type ReadinessIconName = 'layers' | 'calendar' | 'shield' | 'context' | 'sparkles' | 'ticket' | 'examples' | 'plug' | 'card' | 'user' | 'info' | 'check' | 'minus' | 'chart' | 'cube' | 'bug' | 'bolt';

const paths: Record<ReadinessIconName, React.ReactNode> = {
  chart: <><path d="M4 4v16h16M8 15l4-4 3 2 5-7" /></>,
  cube: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9v10M3 8l9 4 9-4M8 5l9 5" /></>,
  bug: <><rect x="7" y="7" width="10" height="14" rx="5" /><path d="M9 7V5a3 3 0 0 1 6 0v2M3 10h4m10 0h4M3 16h4m10 0h4M5 4l3 4m8 0 3-4M5 22l3-4m8 0 3 4M12 11v10" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 11h16" /></>,
  shield: <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />,
  context: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" /></>,
  sparkles: <><path d="m10 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Zm9 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" /></>,
  ticket: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h4M9 12h6m-6 4h6" /></>,
  examples: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  plug: <><path d="M8 3v6m8-6v6M6 9h12v3a6 6 0 0 1-12 0V9Zm6 9v4" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m7 12 3 3 8-8" /></>,
  minus: <><circle cx="12" cy="12" r="9" /><path d="M7 12h10" /></>,
};

export function ReadinessIcon({ name, className = 'h-5 w-5' }: { name: ReadinessIconName; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>{paths[name]}</svg>;
}
