// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FounderStoryPage, { metadata } from './page';

describe('Founder Story page', () => {
  it('uses the existing authentic photograph and the approved full founder name and title', () => {
    render(<FounderStoryPage />);
    const portrait = screen.getByRole('img', { name: 'Lavanya Nallamshetty, founder of LucidSpec' });
    expect(decodeURIComponent(portrait.getAttribute('src') || '')).toContain('/images/FounderPic.png');
    const caption = screen.getByRole('figure', { name: 'LucidSpec founder' });
    expect(within(caption).getByText('Lavanya Nallamshetty')).toBeInTheDocument();
    expect(within(caption).getByText('Founder, LucidSpec')).toBeInTheDocument();
    expect(screen.queryByText(/lnallamshetty|Founder & CEO/i)).not.toBeInTheDocument();
  });

  it('retains the existing professional background in four connected editorial sections', () => {
    render(<FounderStoryPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('I built LucidSpec because too much engineering work starts without enough clarity.');
    const story = screen.getByRole('region', { name: 'The founder story' });
    expect(within(story).getAllByRole('listitem')).toHaveLength(4);
    for (const name of ['The problem I kept seeing', 'The turning point', 'Building LucidSpec', 'Looking ahead']) {
      expect(within(story).getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/As a Senior IT Project Manager leading cloud and infrastructure programs/)).toBeInTheDocument();
    expect(screen.queryByText(/change-safety gate that runs in Slack|No self-serve signup|Every flag comes with a verified quote/)).not.toBeInTheDocument();
  });

  it('shows the founder-approved quote and official member badge without endorsement claims', () => {
    render(<FounderStoryPage />);
    expect(screen.getByRole('blockquote')).toHaveTextContent('A completed ticket doesn’t always mean the work is ready. LucidSpec is about finding the gaps earlier, while there’s still time to clarify them.');
    const membership = screen.getByRole('region', { name: 'NVIDIA Inception Program' });
    expect(within(membership).getByText('LucidSpec LLC is a member of the NVIDIA Inception Program.')).toBeInTheDocument();
    expect(within(membership).getByRole('img', { name: 'NVIDIA Inception Program member badge' })).toHaveAttribute('src', '/images/nvidia-inception-program-badge.svg');
    expect(within(membership).queryByText(/endorsed|investment|partnership/i)).not.toBeInTheDocument();
  });

  it('preserves the founder URL, working contact CTA and shared homepage footer', () => {
    render(<FounderStoryPage />);
    expect(screen.getByRole('link', { name: 'Request a Demo' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('heading', { name: "Let's talk about your engineering workflows." })).toBeInTheDocument();
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Founder Story' })).toHaveAttribute('href', '/founder');
    expect(metadata.title).toBe('Founder Story – LucidSpec');
    expect(metadata.openGraph).toMatchObject({ url: '/founder' });
    expect(metadata.description).toContain('Lavanya Nallamshetty');
    expect(document.getElementById('founder-content')).toHaveAttribute('tabindex', '-1');
  });
});
