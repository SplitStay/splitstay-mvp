export type FlagReason =
  | 'system_prompt_disclosure'
  | 'out_of_scope_service'
  | 'personal_data_harvesting'
  | 'identity_change'
  | 'professional_advice';

export type InputFlagReason = 'prompt_injection' | 'system_prompt_extraction';

export type ValidationResult =
  | { flagged: false }
  | { flagged: true; reason: FlagReason | InputFlagReason };

const FLAG_PATTERNS: ReadonlyArray<{ reason: FlagReason; pattern: RegExp }> = [
  {
    reason: 'system_prompt_disclosure',
    pattern:
      /\b(my (system )?prompt|my instructions|I was (told|instructed|programmed) to|my (internal|hidden) (rules|instructions|configuration))\b/i,
  },
  {
    reason: 'identity_change',
    pattern:
      /\b(I am now (?!the splitstay)|I('m| am) no longer the splitstay|my new (role|identity|name) is|I('ll| will) pretend to be)\b/i,
  },
  {
    reason: 'personal_data_harvesting',
    pattern:
      /\b(credit card|social security|passport number|bank account|CVV|PIN number|routing number)\b/i,
  },
  {
    reason: 'professional_advice',
    pattern:
      /\b(based on (the |current )?(law|tax law|legal|medical|financial)|legal(ly)? (you should|obligated|required)|diagnos(e|is)|prescri(be|ption)|tax (return|filing|deduction))\b/i,
  },
  {
    reason: 'out_of_scope_service',
    pattern:
      /\b(let me help you (write|code|build|create|debug)|here('s| is) (the|your|a) (code|script|program|recipe|essay|story)|I('ll| will) (write|generate|create) (a |the )?(code|script|program|recipe|essay|story))\b/i,
  },
];

export const validateOutput = (response: string): ValidationResult => {
  for (const { reason, pattern } of FLAG_PATTERNS) {
    if (pattern.test(response)) {
      return { flagged: true, reason };
    }
  }
  return { flagged: false };
};

export const CANNED_REDIRECT_MESSAGE =
  "I can only help with shared accommodation and travel. Try asking me something like 'I need a room in Lisbon for July.'";

const INPUT_FLAG_PATTERNS: ReadonlyArray<{
  reason: InputFlagReason;
  pattern: RegExp;
}> = [
  {
    reason: 'prompt_injection',
    pattern: /ignore (?:all |your )?(?:previous |prior )?instructions/i,
  },
  {
    reason: 'prompt_injection',
    pattern: /you are now /i,
  },
  {
    reason: 'prompt_injection',
    pattern: /(?:pretend|act as if) you (?:are|were)/i,
  },
  {
    reason: 'prompt_injection',
    pattern: /from now on you/i,
  },
  {
    reason: 'prompt_injection',
    pattern: /new persona/i,
  },
  {
    reason: 'prompt_injection',
    pattern: /bypass (?:your |all )?(?:safety|restrictions|rules|filters)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:repeat|show|tell|reveal|display) (?:me )?(?:your )?(?:system ?prompt|instructions|rules|guidelines)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern: /what (?:are|is) your (?:system ?prompt|instructions|rules)/i,
  },
];

export const validateInput = (input: string): ValidationResult => {
  for (const { reason, pattern } of INPUT_FLAG_PATTERNS) {
    if (pattern.test(input)) {
      return { flagged: true, reason };
    }
  }
  return { flagged: false };
};
