import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Mission } from '@/components/Mission';

describe('Mission', () => {
  it('states the mission and the funding and privacy pledge', () => {
    render(<Mission name="NZ Tech-for-Good" country="Aotearoa New Zealand" />);

    expect(screen.getByRole('heading', { name: 'Mission' })).toBeInTheDocument();
    expect(screen.getByText(/NZ Tech-for-Good exists/)).toBeInTheDocument();
    expect(
      screen.getByText('Volunteer-run. No ads or tracking. Not monetised.')
    ).toBeInTheDocument();
  });
});
