import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('generator prompt-assist guidance', () => {
  it('keeps prompt-assist guidance aligned to concrete server build wording', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'app/generator/page.tsx'), 'utf8');

    expect(source).toContain(
      'Build a new Linux server app-web-22 in production with 8 vCPU, 32 GB RAM using the hardened Ubuntu 24.04 baseline. Include dependencies, approval, change window, validation, and rollback.',
    );
    expect(source).toContain('such as a <span className="font-semibold text-slate-700">server build</span>');
    expect(source).toContain('instead of broad phrases like <span className="font-semibold text-slate-700">platform setup</span>');
  });

  it('keeps compliance remediation guidance aligned to concrete audit control wording', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'app/generator/page.tsx'), 'utf8');

    expect(source).toContain(
      'Fix the privileged access review audit control deficiency in production by implementing quarterly reviewer evidence capture owned by the IAM governance team. Include the control requirement, owner, evidence expectation, validation standard, approvals, and rollback or containment path.',
    );
    expect(source).toContain(
      'Fix the evidence gap for privileged access reviews in production by collecting the missing reviewer evidence and attaching the audit artifact package. Include the owner, evidence requirement, validation standard, approvals, and rollback or containment path.',
    );
    expect(source).toContain('workflow wording like <span className="font-semibold text-slate-700">audit control fix</span>');
    expect(source).toContain('<span className="font-semibold text-slate-700">evidence gap remediation</span>');
    expect(source).toContain('instead of broad phrases like <span className="font-semibold text-slate-700">compliance cleanup</span>');
  });
});
