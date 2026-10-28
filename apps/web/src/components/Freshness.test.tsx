import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import { Freshness } from '@/components/Freshness';

describe('Freshness', () => {
  it('does not show a negative age for a future verification date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T00:00:00Z'));
    render(<Freshness date="2027-01-01" />);
    expect(screen.getByText('This week')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows an absolute date during server rendering', () => {
    const html = renderToString(<Freshness date="2026-08-01" />);
    expect(html).toContain('Verified');
    expect(html).toContain('2026-08-01');
  });
});
