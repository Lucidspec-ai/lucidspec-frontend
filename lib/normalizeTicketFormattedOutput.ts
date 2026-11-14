'use client';

import { rewriteLimitedProceedPanelText } from './executionProceedScope';

const RAW_SECTION_MARKERS = {
  securityRemediation: '<b>SECURITY REMEDIATION TICKET:</b><br>',
  implementationTicket: '<b>IMPLEMENTATION TICKET:</b><br>',
  priority: '<b>PRIORITY:</b><br>',
  mainTaskTitle: '<b>MAIN TASK TITLE:</b><br>',
  criticalSecurityTask: '<b>CRITICAL SECURITY TASK (AUTO-GENERATED):</b><br>',
} as const;

const EXECUTIVE_HEADINGS = new Set([
  'Execution Control Panel',
  'Ticket Quality Check',
  'Readiness Status',
  'Execution Constraints',
  'Can Proceed Now',
  'Safe Actions Allowed Now',
  'Identity (What is this work?)',
  'Execution Details (What does done mean?)',
  'Dependencies & Planning (What does this rely on?)',
  'Main Task',
  'Story / Linked Critical Task',
  'Execution Sequence',
  'Dependencies',
  'Done When',
  'PM Decisions Needed',
  'Effort & Confidence',
  'Risks / Assumptions',
  'Reference',
]);
const BLOCKED_TICKET_HEADINGS = new Set([
  'Execution Control Panel',
  'Ticket Quality Check',
  'Execution Constraints',
  'Execution Details (What does done mean?)',
  'Dependencies & Planning (What does this rely on?)',
  'Execution Sequence',
  'Dependencies',
]);

type NormalizeTicketFormattedOutputOptions = {
  blockedOnly?: boolean;
};

type TicketDisplayState = {
  governance?: {
    execution_status?: string | null;
    execution_status_label?: string | null;
    proceed_prohibited?: boolean | null;
  } | null;
  readiness_status?: string | null;
};

export function shouldUseBlockedTicketView(ticket?: TicketDisplayState | null): boolean {
  const governance = ticket?.governance;
  const governanceStatus = (governance?.execution_status || '').trim().toLowerCase();
  const governanceStatusLabel = (governance?.execution_status_label || '').trim().toLowerCase();
  const readinessStatus = (ticket?.readiness_status || '').trim().toLowerCase();

  return (
    governance?.proceed_prohibited === true ||
    governanceStatus === 'blocked' ||
    governanceStatusLabel === 'execution blocked' ||
    readinessStatus.includes('not execution-ready') ||
    readinessStatus.includes('blocked')
  );
}

const STACK_STYLE = 'display:flex;flex-direction:column;gap:20px;width:100%;';
const CARD_STYLE =
  'border:1px solid #dbe3ee;border-radius:22px;padding:24px 26px;background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);box-shadow:0 10px 30px rgba(15,23,42,0.06),0 2px 8px rgba(15,23,42,0.04);margin:0;min-width:0;';
const CARD_TITLE_STYLE =
  'font-size:18px;line-height:1.3;font-weight:800;color:#0f172a;letter-spacing:-0.01em;margin:0 0 14px 0;';
const LAYER_SUMMARY_STYLE =
  'display:flex;align-items:flex-start;justify-content:space-between;gap:16px;cursor:pointer;list-style:none;';
const LAYER_SUMMARY_COPY_STYLE = 'display:flex;flex-direction:column;gap:6px;min-width:0;';
const LAYER_SUMMARY_HINT_STYLE = 'font-size:13px;line-height:1.5;color:#64748b;margin:0;';
const LAYER_CHEVRON_STYLE =
  'font-size:12px;line-height:1.4;font-weight:800;color:#475569;letter-spacing:0.08em;text-transform:uppercase;';
const SUBTITLE_STYLE =
  'font-size:12px;line-height:1.4;font-weight:800;color:#475569;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px 0;';
const SECTION_STYLE = 'margin:0 0 18px 0;';
const BODY_STYLE = 'font-size:15px;line-height:1.65;color:#334155;';
const PILL_ROW_STYLE = 'display:flex;flex-wrap:wrap;gap:10px;margin:0 0 18px 0;';
const PILL_STYLE =
  'display:inline-flex;flex-direction:column;gap:4px;padding:10px 12px;border-radius:14px;border:1px solid #dbe3ee;background:#ffffff;min-width:140px;';
