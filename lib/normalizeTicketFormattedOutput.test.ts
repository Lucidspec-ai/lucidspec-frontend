import { describe, expect, it } from 'vitest';
import { normalizeTicketFormattedOutput, shouldUseBlockedTicketView } from './normalizeTicketFormattedOutput';
import { deriveLimitedProceedScope, rewriteLimitedProceedPanelText } from './executionProceedScope';

describe('normalizeTicketFormattedOutput', () => {
  it('removes duplicate raw sections when split-ticket sections are present', () => {
    const input = [
      '<b>SECURITY REMEDIATION TICKET:</b><br>Security block<br><br>',
      '<hr><br>',
      '<b>IMPLEMENTATION TICKET:</b><br>Implementation block<br><br>',
      '<hr><br>',
      '<b>PRIORITY:</b><br>High<br><br>',
      '<hr><br>',
      '<b>MAIN TASK TITLE:</b><br>Main task title<br><br>',
      '<hr><br>',
      '<b>CRITICAL SECURITY TASK (AUTO-GENERATED):</b><br>Critical task block<br><br>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('SECURITY REMEDIATION TICKET');
    expect(output).toContain('IMPLEMENTATION TICKET');
    expect(output).not.toContain('<b>PRIORITY:</b><br>');
    expect(output).not.toContain('MAIN TASK TITLE');
    expect(output).not.toContain('CRITICAL SECURITY TASK');
  });

  it('removes duplicate organized cards when richer split-ticket cards are present', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">2. Security Remediation Ticket</div><div style="body">Security block</div></div>',
      '<div style="card"><div style="title">3. Main Implementation Ticket</div><div style="body">Implementation block</div></div>',
      '<div style="card"><div style="title">12. Blockers</div><div style="body">Target logging account not approved -&gt; blocks execution.</div></div>',
      '<div style="card"><div style="title">13. Missing Information Triage</div><div style="body"><b>Needed Before Execution</b><br><ul><li>Retention period</li></ul></div></div>',
      '<div style="card"><div style="title">15. Implementation Sequence</div><div style="body">Step 1</div></div>',
      '<div style="card"><div style="title">16. Dependencies</div><div style="body"><b>S3 destination bucket</b><br>Dependency satisfied: S3 destination bucket</div></div>',
      '<div style="card"><div style="title">7. Priority</div><div style="body">High</div></div>',
      '<div style="card"><div style="title">5. Main Task Title</div><div style="body">Main task title</div></div>',
      '<div style="card"><div style="title">9. Critical Security Task</div><div style="body">Critical task block</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Execution Constraints');
    expect(output).toContain('Story / Linked Critical Task');
    expect(output).toContain('Execution Details (What does done mean?)');
    expect(output).toContain('Dependencies & Planning (What does this rely on?)');
    expect(output).toContain('Steps / Technical Details');
    expect(output).toContain('Dependencies / Linked Issues');
    expect(output).toContain('Reference');
    expect(output).toContain('<section style=');
    expect(output).toContain('<details style=');
    expect(output).toContain('Security Track');
    expect(output).toContain('Implementation Track');
    expect(output).not.toContain('7. Priority');
    expect(output).not.toContain('5. Main Task Title');
    expect(output).not.toContain('9. Critical Security Task');
  });

  it('tightens older documentation-style phrasing during normalization', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">Execution depends on target logging account approval.</div></div>',
      '<div style="card"><div style="title">12. Blockers</div><div style="body"><ul><li>Requires confirmation of destination bucket</li></ul></div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">Information required from requester: account scope</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Blocked until target logging account approval.');
    expect(output).toContain('Must be defined: destination bucket');
    expect(output).not.toContain('Information required from requester');
  });

  it('surfaces main-task context inside the existing main task card', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">5. Main Task Title</div><div style="body">Centralize logging</div></div>',
      '<div style="card"><div style="title">6. Ticket Type & Justification</div><div style="body">Story</div></div>',
      '<div style="card"><div style="title">7. Priority</div><div style="body">High</div></div>',
      '<div style="card"><div style="title">24. Non-Technical Explanation</div><div style="body">PM translation text</div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body"><b>Inferred intent:</b><br>Standardize logs<br><br><b>Assumptions:</b><br>Existing archive account<br><br><b>Clarification needed:</b><br>Retention owner</div></div>',
      '<div style="card"><div style="title">11. Technical Scope</div><div style="body">Discovery spike to finalize logging architecture.</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Identity (What is this work?)');
    expect(output).toContain('Title / Summary');
    expect(output).toContain('Execution Details (What does done mean?)');
    expect(output).toContain('Steps / Technical Details');
    expect(output).toContain('Discovery spike to finalize logging architecture.');
    expect(output).toContain('Reference');
    expect(output).not.toContain('Primary Task');
    expect(output).toContain('Description');
    expect(output).toContain('Inferred intent:');
  });

  it('keeps reference focused on secondary detail while main task carries scope context', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">5. Main Task Title</div><div style="body">Centralize logging</div></div>',
      '<div style="card"><div style="title">6. Ticket Type & Justification</div><div style="body">Story</div></div>',
      '<div style="card"><div style="title">7. Priority</div><div style="body">High</div></div>',
      '<div style="card"><div style="title">8. Sensitive Data Detected</div><div style="body">No secrets found</div></div>',
      '<div style="card"><div style="title">9. Critical Security Task</div><div style="body">Rotate leaked key</div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">Inferred intent and assumptions</div></div>',
      '<div style="card"><div style="title">11. Technical Scope</div><div style="body">Org trail plus archive bucket</div></div>',
      '<div style="card"><div style="title">24. Non-Technical Explanation</div><div style="body">PM translation text</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Reference');
    expect(output).toContain('Identity (What is this work?)');
    expect(output).toContain('Title / Summary');
    expect(output).toContain('Description');
    expect(output).toContain('Execution Details (What does done mean?)');
    expect(output).toContain('Steps / Technical Details');
    expect(output).toContain('Sensitive Data');
    expect(output).toContain('Critical Security Task');
    expect(output).toContain('PM Translation');
    expect(output.match(/Description<\/div>/g)?.length ?? 0).toBe(1);
    expect(output).not.toContain('Technical Scope</div>');
  });

  it('keeps blocker labels out of the control panel and avoids repeating them in constraints', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">Do now -&gt; Confirm target logging account.<br>Confirm -&gt; Logging account; Destination bucket; IAM model; Target logging account; Destination bucket / log store<br>Blocked -&gt; Logging account approved.<br>Can proceed now -&gt; Review current CloudTrail coverage.; Review current CloudTrail coverage.; Planning, dependency analysis, and other non-production preparation.<br></div></div>',
      '<div style="card"><div style="title">12. Blockers</div><div style="body"><ul><li>Target logging account not approved -&gt; blocks execution.</li><li>Destination bucket or log store not approved -&gt; blocks execution.</li></ul></div></div>',
      '<div style="card"><div style="title">13. Missing Information Triage</div><div style="body"><b>Blocked Now</b><br><ul><li>Target logging account</li><li>Destination bucket / log store</li></ul><br><b>Needed Before Execution</b><br><ul><li>Retention period</li></ul></div></div>',
      '<div style="card"><div style="title">16. Dependencies</div><div style="body"><b>Target logging account</b><br>Dependency to be confirmed: Target logging account<br><br><b>S3 destination bucket</b><br>Dependency to be confirmed: S3 destination bucket<br><br><b>Retention period</b><br>Dependency to be confirmed: Retention period</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).not.toContain('Confirm -&gt;');
    expect(output).toContain('Blocked -&gt; Target logging account; Destination bucket / log store');
    expect(output).not.toContain('Blocked -&gt; Logging account approved.');
    expect(output).toContain('Can proceed now -&gt; Review current CloudTrail coverage.');
    expect(output.toLowerCase()).not.toContain('planning, dependency analysis, and other non-production preparation');
    expect(output).toContain('<b>Blockers</b><br>');
    expect(output).toContain('<b>Needed Soon</b><br>');
    expect(output).not.toContain('<b>Blocked Now</b><br>');
    expect(output.match(/<li>Target logging account<\/li>/g)?.length ?? 0).toBe(1);
    expect(output.match(/<li>Destination bucket \/ log store<\/li>/g)?.length ?? 0).toBe(1);
    expect(output.match(/<li>Retention period<\/li>/g)?.length ?? 0).toBe(1);
  });

  it('dedupes execution constraints across buckets using canonical labels', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">12. Blockers</div><div style="body"><ul><li>Target logging account not approved -&gt; blocks execution.</li></ul></div></div>',
      '<div style="card"><div style="title">13. Missing Information Triage</div><div style="body"><b>Blocked Now</b><br><ul><li>Target logging account</li><li>IAM access model</li><li>Security Lake or SIEM integration target</li></ul><br><b>Needed Before Execution</b><br><ul><li>Logging account</li><li>IAM model</li><li>SIEM integration target</li><li>Retention period</li></ul></div></div>',
      '<div style="card"><div style="title">16. Dependencies</div><div style="body"><b>Target logging account</b><br>Dependency to be confirmed: Target logging account<br><br><b>Cross-account IAM role</b><br>Dependency to be confirmed: Cross-account IAM role<br><br><b>SIEM integration target</b><br>Dependency to be confirmed: SIEM integration target<br><br><b>Retention period</b><br>Dependency to be confirmed: Retention period</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output.match(/<li>Target logging account<\/li>/g)?.length ?? 0).toBe(1);
    expect(output.match(/<li>IAM access model<\/li>/g)?.length ?? 0).toBe(1);
    expect(output.match(/<li>Security Lake or SIEM integration target<\/li>/g)?.length ?? 0).toBe(1);
    expect(output.match(/<li>Retention period<\/li>/g)?.length ?? 0).toBe(1);
  });

  it('renders split tracks without repeating title and priority inside the track body', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">2. Security Remediation Ticket</div><div style="body"><b>Title:</b><br>Rotate compromised AWS access key<br><br><b>Priority:</b><br>Critical<br><br><b>Type:</b><br>Security Remediation<br><br><b>Required Actions:</b><br>Disable the exposed key.</div></div>',
      '<div style="card"><div style="title">3. Main Implementation Ticket</div><div style="body"><b>Title:</b><br>Configure centralized logging<br><br><b>Priority:</b><br>High<br><br><b>Type:</b><br>Story<br><br><b>Scope:</b><br>Set up centralized AWS CloudTrail logging.</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Security Track');
    expect(output).toContain('Implementation Track');
    expect(output.match(/>Rotate compromised AWS access key</g)?.length ?? 0).toBe(1);
    expect(output.match(/>Critical</g)?.length ?? 0).toBe(1);
    expect(output.match(/>Configure centralized logging</g)?.length ?? 0).toBe(1);
    expect(output.match(/>High</g)?.length ?? 0).toBe(1);
  });

  it('drops subset duplicate parallel-work phrasing from the execution control panel', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">Can proceed now -&gt; Review current CloudTrail coverage and planning, dependency analysis, and other non-production preparation.; Planning, dependency analysis, and other non-production preparation.<br></div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Can proceed now -&gt; Review current CloudTrail coverage.<br>');
    expect(output.toLowerCase()).not.toContain('planning, dependency analysis, and other non-production preparation');
    expect(output.match(/Can proceed now -&gt;/g)?.length ?? 0).toBe(1);
  });

  it('limits blocked tickets to execution control, constraints, execution details, and dependencies planning', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">Immediate action -&gt; Confirm Hyper-V host access.</div></div>',
      '<div style="card"><div style="title">5. Main Task Title</div><div style="body">Automate Hyper-V VM creation</div></div>',
      '<div style="card"><div style="title">11. Technical Scope</div><div style="body">Provision VMs.</div></div>',
      '<div style="card"><div style="title">12. Blockers</div><div style="body"><ul><li>Hyper-V host or cluster access</li></ul></div></div>',
      '<div style="card"><div style="title">13. Missing Information Triage</div><div style="body"><b>Blockers</b><br><ul><li>Hyper-V host or cluster access</li></ul></div></div>',
      '<div style="card"><div style="title">15. Implementation Sequence</div><div style="body">Step 1: Confirm host access.</div></div>',
      '<div style="card"><div style="title">16. Dependencies</div><div style="body"><b>Hyper-V host or cluster access</b><br>Dependency to be confirmed.</div></div>',
      '<div style="card"><div style="title">17. Acceptance Criteria</div><div style="body">VM is provisioned.</div></div>',
      '<div style="card"><div style="title">23. Risks (If Assumptions Incorrect)</div><div style="body">Provisioning may fail.</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input, { blockedOnly: true });

    expect(output).toContain('Ticket Quality Check');
    expect(output).toContain('Execution Constraints');
    expect(output).toContain('Execution Details (What does done mean?)');
    expect(output).toContain('Dependencies & Planning (What does this rely on?)');
    expect(output).not.toContain('Identity (What is this work?)');
    expect(output).not.toContain('Safe Actions Allowed Now');
    expect(output).not.toContain('Effort & Confidence');
    expect(output).not.toContain('Reference');
    expect(output).not.toContain('Risks / Assumptions');
  });

  it('filters already-normalized executive cards for blocked tickets', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">Execution Control Panel</div><div style="body">Immediate action.</div></div>',
      '<div style="card"><div style="title">Identity (What is this work?)</div><div style="body">Hidden task.</div></div>',
      '<div style="card"><div style="title">Execution Constraints</div><div style="body">Blockers.</div></div>',
      '<div style="card"><div style="title">Can Proceed Now</div><div style="body">Hidden proceed text.</div></div>',
      '<div style="card"><div style="title">Execution Details (What does done mean?)</div><div style="body">Step 1.</div></div>',
      '<div style="card"><div style="title">Dependencies & Planning (What does this rely on?)</div><div style="body">Dependency.</div></div>',
      '<div style="card"><div style="title">Effort & Confidence</div><div style="body">Hidden confidence.</div></div>',
      '<div style="card"><div style="title">Reference</div><div style="body">Hidden reference.</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input, { blockedOnly: true });

    expect(output).toContain('Execution Control Panel');
    expect(output).toContain('Execution Constraints');
    expect(output).toContain('Execution Details (What does done mean?)');
    expect(output).toContain('Dependencies & Planning (What does this rely on?)');
    expect(output).not.toContain('Identity (What is this work?)');
    expect(output).not.toContain('Can Proceed Now');
    expect(output).not.toContain('Effort & Confidence');
    expect(output).not.toContain('Reference');
  });

  it('detects blocked ticket display mode from governance or readiness state', () => {
    expect(shouldUseBlockedTicketView({ governance: { proceed_prohibited: true } })).toBe(true);
    expect(shouldUseBlockedTicketView({ governance: { execution_status: 'blocked' } })).toBe(true);
    expect(shouldUseBlockedTicketView({ governance: { execution_status_label: 'Execution blocked' } })).toBe(true);
    expect(shouldUseBlockedTicketView({ readiness_status: 'Not execution-ready' })).toBe(true);
    expect(shouldUseBlockedTicketView({ governance: { execution_status: 'ready' }, readiness_status: 'Execution-ready' })).toBe(false);
  });

  it('preserves backend discovery-only gates without client-side limited-scope repair', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">',
      'SAFE TO PROCEED -&gt; DISCOVERY ONLY<br>',
      'PROCEED SCOPE -&gt; None<br>',
      'BLOCKED UNTIL -&gt; Discovery evidence still required before implementation can start | Blocks expansion beyond None<br>',
      'DO NOW -&gt; Confirm the exact scope boundary for the first executable slice<br>',
      'NEXT DECISION -&gt; How to configure development tools to use custom inference profiles<br>',
      'CONFIDENCE -&gt; 5/10 (Proceed scope unclear: -2; Dependencies unclear: -1; Acceptance criteria weak: -1)<br>',
      'Confirmation task -&gt; Confirm the exact scope boundary for the first executable slice<br>',
      'Confirmation task -&gt; Confirm the implementation direction for the next gate<br>',
      'Risk -&gt; Difficulty in tracking AI-related spend through Amazon Marketplace<br>',
      'Risk -&gt; Challenges in providing transparency to different teams for their specific workloads<br>',
      '</div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
      '</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('SAFE TO PROCEED -&gt; DISCOVERY ONLY');
    expect(output).toContain('PROCEED SCOPE -&gt; None');
    expect(output).toContain('DO NOW -&gt; Confirm the exact scope boundary for the first executable slice');
    expect(output).toContain('Discovery evidence still required before implementation can start');
  });

  it('does not derive generic limited proceed scope from meeting direction text', () => {
    const repair = deriveLimitedProceedScope({
      proceed_decision: 'DISCOVERY ONLY',
      formatted_output: 'SAFE TO PROCEED -> DISCOVERY ONLY PROCEED SCOPE -> None',
      task_input: 'Keep it simple. Stay at executive-level visibility for now. Use Cost Explorer and budgets first. Defer deeper team-level tracking.',
    });

    expect(repair).toBeNull();
  });

  it('does not rewrite execution-stack details in the frontend compatibility layer', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">',
      'SAFE TO PROCEED -&gt; DISCOVERY ONLY<br>',
      'PROCEED SCOPE -&gt; None<br>',
      'DO NOW -&gt; Confirm the exact scope boundary for the first executable slice<br>',
      '</div></div>',
      '<div style="card"><div style="title">15. Implementation Sequence</div><div style="body"><ul>',
      '<li>Use Cost Explorer to review current AI spend by account.</li>',
      '<li>Consider using QuickSight for dashboards.</li>',
      '<li>Set initial high-level budgets for the relevant AI accounts.</li>',
      '<li>Deferred option: evaluate QuickSight dashboards later after executive visibility and initial budgets are validated.</li>',
      '</ul></div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
      '</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Use Cost Explorer to review current AI spend by account.');
    expect(output).toContain('Consider using QuickSight for dashboards.');
    expect(output).toContain('Set initial high-level budgets for the relevant AI accounts.');
    expect(output).toContain('Deferred option: evaluate QuickSight dashboards later after executive visibility and initial budgets are validated.');
  });

  it('does not rewrite raw execution-stack lines in the frontend compatibility layer', () => {
    const input = [
      '**EXECUTION CONTROL PANEL**',
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      'DO NOW -> Confirm the exact scope boundary for the first executable slice',
      '',
      '**EXECUTION STACK**',
      '- Use Cost Explorer to review current AI spend by account.',
      '- Consider using QuickSight for dashboards.',
      '- Set initial high-level budgets for the relevant AI accounts.',
      '',
      '**NOT YET COVERED**',
      '- Deferred option: evaluate QuickSight dashboards later after executive visibility and initial budgets are validated.',
      '',
      '**SOURCE SIGNALS**',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('\n');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain('- Use Cost Explorer to review current AI spend by account.');
    expect(output).toContain('- Consider using QuickSight for dashboards.');
    expect(output).toContain('- Set initial high-level budgets for the relevant AI accounts.');
    expect(output).toContain('- Deferred option: evaluate QuickSight dashboards later after executive visibility and initial budgets are validated.');
  });

  it('does not rewrite confirmation details in the frontend compatibility layer', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">',
      'SAFE TO PROCEED -&gt; DISCOVERY ONLY<br>',
      'PROCEED SCOPE -&gt; None<br>',
      'Confirmation task -&gt; Confirm the exact scope boundary for the first executable slice<br>',
      'Confirmation task -&gt; Confirm whether Bedrock custom inference profiles are required for team-level attribution<br>',
      'Confirmation task -&gt; Confirm the implementation direction for the next gate<br>',
      '</div></div>',
      '<div style="card"><div style="title">18. PM Required Confirmations</div><div style="body"><ul>',
      '<li>Confirm tagging coverage is reliable enough for the relevant AI accounts and services.</li>',
      '<li>Confirm whether Bedrock custom inference profiles are required for team-level attribution.</li>',
      '<li>Deferred confirmation: revisit Bedrock custom inference profiles later if deeper attribution becomes in scope.</li>',
      '</ul></div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
      '</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('Confirmation task -&gt; Confirm whether Bedrock custom inference profiles are required for team-level attribution');
    expect(output).toContain('Deferred confirmation: revisit Bedrock custom inference profiles later if deeper attribution becomes in scope.');
  });

  it('does not rewrite confidence rationale in the frontend compatibility layer', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">',
      'SAFE TO PROCEED -&gt; DISCOVERY ONLY<br>',
      'PROCEED SCOPE -&gt; None<br>',
      'CONFIDENCE -&gt; 5/10 (Proceed scope unclear: -2; Dependencies unclear: -1; Acceptance criteria weak: -1)<br>',
      'Evidence link -&gt; blockers unresolved: -2; major decisions still open: -1; dependencies unclear: -1; acceptance criteria weak: -1<br>',
      '</div></div>',
      '<div style="card"><div style="title">21. Section Confidence</div><div style="body"><ul>',
      '<li>blockers unresolved: -2</li>',
      '<li>major decisions still open: -1</li>',
      '<li>dependencies unclear: -1</li>',
      '<li>acceptance criteria weak: -1</li>',
      '</ul></div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
      '</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('CONFIDENCE -&gt; 5/10');
    expect(output).toContain('blockers unresolved: -2');
  });

  it('does not rewrite raw confidence rationale in the frontend compatibility layer', () => {
    const input = [
      '**EXECUTION CONTROL PANEL**',
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      'CONFIDENCE -> 5/10 (Proceed scope unclear: -2; Dependencies unclear: -1; Acceptance criteria weak: -1)',
      'Evidence note -> blockers unresolved: -2; major decisions still open: -1; dependencies unclear: -1; acceptance criteria weak: -1',
      '',
      '**SOURCE SIGNALS**',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('\n');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain('CONFIDENCE -> 5/10');
    expect(output).toContain('blockers unresolved: -2');
  });

  it('preserves null-like proceed scopes from backend rendered output', () => {
    const input = [
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> null',
      'BLOCKED UNTIL -> Discovery evidence still required before implementation can start | Blocks expansion beyond None',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('<br>');

    const output = normalizeTicketFormattedOutput(input);

    expect(output).toContain('PROCEED SCOPE -> null');
  });

  it('does not derive generic limited scope for non-cost meetings with a concrete first step', () => {
    const repair = deriveLimitedProceedScope({
      proceed_decision: 'DISCOVERY ONLY',
      formatted_output: 'SAFE TO PROCEED -> DISCOVERY ONLY PROCEED SCOPE -> None',
      task_input: 'Start with read-only CloudTrail inventory first. Defer organization-wide rollout until account ownership is confirmed.',
    });

    expect(repair).toBeNull();
  });

  it('does not replace incidental DO NOW winners with fixture-specific frontend rewrites', () => {
    const input = [
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      'DO NOW -> Enable cost anomaly detection in billing console',
      'DO NOW -> Pilot a project to test budget and alert setups',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('<br>');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain('DO NOW -> Enable cost anomaly detection in billing console');
    expect(output).toContain('DO NOW -> Pilot a project to test budget and alert setups');
  });

  it('does not replace technical next decisions with fixture-specific frontend rewrites', () => {
    const technicalDecision = 'How to configure development tools to use custom inference profiles';
    const input = [
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      `NEXT DECISION -> ${technicalDecision}`,
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('<br>');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain(`NEXT DECISION -> ${technicalDecision}`);
  });

  it('does not suppress or merge risk content in the frontend compatibility layer', () => {
    const input = [
      '<div data-ticket-boxes="true">',
      '<div style="card"><div style="title">0. Execution Control Panel</div><div style="body">',
      'SAFE TO PROCEED -&gt; DISCOVERY ONLY<br>',
      'PROCEED SCOPE -&gt; None<br>',
      'Risk -&gt; Development teams may have backdoor access to resources<br>',
      'Risk -&gt; Tags not applied to all resources, especially AI usage<br>',
      'Risk -&gt; Untagged or partially tagged resources may reduce accuracy of team-level spend reporting<br>',
      '</div></div>',
      '<div style="card"><div style="title">23. Risks (If Assumptions Incorrect)</div><div style="body"><ul>',
      '<li>Development teams may have backdoor access to resources.</li>',
      '<li>Tags not applied to all resources, especially AI usage.</li>',
      '<li>Untagged or partially tagged resources may reduce accuracy of team-level spend reporting.</li>',
      '<li>Shared accounts may limit clean team-level attribution without additional reporting design.</li>',
      '</ul></div></div>',
      '<div style="card"><div style="title">10. Structured Description</div><div style="body">',
      'The meeting resolved backdoor access: development teams cannot access restricted billing resources directly. Keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
      '</div></div>',
      '</div>',
    ].join('');

    const output = normalizeTicketFormattedOutput(input);
    expect(output).toContain('Development teams may have backdoor access');
    expect(output).toContain('Tags not applied to all resources');
    expect(output).toContain('Shared accounts may limit clean team-level attribution without additional reporting design');
  });

  it('does not remove execution-stack tooling lines in the frontend compatibility layer', () => {
    const input = [
      '**EXECUTION CONTROL PANEL**',
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      'DO NOW -> Establish executive-level AI spend visibility using Cost Explorer and existing account/tag views; set initial high-level budgets for the relevant AI accounts',
      '',
      '**EXECUTION STACK**',
      '- Use Cost Explorer to review current AI spend by account.',
      '- Trusted Advisor review for cost optimization.',
      '- Enable cost anomaly detection in billing console.',
      '- Build QuickSight dashboards.',
      '- Set initial high-level budgets for the relevant AI accounts.',
      '',
      '**SOURCE SIGNALS**',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('\n');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain('- Use Cost Explorer to review current AI spend by account.');
    expect(output).toContain('- Set initial high-level budgets for the relevant AI accounts.');
    expect(output).toContain('Trusted Advisor');
    expect(output).toContain('anomaly detection');
    expect(output).toContain('QuickSight');
  });

  it('does not align confidence explanation in the frontend compatibility layer', () => {
    const input = [
      'SAFE TO PROCEED -> DISCOVERY ONLY',
      'PROCEED SCOPE -> None',
      'CONFIDENCE -> 5/10 (Proceed scope unclear: -2; Dependencies unclear: -1; Acceptance criteria weak: -1)',
      'Evidence note -> blockers unresolved: -2; major decisions still open: -1; dependencies unclear: -1; acceptance criteria weak: -1',
      'The meeting direction was to keep it simple, stay at executive-level visibility for now, use Cost Explorer and budgets first, and defer deeper team-level tracking.',
    ].join('<br>');

    const output = rewriteLimitedProceedPanelText(input);

    expect(output).toContain('CONFIDENCE -> 5/10');
    expect(output).toContain('blockers unresolved: -2');
  });
});
