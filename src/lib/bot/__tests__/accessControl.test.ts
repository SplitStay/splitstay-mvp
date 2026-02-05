import { describe, expect, it } from 'vitest';
import { createAccessControl } from '../accessControl';

describe('createAccessControl', () => {
  it('returns true for a phone number in the admin list', () => {
    const ac = createAccessControl('whatsapp:+1234567890,whatsapp:+0987654321');

    expect(ac.isAdmin('whatsapp:+1234567890')).toBe(true);
  });

  it('returns false for a phone number not in the admin list', () => {
    const ac = createAccessControl('whatsapp:+1234567890');

    expect(ac.isAdmin('whatsapp:+9999999999')).toBe(false);
  });

  it('handles whitespace around phone numbers', () => {
    const ac = createAccessControl(
      ' whatsapp:+1234567890 , whatsapp:+0987654321 ',
    );

    expect(ac.isAdmin('whatsapp:+1234567890')).toBe(true);
    expect(ac.isAdmin('whatsapp:+0987654321')).toBe(true);
  });

  it('handles empty admin list', () => {
    const ac = createAccessControl('');

    expect(ac.isAdmin('whatsapp:+1234567890')).toBe(false);
  });
});
