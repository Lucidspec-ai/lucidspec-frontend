import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { WorkspaceShell } from './WorkspaceShell';

describe('WorkspaceShell', () => {
  it('does not render the default workspace banner when header text is intentionally blank', () => {
    const html = renderToStaticMarkup(
      <WorkspaceShell
        activeHref="/generator"
        headerEyebrow=""
        headerDescription=""
        headerStats={[
          { label: 'Pro plan', icon: 'pricing' },
          { label: '38 / 100 used', icon: 'spec' },
        ]}
        planLabel="Pro"
        planUsageLabel="38 / 100 used"
        usagePercent={38}
        userEmail="lucidspec@example.com"
        onSignOut={() => {}}
      >
        <div>Generator content</div>
      </WorkspaceShell>
    );

    expect(html).toContain('Pro plan');
    expect(html).toContain('38 / 100 used');
    expect(html).not.toContain('Execution workspace');
    expect(html).not.toContain('Track specs, briefings, risks, and readiness before work reaches engineering.');
    expect(html).toContain('Generator content');
  });
});
