import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SavedClient } from '@/app/saved/SavedClient';

const entries = Array.from({ length: 25 }, (_, index) => ({
  slug: `org-${index + 1}`,
  name: `Organisation ${index + 1}`,
}));

describe('SavedClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recovers from corrupt saved data and explains the reset', async () => {
    localStorage.setItem('saved-entries', 'not-json');
    render(<SavedClient entries={entries} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('unreadable');
    expect(localStorage.getItem('saved-entries')).toBeNull();
  });

  it('shows entry names rather than raw slugs', async () => {
    localStorage.setItem('saved-entries', JSON.stringify(['org-1']));
    render(<SavedClient entries={entries} />);
    expect(await screen.findByText('Organisation 1')).toBeInTheDocument();
  });

  it('paginates long saved lists', async () => {
    localStorage.setItem('saved-entries', JSON.stringify(entries.map((entry) => entry.slug)));
    render(<SavedClient entries={entries} />);
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Organisation 21')).not.toBeInTheDocument();
  });
});
