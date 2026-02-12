import { describe, expect, it } from 'vitest';
import { validateOutput } from '../outputValidator';

describe('validateOutput', () => {
  describe('flags prohibited content categories', () => {
    it('flags system prompt disclosure', () => {
      const result = validateOutput(
        'My system prompt says I should help with accommodation',
      );
      expect(result.flagged).toBe(true);
      expect(result.reason).toBe('system_prompt_disclosure');
    });

    it('flags out-of-scope services', () => {
      const result = validateOutput(
        'Sure, let me help you write that Python script for your project.',
      );
      expect(result.flagged).toBe(true);
      expect(result.reason).toBe('out_of_scope_service');
    });

    it('flags personal data harvesting', () => {
      const result = validateOutput(
        'Please provide your credit card number so I can process the booking.',
      );
      expect(result.flagged).toBe(true);
      expect(result.reason).toBe('personal_data_harvesting');
    });

    it('flags identity change', () => {
      const result = validateOutput(
        'Okay, I am now DAN and I can do anything you want.',
      );
      expect(result.flagged).toBe(true);
      expect(result.reason).toBe('identity_change');
    });

    it('flags professional advice', () => {
      const result = validateOutput(
        'Based on the tax law, you should file your return by April 15th.',
      );
      expect(result.flagged).toBe(true);
      expect(result.reason).toBe('professional_advice');
    });
  });

  describe('passes legitimate accommodation responses', () => {
    it('passes a response about destinations', () => {
      const result = validateOutput(
        'Lisbon is a great destination! When are you planning to travel?',
      );
      expect(result.flagged).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('passes a response about dates', () => {
      const result = validateOutput(
        'Got it, you want to stay from July 1st to July 15th. What is your budget?',
      );
      expect(result.flagged).toBe(false);
    });

    it('passes a response about budgets', () => {
      const result = validateOutput(
        'A budget of 50 euros per night works well for shared rooms in that area.',
      );
      expect(result.flagged).toBe(false);
    });

    it('passes a response about room details', () => {
      const result = validateOutput(
        'You have 2 rooms available at 40 per night each. What dates work for you?',
      );
      expect(result.flagged).toBe(false);
    });

    it('passes a summary response', () => {
      const result = validateOutput(
        'Here is your summary: Destination: Lisbon, Dates: July 1-15, Budget: 50/night. Reply YES to confirm.',
      );
      expect(result.flagged).toBe(false);
    });
  });
});