const PILL_LABEL_STYLE =
  'font-size:11px;line-height:1.3;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;';
const PILL_VALUE_STYLE = 'font-size:14px;line-height:1.4;font-weight:700;color:#0f172a;';

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim();
}

function tightenDecisionSupportLanguage(value?: string): string {
  if (!value) return '';
  return rewriteLimitedProceedPanelText(value)
    .replace(
      /Only ([^.]+?) may continue in parallel\./gi,
      'Limit work to $1 until then.'
    )
    .replace(/Execution depends on\s+/gi, 'Blocked until ')
    .replace(/\bdepends on\b/gi, 'blocked until')
    .replace(/Requires confirmation(?: of)?[:\s]*/gi, 'Must be defined: ')
    .replace(/requires confirmation(?: of)?[:\s]*/gi, 'must be defined: ')
    .replace(/Information required from requester[:\s]*/gi, '')
    .replace(/Information required[:\s]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

const LOW_VALUE_PLACEHOLDERS = new Set([
  'not provided',
  'no immediate execution blockers identified',
  'no pre-execution dependency gates identified',
  'no later-stage clarifications identified',
  'no later-stage clarifications identified yet',
  'no explicit upstream blocker is stated',
  'no clearly independent parallel workstream identified',
  'environment not provided',
]);

function isLowValuePlaceholder(value?: string): boolean {
  const plain = stripHtmlTags(value || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\.$/, '');
  return !plain || LOW_VALUE_PLACEHOLDERS.has(plain);
}

function renderExecutiveSubsection(title: string, body?: string): string {
  const tightened = tightenDecisionSupportLanguage(body);
  if (!tightened || isLowValuePlaceholder(tightened)) return '';
  return `<div style="${SECTION_STYLE}"><div style="${SUBTITLE_STYLE}">${title}</div><div style="${BODY_STYLE}">${tightened}</div></div>`;
}

function renderRequiredExecutiveSubsection(title: string, body?: string): string {
  const tightened = tightenDecisionSupportLanguage(body) || 'Not provided';
  return `<div style="${SECTION_STYLE}"><div style="${SUBTITLE_STYLE}">${title}</div><div style="${BODY_STYLE}">${tightened}</div></div>`;
}

function dedupeHtmlListItems(value?: string): string {
  if (!value) return '';
  const seen = new Set<string>();
  return value.replace(/<li>([\s\S]*?)<\/li>/gi, (match, body) => {
    const key = stripHtmlTags(body || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!key) return '';
    if (seen.has(key)) return '';
    seen.add(key);
    return match;
  });
}

function renderExecutivePillRow(items: Array<[string, string | undefined]>): string {
  const pills = items
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<div style="${PILL_STYLE}"><div style="${PILL_LABEL_STYLE}">${label}</div><div style="${PILL_VALUE_STYLE}">${String(value)}</div></div>`
    );
  return pills.length ? `<div style="${PILL_ROW_STYLE}">${pills.join('')}</div>` : '';
}

function renderExecutiveLayer(
  title: string,
  body: string,
  options?: { collapsible?: boolean; open?: boolean }
): string {
  const tightenedBody = tightenDecisionSupportLanguage(body);
  if (!tightenedBody) return '';
  const collapsible = options?.collapsible ?? true;
  const open = options?.open ?? false;
  let style = CARD_STYLE;
  if (['Execution Control Panel', 'Ticket Quality Check', 'Readiness Status', 'Execution Constraints', 'Can Proceed Now', 'Safe Actions Allowed Now'].includes(title)) {
    style += 'background:linear-gradient(180deg,#f5fbff 0%,#eef8ff 100%);border-color:#93c5fd;';
  } else if (
    [
      'Identity (What is this work?)',
      'Execution Details (What does done mean?)',
      'Dependencies & Planning (What does this rely on?)',
      'Main Task',
      'Story / Linked Critical Task',
      'Execution Sequence',
      'Dependencies',
      'Done When',
      'PM Decisions Needed',
    ].includes(title)
  ) {
    style += 'background:linear-gradient(180deg,#f8fbff 0%,#f1f7ff 100%);border-color:#bfdbfe;';
  } else if (['Effort & Confidence', 'Risks / Assumptions', 'Reference'].includes(title)) {
    style += 'background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);border-color:#cbd5e1;';
  }

  if (!collapsible) {
    return `<section style="${style}"><div style="${CARD_TITLE_STYLE}">${title}</div><div>${tightenedBody}</div></section>`;
  }

  return `<details style="${style}"${open ? ' open' : ''}><summary style="${LAYER_SUMMARY_STYLE}"><div style="${LAYER_SUMMARY_COPY_STYLE}"><div style="${CARD_TITLE_STYLE};margin:0;">${title}</div></div><span style="${LAYER_CHEVRON_STYLE}">Expand</span></summary><div style="margin-top:18px;">${tightenedBody}</div></details>`;
}

function extractHtmlListItems(value?: string): string[] {
  if (!value) return [];
  return [...value.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtmlTags(match[1] || ''))
    .filter(Boolean);
}

function extractDependencyHeadingLabels(value?: string): string[] {
  if (!value) return [];
  return [...value.matchAll(/<b>([\s\S]*?)<\/b><br>/gi)]
    .map((match) => stripHtmlTags(match[1] || ''))
    .filter((item) => item && !isLowValuePlaceholder(item));
}

function extractTriageSectionItems(value: string | undefined, heading: string): string[] {
  if (!value) return [];
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<b>${escaped}</b><br><ul>([\\s\\S]*?)<\\/ul>`, 'i');
  const match = value.match(pattern);
  return match ? extractHtmlListItems(match[1]) : [];
}

function extractTriageSectionItemsAny(value: string | undefined, headings: string[]): string[] {
  return headings.flatMap((heading) => extractTriageSectionItems(value, heading));
}

function normalizePanelSentence(value?: string): string {
  const cleaned = String(value || '').replace(/\s+/g, ' ').trim().replace(/[ .]+$/, '');
  return cleaned ? `${cleaned}.` : '';
}

function panelSentenceKey(value?: string): string {
  const normalized = normalizePanelSentence(value);
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function dedupePanelSentences(items: string[]): string[] {
  const ordered: string[] = [];
  const keys: string[] = [];
  for (const item of items) {
    const normalized = normalizePanelSentence(item);
    const key = panelSentenceKey(item);
    if (!normalized || !key) continue;
    if (keys.some((existing) => key === existing || existing.includes(key))) continue;
    const replaceIndex = keys.findIndex((existing) => key.includes(existing));
    if (replaceIndex >= 0) {
      keys[replaceIndex] = key;
      ordered[replaceIndex] = normalized;
      continue;
    }
    keys.push(key);
    ordered.push(normalized);
  }
  return ordered;
}

function summarizePanelItems(items: string[], limit = 3): string {
  const uniqueItems = Array.from(new Set(items.filter(Boolean)));
  if (!uniqueItems.length) return '';
  const visible = uniqueItems.slice(0, limit);
  const remaining = uniqueItems.length - visible.length;
  return remaining > 0 ? `${visible.join('; ')}; +${remaining} more` : visible.join('; ');
}

function normalizeConfirmationLabel(value: string): string {
  let text = stripHtmlTags(value || '').replace(/\.$/, '').trim();
  if (!text) return '';
  const lowered = text.toLowerCase();
  const replacements: Record<string, string> = {
    'credential remediation open -> blocks execution': 'Credential remediation',
    'target logging account not approved -> blocks execution': 'Logging account',
    'target logging account': 'Logging account',
    'destination bucket or log store not approved -> blocks execution': 'Destination bucket',
    'destination bucket / log store': 'Destination bucket',
    's3 destination bucket': 'Destination bucket',
    'iam access model not approved -> blocks execution': 'IAM model',
    'iam access model': 'IAM model',
    'cross-account iam role': 'IAM model',
    'retention and lifecycle requirements not defined -> block execution': 'Retention',
    'security owner is not identified': 'Security owner',
    'security owner not identified': 'Security owner',
    'siem integration target': 'Security Lake or SIEM integration target',
    'siem / security lake integration': 'Security Lake or SIEM integration target',
    'security lake / siem integration': 'Security Lake or SIEM integration target',
  };
  if (replacements[lowered]) return replacements[lowered];
  if (
    LOW_VALUE_PLACEHOLDERS.has(lowered)
  ) {
    return '';
  }
  if (text.includes('->')) text = text.split('->', 1)[0].trim();
  text = text.replace(/^(confirm|approve|define|identify|resolve)\s+(whether\s+|which\s+|the\s+)?/i, '');
  text = text.replace(/\b(is|are)\s+(approved|defined|confirmed|identified|complete|resolved)\b.*$/i, '');
  text = text.replace(/\bbefore\b.*$/i, '');
  text = text.replace(/\bso\b.*$/i, '');
  text = text.replace(
    'cross-account IAM role and access path required for implementation and validation',
    'IAM model'
  );
  text = text.replace('which account owns the centralized log destination', 'Logging account');
  text = text.replace('destination bucket or log store', 'Destination bucket');
  text = text.trim().replace(/[.,:;]+$/, '');
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : '';
}

function confirmationLabelKey(value: string): string {
  const normalized = normalizeConfirmationLabel(value);
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function dedupeConfirmationLabels(items: string[], excludeKeys: Set<string> = new Set()): string[] {
  const seen = new Set(excludeKeys);
  const ordered: string[] = [];
  for (const item of items) {
    const label = normalizeConfirmationLabel(item);
    const key = confirmationLabelKey(label);
    if (!label || !key || seen.has(key)) continue;
    seen.add(key);
    ordered.push(label);
  }
  return ordered;
}

function collectExecutionConfirmationItems(triage?: string, dependencies?: string): string[] {
  return dedupeConfirmationLabels([
    ...extractTriageSectionItemsAny(triage, ['Needed Soon', 'Needed Before Execution']),
    ...extractDependencyHeadingLabels(dependencies),
  ]).slice(0, 5);
}

function collectBlockedPanelItems(blockers?: string, triage?: string): string[] {
  const triageItems = Array.from(
    new Set([
      ...extractTriageSectionItemsAny(triage, ['Blockers', 'Blocked Now']),
    ])
  );
  if (triageItems.length) return triageItems;
  return dedupeConfirmationLabels(extractHtmlListItems(blockers));
}

function renderExecutionConfirmationSummary(
  blockers?: string,
  triage?: string,
  dependencies?: string
): string {
  const items = collectExecutionConfirmationItems(triage, dependencies);
  if (!items.length) return '';
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function rewriteExecutionControlPanelBlockedLine(
  body: string,
  blockers?: string,
  triage?: string
): string {
  if (!body) return '';
  const blockedLine = summarizePanelItems(collectBlockedPanelItems(blockers, triage));
  if (!blockedLine) return body;
  if (/Blocked -&gt; .*?<br>/i.test(body)) {
    return body.replace(/Blocked -&gt; .*?<br>/i, `Blocked -&gt; ${blockedLine}<br>`);
  }
  return body;
}

function removeExecutionControlPanelConfirmLine(body: string): string {
  if (!body) return '';
  return body.replace(/Confirm -&gt; .*?<br>/i, '');
}

function removeExecutionControlPanelRiskLines(body: string): string {
  if (!body) return '';
  return body
    .replace(/Risk -&gt; .*?<br>/gi, '')
    .replace(/Impact -&gt; .*?<br>/gi, '');
}

function extractExecutionControlPanelLines(body: string | undefined, label: 'Risk' | 'Impact'): string {
  if (!body) return '';
  const pattern = new RegExp(`${label} -&gt; (.*?)(?:<br>|$)`, 'gi');
  const items = [...body.matchAll(pattern)]
    .map((match) => (match[1] || '').trim())
    .filter(Boolean);
  if (!items.length) return '';
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function removeLegacyParallelWorkFiller(body: string): string {
  if (!body) return '';
  return body
    .replace(/(?:\s+and)?\s*planning, dependency analysis, and other non-production preparation\.\s*/gi, ' ')
    .replace(/;\s*<br>/gi, '<br>')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function rewriteExecutionControlPanelCanProceedLine(body: string): string {
  if (!body) return '';
  const match = body.match(/Can proceed now -&gt; (.*?<br>)/i);
  if (!match) return body;
  const rawValue = match[1].slice(0, -4);
  const items = dedupePanelSentences(rawValue.split(';').map((item) => item.trim()).filter(Boolean));
  if (!items.length) return body.replace(/Can proceed now -&gt; .*?<br>/i, '');
  return body.replace(/Can proceed now -&gt; .*?<br>/i, `Can proceed now -&gt; ${items.join(' ')}<br>`);
}

function renderExecutionConstraints(
  blockers?: string,
  triage?: string,
  dependencies?: string
): string {
  const triageBlockedNow = Array.from(
    new Set([
      ...extractTriageSectionItemsAny(triage, ['Blockers', 'Blocked Now']),
    ])
  );
  const blockedNow = triageBlockedNow.length
    ? triageBlockedNow
    : dedupeConfirmationLabels(extractHtmlListItems(blockers));
  const blockedNowKeys = new Set(blockedNow.map((item) => confirmationLabelKey(item)).filter(Boolean));
  const neededBefore = dedupeConfirmationLabels(
    [
      ...extractTriageSectionItemsAny(triage, ['Needed Soon', 'Needed Before Execution']),
      ...extractDependencyHeadingLabels(dependencies),
    ],
    blockedNowKeys
  );
  const clarifiedLater = dedupeConfirmationLabels(
    extractTriageSectionItemsAny(triage, ['Later', 'Can Be Clarified Later']),
    new Set([...blockedNowKeys, ...neededBefore.map((item) => confirmationLabelKey(item)).filter(Boolean)])
  );

  const groups: Array<[string, string[]]> = [
    ['Blockers', blockedNow],
    ['Needed Soon', neededBefore],
    ['Later', clarifiedLater],
  ];

  return groups
    .map(([title, items]) => {
      const values = items.filter((item) => !isLowValuePlaceholder(item));
      if (!values.length) return '';
      const list = values.map((item) => `<li>${item}</li>`).join('');
      return `<b>${title}</b><br><ul>${list}</ul>`;
    })
    .filter(Boolean)
    .join('<br>');
}

function extractCardBodiesFromHtml(input: string): Map<string, string> {
  const bodies = new Map<string, string>();
  const divPattern =
    /<div[^>]*>\s*<div[^>]*>([^<]+)<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  for (const match of input.matchAll(divPattern)) {
    const heading = match[1]?.trim();
    const body = match[2]?.trim();
    if (heading && body) bodies.set(heading, body);
  }

  const detailsPattern = /<details[^>]*>\s*<summary[\s\S]*?<div[^>]*>\s*<div[^>]*>([^<]+)<\/div>\s*<\/div>[\s\S]*?<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/details>/gi;
  for (const match of input.matchAll(detailsPattern)) {
    const heading = match[1]?.trim();
    const body = match[2]?.trim();
    if (heading && body) bodies.set(heading, body);
  }
  return bodies;
}

function extractExecutiveCardParts(card: HTMLElement): [string, string] | null {
  if (card.tagName === 'DETAILS') {
    const summary = card.querySelector('summary');
    const title = summary
      ? Array.from(summary.querySelectorAll('div'))
          .map((node) => node.textContent?.trim() || '')
          .find((value) => EXECUTIVE_HEADINGS.has(value))
      : '';
    const body = Array.from(card.children)
      .find((child) => child instanceof HTMLElement && child.tagName !== 'SUMMARY')
      ?.innerHTML?.trim();
    return title && body ? [title, body] : null;
  }

  const title = card.firstElementChild?.textContent?.trim() || '';
  const body = card.children.item(1)?.innerHTML?.trim() || '';
  return title && body ? [title, body] : null;
}

function splitLabeledPanelSections(sectionHtml?: string): Array<[string, string]> {
  if (!sectionHtml) return [];
  return [...sectionHtml.matchAll(/<b>([^<]+):<\/b><br>([\s\S]*?)(?=(?:<br><br><b>[^<]+:<\/b><br>)|$)/gi)]
    .map((match) => [stripHtmlTags(match[1] || '').trim(), (match[2] || '').replace(/(?:<br>\s*)+$/i, '').trim()] as [string, string])
    .filter(([label, body]) => Boolean(label && body));
}

function renderSplitTrackBody(sectionHtml?: string): string {
  const labeledSections = splitLabeledPanelSections(sectionHtml);
  if (!labeledSections.length) return tightenDecisionSupportLanguage(sectionHtml);

  const fields = new Map(labeledSections.map(([label, body]) => [label.toLowerCase(), body]));
  const pills = renderExecutivePillRow([
    ['Title', fields.get('title')],
    ['Priority', fields.get('priority')],
    ['Type', fields.get('type')],
  ]);
  const body = labeledSections
    .filter(([label]) => !['title', 'priority', 'type'].includes(label.toLowerCase()))
    .map(([label, value]) => renderExecutiveSubsection(label, value))
    .join('');
  return `${pills}${body}` || tightenDecisionSupportLanguage(sectionHtml);
}

function renderMainTaskBody(bodies: Map<string, string>): string {
  const pills = renderExecutivePillRow([
    ['Title', bodies.get('5. Main Task Title')],
    ['Issue Type', bodies.get('6. Ticket Type & Justification')],
  ]);

  const sections = [
    renderRequiredExecutiveSubsection('Title / Summary', bodies.get('5. Main Task Title')),
    renderRequiredExecutiveSubsection('Description', bodies.get('10. Structured Description')),
    renderRequiredExecutiveSubsection('Issue Type', bodies.get('6. Ticket Type & Justification')),
  ].join('');

  return `${pills}${sections}`;
}

function renderExecutionDetailsBody(bodies: Map<string, string>): string {
  return [
    renderRequiredExecutiveSubsection('Acceptance Criteria', bodies.get('17. Acceptance Criteria')),
    renderRequiredExecutiveSubsection(
      'Steps / Technical Details',
      [
        renderExecutiveSubsection('Steps', bodies.get('15. Implementation Sequence')),
        renderExecutiveSubsection('Technical Details', bodies.get('11. Technical Scope')),
      ].join('')
    ),
  ].join('');
}

function renderDependenciesPlanningBody(bodies: Map<string, string>): string {
  return [
    renderRequiredExecutiveSubsection('Dependencies / Linked Issues', bodies.get('16. Dependencies')),
    renderRequiredExecutiveSubsection('Due Date / Target Date', bodies.get('Due Date / Target Date')),
  ].join('');
}

function firstBody(bodies: Map<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = bodies.get(key);
    if (value && !isLowValuePlaceholder(value)) return value;
  }
  return undefined;
}

function rebuildExecutiveGridFromCards(
  bodies: Map<string, string>,
  options: NormalizeTicketFormattedOutputOptions = {}
): string {
  const hasSplitTracks =
    bodies.has('2. Security Remediation Ticket') && bodies.has('3. Main Implementation Ticket');
  const workstreamTitle = hasSplitTracks ? 'Story / Linked Critical Task' : 'Main Task';
  const identityTitle = hasSplitTracks ? workstreamTitle : 'Identity (What is this work?)';
  const identityBody = bodies.get(identityTitle) || (hasSplitTracks
    ? [
        renderExecutiveSubsection('Security Track', renderSplitTrackBody(bodies.get('2. Security Remediation Ticket'))),
        renderExecutiveSubsection('Implementation Track', renderSplitTrackBody(bodies.get('3. Main Implementation Ticket'))),
        renderExecutiveSubsection('Decision Rule', bodies.get('4. Relationship')),
      ].join('')
    : renderMainTaskBody(bodies));
  const executionDetailsBody =
    firstBody(bodies, 'Execution Details (What does done mean?)') || renderExecutionDetailsBody(bodies);
  const dependenciesPlanningBody =
    firstBody(bodies, 'Dependencies & Planning (What does this rely on?)') || renderDependenciesPlanningBody(bodies);

  const boxEntries = [
    [
      'Ticket Quality Check',
      renderExecutiveLayer(
        'Ticket Quality Check',
        rewriteExecutionControlPanelCanProceedLine(
          rewriteExecutionControlPanelBlockedLine(
            removeLegacyParallelWorkFiller(
              removeExecutionControlPanelRiskLines(
                removeExecutionControlPanelConfirmLine(firstBody(bodies, '0. Execution Control Panel', 'Execution Control Panel') || '')
              )
            ),
            firstBody(bodies, '12. Blockers', 'Blockers'),
            firstBody(bodies, '13. Missing Information Triage', 'Missing Information Triage')
          )
        ),
        { collapsible: false }
      ),
    ],
    [
      identityTitle,
      renderExecutiveLayer(
        identityTitle,
        identityBody,
        { collapsible: false }
      ),
    ],
    [
      'Execution Details (What does done mean?)',
      renderExecutiveLayer(
        'Execution Details (What does done mean?)',
        executionDetailsBody,
        { collapsible: true, open: true }
      ),
    ],
    [
      'Dependencies & Planning (What does this rely on?)',
      renderExecutiveLayer(
        'Dependencies & Planning (What does this rely on?)',
        dependenciesPlanningBody,
        { collapsible: true, open: true }
      ),
    ],
    [
      'Execution Constraints',
      renderExecutiveLayer(
        'Execution Constraints',
        renderExecutionConstraints(
          firstBody(bodies, '12. Blockers', 'Blockers'),
          firstBody(bodies, '13. Missing Information Triage', 'Missing Information Triage'),
          bodies.get('16. Dependencies')
        ),
        { collapsible: false }
      ),
    ],
    [
      'Readiness Status',
      renderExecutiveLayer(
        'Readiness Status',
        firstBody(bodies, '1. Readiness Status', 'Readiness Status') || '',
        { collapsible: true }
      ),
    ],
    [
      'Safe Actions Allowed Now',
      renderExecutiveLayer(
        'Safe Actions Allowed Now',
        firstBody(bodies, '14. Safe To Start Now', 'Can Proceed Now') || '',
        { collapsible: true }
      ),
    ],
    [
      'PM Decisions Needed',
      renderExecutiveLayer(
        'PM Decisions Needed',
        [
          renderExecutiveSubsection('Decide Before Start', firstBody(bodies, '18. PM Required Confirmations', 'PM Decisions Needed')),
          renderExecutiveSubsection('Resolve Soon', firstBody(bodies, '19. PM Follow-Up Questions', 'Resolve Soon')),
        ].join(''),
        { collapsible: true }
      ),
    ],
    [
      'Effort & Confidence',
      renderExecutiveLayer(
        'Effort & Confidence',
        [
          renderExecutiveSubsection('Resourcing', firstBody(bodies, '20. Effort Estimate', 'Effort')),
          renderExecutiveSubsection('Confidence', firstBody(bodies, '21. Section Confidence', 'Confidence')),
        ].join(''),
        { collapsible: true }
      ),
    ],
    [
      'Risks / Assumptions',
      renderExecutiveLayer(
        'Risks / Assumptions',
        [
          renderExecutiveSubsection(
            'Risks',
            dedupeHtmlListItems(
              firstBody(bodies, '23. Risks (If Assumptions Incorrect)', 'Risks') ||
                extractExecutionControlPanelLines(firstBody(bodies, '0. Execution Control Panel', 'Execution Control Panel'), 'Risk')
            )
          ),
          renderExecutiveSubsection('Assumptions', firstBody(bodies, '22. Assumptions', 'Assumptions')),
        ].join(''),
        { collapsible: true }
      ),
    ],
    [
      'Reference',
      renderExecutiveLayer(
        'Reference',
        [
          renderExecutiveSubsection('Sensitive Data', firstBody(bodies, '8. Sensitive Data Detected', 'Sensitive Data')),
          renderExecutiveSubsection('Critical Security Task', firstBody(bodies, '9. Critical Security Task', 'Critical Security Task', 'Security Track')),
          renderExecutiveSubsection('PM Translation', firstBody(bodies, '24. Non-Technical Explanation', 'Explain To PM')),
        ].join(''),
        { collapsible: true }
      ),
    ],
  ] as Array<[string, string]>;

  const boxes = boxEntries
    .filter(([title]) => !options.blockedOnly || BLOCKED_TICKET_HEADINGS.has(title))
    .map(([, html]) => html)
    .filter(Boolean);

  return boxes.length ? `<div data-ticket-boxes="true" style="${STACK_STYLE}">${boxes.join('')}</div>` : '';
}

function hasExistingExecutiveHeadings(bodies: Map<string, string>): boolean {
  return Array.from(bodies.keys()).some((heading) => EXECUTIVE_HEADINGS.has(heading));
}

function rebuildBlockedGridFromExistingExecutiveBodies(bodies: Map<string, string>): string {
  const boxes = Array.from(BLOCKED_TICKET_HEADINGS)
    .map((title) => renderExecutiveLayer(title, bodies.get(title) || '', { collapsible: false }))
    .filter(Boolean);
  return boxes.length ? `<div data-ticket-boxes="true" style="${STACK_STYLE}">${boxes.join('')}</div>` : '';
}

function removeRawSection(input: string, marker: string): string {
  if (!input.includes(marker)) return input;

  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:<hr><br>)?${escapedMarker}[\\s\\S]*?(?=(?:<hr><br><b>)|$)`, 'i');
  return input.replace(pattern, '').replace(/(?:<hr><br>\s*){2,}/gi, '<hr><br>').trim();
}

function removeOrganizedCard(input: string, heading: string): string {
  if (!input.includes(heading)) return input;

  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `<div style="[^"]*">\\s*<div style="[^"]*">${escapedHeading}</div>\\s*<div style="[^"]*">[\\s\\S]*?</div>\\s*</div>`,
    'i'
  );
  return input.replace(pattern, '').trim();
}

export function normalizeTicketFormattedOutput(
  input?: string | null,
  options: NormalizeTicketFormattedOutputOptions = {}
): string {
  if (!input) return '';

  let output = rewriteLimitedProceedPanelText(input);

  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    if (output.includes('data-ticket-boxes="true"')) {
      const bodies = extractCardBodiesFromHtml(output);
      if (options.blockedOnly && hasExistingExecutiveHeadings(bodies)) {
        const rebuiltExisting = rebuildBlockedGridFromExistingExecutiveBodies(bodies);
        if (rebuiltExisting) return rebuiltExisting;
      }
      const rebuilt = rebuildExecutiveGridFromCards(bodies, options);
      if (rebuilt) return rebuilt;
    }
    if (output.includes('2. Security Remediation Ticket') && output.includes('3. Main Implementation Ticket')) {
      output = removeOrganizedCard(output, '7. Priority');
    }
    if (output.includes('3. Main Implementation Ticket')) {
      output = removeOrganizedCard(output, '5. Main Task Title');
    }
    if (output.includes('2. Security Remediation Ticket')) {
      output = removeOrganizedCard(output, '9. Critical Security Task');
    }
    if (output.includes(RAW_SECTION_MARKERS.securityRemediation) && output.includes(RAW_SECTION_MARKERS.implementationTicket)) {
      output = removeRawSection(output, RAW_SECTION_MARKERS.priority);
    }
    if (output.includes(RAW_SECTION_MARKERS.implementationTicket)) {
      output = removeRawSection(output, RAW_SECTION_MARKERS.mainTaskTitle);
    }
    if (output.includes(RAW_SECTION_MARKERS.securityRemediation)) {
      output = removeRawSection(output, RAW_SECTION_MARKERS.criticalSecurityTask);
    }
    return output;
  }

  const container = window.document.createElement('div');
  container.innerHTML = output;

  const grid = container.querySelector('[data-ticket-boxes="true"]');
  if (grid) {
    const cards = Array.from(grid.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
    const bodies = new Map<string, string>();
    for (const card of cards) {
      const parts = extractExecutiveCardParts(card);
      if (parts) bodies.set(parts[0], parts[1]);
    }
    const headingList = Array.from(bodies.keys());
    const headings = new Set(headingList);
    const hasExecutiveHeadings = headingList.some((heading) => EXECUTIVE_HEADINGS.has(heading));

    if (options.blockedOnly && hasExecutiveHeadings) {
      for (const card of cards) {
        const heading = extractExecutiveCardParts(card)?.[0] || '';
        if (!BLOCKED_TICKET_HEADINGS.has(heading)) {
          card.remove();
        }
      }
      return container.innerHTML;
    }

    if (bodies.size) {
      const rebuilt = rebuildExecutiveGridFromCards(bodies, options);
      if (rebuilt) return rebuilt;
    }

    for (const card of cards) {
      const heading = extractExecutiveCardParts(card)?.[0] || '';
      if (heading === '7. Priority' && headings.has('2. Security Remediation Ticket') && headings.has('3. Main Implementation Ticket')) {
        card.remove();
      }
      if (heading === '5. Main Task Title' && headings.has('3. Main Implementation Ticket')) {
        card.remove();
      }
      if (heading === '9. Critical Security Task' && headings.has('2. Security Remediation Ticket')) {
        card.remove();
      }
    }

    return container.innerHTML;
  }

  if (output.includes(RAW_SECTION_MARKERS.securityRemediation) && output.includes(RAW_SECTION_MARKERS.implementationTicket)) {
    output = removeRawSection(output, RAW_SECTION_MARKERS.priority);
  }
  if (output.includes(RAW_SECTION_MARKERS.implementationTicket)) {
    output = removeRawSection(output, RAW_SECTION_MARKERS.mainTaskTitle);
  }
  if (output.includes(RAW_SECTION_MARKERS.securityRemediation)) {
    output = removeRawSection(output, RAW_SECTION_MARKERS.criticalSecurityTask);
  }
  return output;
}
