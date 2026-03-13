import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WhatsAppLandingPage } from './WhatsAppLandingPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/whatsapp']}>
      <WhatsAppLandingPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppLandingPage', () => {
  it('should explain the bot matches travelers by destination and dates to share accommodation', () => {
    renderPage();

    expect(
      screen.getByText(/match.*travelers/i, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/share accommodation/i).length).toBeGreaterThan(
      0,
    );
  });

  it('should show a step-by-step explanation of how the bot works', () => {
    renderPage();

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    expect(screen.getByText('Share your travel plans')).toBeInTheDocument();
    expect(screen.getByText('Get matched')).toBeInTheDocument();
  });

  it('should communicate that conversations are user-initiated with no marketing messages', () => {
    renderPage();

    expect(
      screen.getByText(/you start the conversation/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no automated marketing messages/i, { exact: false }),
    ).toBeInTheDocument();
  });

  it('should explain what data is collected and link to the privacy policy', () => {
    renderPage();

    expect(
      screen.getByText(/destination.*travel dates/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/used solely/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy');
  });

  it('should link to the WhatsApp chat', () => {
    renderPage();

    const ctaLink = screen.getByRole('link', {
      name: /message us on whatsapp/i,
    });
    expect(ctaLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('should link back to the main site', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
