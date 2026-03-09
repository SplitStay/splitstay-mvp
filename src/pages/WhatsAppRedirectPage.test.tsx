import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppRedirectPage } from './WhatsAppRedirectPage';

const originalLocation = window.location;

function renderWithRoute(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/go/${slug}`]}>
      <Routes>
        <Route path="/go/:slug" element={<WhatsAppRedirectPage />} />
        <Route path="/" element={<div data-testid="homepage">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WhatsAppRedirectPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should redirect to wa.me with encoded message when number is configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '15551234567');

    const replaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, replace: replaceMock },
      writable: true,
    });

    renderWithRoute('all-things-go');

    expect(replaceMock).toHaveBeenCalledWith(
      "https://wa.me/15551234567?text=Hi!%20I'm%20going%20to%20All%20Things%20Go",
    );
  });

  it('should show coming soon message when number is not configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '');

    renderWithRoute('all-things-go');

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('should redirect to homepage for an unknown slug', () => {
    renderWithRoute('nonexistent-event');

    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });
});
