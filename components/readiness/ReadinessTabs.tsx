import React, { useRef } from 'react';
import { READINESS_SECTIONS } from './ReadinessChecklist';
import { ReadinessIcon } from './ReadinessIcon';

export const READINESS_TABS = [...READINESS_SECTIONS, { id: 'custom-rules', title: 'Custom Rules', icon: 'sparkles' as const }];

export function ReadinessTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div role="tablist" aria-label="Readiness categories" className="flex overflow-x-auto border-b border-slate-200 [scrollbar-width:thin]" onKeyDown={(event) => {
    const index = buttons.current.findIndex((button) => button === event.target);
    if (index < 0) return;
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % READINESS_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + READINESS_TABS.length) % READINESS_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = READINESS_TABS.length - 1;
    else return;
    event.preventDefault();
    onChange(READINESS_TABS[next].id);
    buttons.current[next]?.focus();
  }}>
    {READINESS_TABS.map((tab, index) => <button key={tab.id} ref={(node) => { buttons.current[index] = node; }} type="button" role="tab" id={`tab-${tab.id}`} aria-controls={`panel-${tab.id}`} aria-selected={value === tab.id} tabIndex={value === tab.id ? 0 : -1} onClick={() => onChange(tab.id)}
      className={`flex min-h-14 shrink-0 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-3 text-xs transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:flex-1 sm:gap-3 sm:px-4 sm:text-sm ${value === tab.id ? 'border-blue-600 font-semibold text-blue-700' : 'border-transparent font-medium text-slate-600 hover:bg-blue-50/50 hover:text-slate-950'}`}>
      <ReadinessIcon name={tab.icon} className="h-5 w-5" />{tab.title}
    </button>)}
  </div>;
}
