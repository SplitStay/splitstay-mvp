import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EventLandingPage } from './EventLandingPage';

function renderWithRoute(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/events/${slug}`]}>
      <Routes>
        <Route path="/events/:slug" element={<EventLandingPage />} />
        <Route path="/" element={<div data-testid="homepage">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EventLandingPage', () => {
  it('should render the event headline and CTA for a valid slug', () => {
    renderWithRoute('all-things-go');

    expect(
      screen.getByText("POV: You're going to All Things Go… alone."),
    ).toBeInTheDocument();
    const ctaLinks = screen.getAllByRole('link', {
      name: /find your festival friend/i,
    });
    expect(ctaLinks.length).toBeGreaterThan(0);
  });

  it('should redirect to homepage for an unknown slug', () => {
    renderWithRoute('nonexistent-event');

    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });

  it('should render how-it-works steps when present', () => {
    renderWithRoute('all-things-go');

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Create a profile')).toBeInTheDocument();
    expect(screen.getByText('See who else is going')).toBeInTheDocument();
  });

  it('should render bullet lists when present', () => {
    renderWithRoute('podcast-movement');

    expect(screen.getByText('Grab coffee before sessions')).toBeInTheDocument();
    expect(screen.getByText('Attend talks together')).toBeInTheDocument();
  });

  it('should set the document title from SEO config', () => {
    renderWithRoute('all-things-go');

    expect(document.title).toBe('All Things Go Festival | SplitStay');
  });

  it('should not render broken images when imagePath is not configured', () => {
    renderWithRoute('all-things-go');

    const images = screen.queryAllByRole('img');
    for (const img of images) {
      const src = img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  it('should set meta description from SEO config', () => {
    renderWithRoute('all-things-go');

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe(
      'Going to All Things Go alone? Find someone else going. Create a profile, see who else is attending, and start a chat before the festival.',
    );
  });

  it('should link CTAs to the WhatsApp redirect path', () => {
    renderWithRoute('all-things-go');

    const ctaLinks = screen.getAllByRole('link', {
      name: /find your festival friend/i,
    });
    for (const link of ctaLinks) {
      expect(link).toHaveAttribute('href', '/go/all-things-go');
    }
  });
});
