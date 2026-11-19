import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders footer content', () => {
    render(<Footer />);
    expect(screen.getByText('NZ Tech-for-Good')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  

});

  it('has links to key pages', () => {
    render(<Footer />);
    expect(screen.getAllByText('Directory').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Stats').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('GitHub').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  it('shows data export links', () => {
    render(<Footer />);
    expect(screen.getAllByText('JSON Export').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CSV Export').length).toBeGreaterThanOrEqual(1);
  });

  it('gives every footer link a 24px target', () => {
    const { container } = render(<Footer />);
    const links = Array.from(container.querySelectorAll('footer ul a'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.className).toContain('min-h-6');
    }
  });
});
