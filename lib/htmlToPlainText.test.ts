import { describe, expect, it, vi } from 'vitest';

vi.mock('dompurify', () => ({
  default: {
    sanitize: (value: string) => value,
  },
}));

import { htmlToPlainText } from './htmlToPlainText';

describe('htmlToPlainText', () => {
  it('removes UI-only expand markers from plain text output', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<details style="card"><summary style="summary"><div><div>Readiness Status</div></div><span>Expand</span></summary><div>Not execution-ready</div></details>',
      '<details style="card"><summary style="summary"><div><div>Can Proceed Now</div></div><span>Expand</span></summary><div>Confirm account inventory.</div></details>',
      '</div>',
    ].join('');

    const output = htmlToPlainText(input);

    expect(output).toContain('Readiness Status');
    expect(output).toContain('Not execution-ready');
    expect(output).toContain('Safe Actions Allowed Now');
    expect(output).toContain('Confirm account inventory.');
    expect(output).not.toContain('ExpandNot execution-ready');
    expect(output).not.toContain('ExpandConfirm account inventory.');
    expect(output).not.toContain('Expand');
  });
});
