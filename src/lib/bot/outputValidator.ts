export type FlagReason =
  | 'system_prompt_disclosure'
  | 'out_of_scope_service'
  | 'personal_data_harvesting'
  | 'identity_change'
  | 'professional_advice';

export type InputFlagReason =
  | 'prompt_injection'
  | 'system_prompt_extraction'
  | 'empty_message';

export type ValidationResult =
  | { flagged: false }
  | { flagged: true; reason: FlagReason | InputFlagReason };

const FLAG_PATTERNS: ReadonlyArray<{ reason: FlagReason; pattern: RegExp }> = [
  {
    reason: 'system_prompt_disclosure',
    pattern:
      /\b(my (system )?prompt|my instructions|I was (told|instructed|programmed|designed) to|my (internal|hidden) (rules|instructions|configuration))\b/i,
  },
  {
    reason: 'system_prompt_disclosure',
    pattern:
      /\b(my (configuration|guidelines|setup) (tells?|says?|requires?)|according to my (setup|configuration|guidelines))\b/i,
  },
  {
    reason: 'system_prompt_disclosure',
    pattern: /SUPPLIER INTAKE FLOW:|ON CONFIRMATION \(YES\):|DATA VALIDATION:/i,
  },
  {
    reason: 'system_prompt_disclosure',
    pattern:
      /\b(my (?:first |second |next )?rule is|the rules I follow|my (?:internal )?(?:rules|guidelines) (?:include|are))\b/i,
  },
  {
    reason: 'identity_change',
    pattern:
      /\b(I am now (?!the splitstay)|I('m| am) no longer the splitstay|my new (role|identity|name) is|I('ll| will) pretend to be)\b/i,
  },
  {
    reason: 'identity_change',
    pattern:
      /\b(I will now act as|I('m| am) now operating|I('m| am) now a|I('ll| will) now (act|operate|function) (as|without))\b/i,
  },
  {
    reason: 'personal_data_harvesting',
    pattern:
      /\b(credit card|social security|passport number|bank account|CVV|PIN number|routing number)\b/i,
  },
  {
    reason: 'personal_data_harvesting',
    pattern:
      /\b(date of birth|home address|national insurance|ID number|identity (card|document) number)\b/i,
  },
  {
    reason: 'personal_data_harvesting',
    pattern:
      /\b((?:your|share your|provide your|need your) (?:email|phone number|full (?:legal )?name))\b/i,
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
  {
    reason: 'out_of_scope_service',
    pattern:
      /\b((?:let me |I'll |I will )(?:write|compose|draft) (?:that |an? |the |your )?(?:email|letter|cover letter|essay|report))\b/i,
  },
  {
    reason: 'out_of_scope_service',
    pattern:
      /\b(I('ll| will) help you (?:compose|draft|write) (?:a |an? |the |your )?(?:email|letter|cover letter|essay|report))\b/i,
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
  // Direct prompt injection
  {
    reason: 'prompt_injection',
    pattern: /ignore (?:all |your )?(?:previous |prior )?instructions/i,
  },
  { reason: 'prompt_injection', pattern: /you are now /i },
  {
    reason: 'prompt_injection',
    pattern: /(?:pretend|act as if) you (?:are|were)/i,
  },
  { reason: 'prompt_injection', pattern: /from now on you/i },
  { reason: 'prompt_injection', pattern: /new persona/i },
  {
    reason: 'prompt_injection',
    pattern: /bypass (?:your |all )?(?:safety|restrictions|rules|filters)/i,
  },

  // Semantic rephrasing of prompt injection
  {
    reason: 'prompt_injection',
    pattern:
      /disregard (?:everything|all|your|the) (?:above|instructions|rules|guidelines|previous)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /forget (?:your|all|the) (?:training|instructions|rules|programming|guidelines)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /override (?:your|all|the) (?:programming|instructions|rules|guidelines|safety)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /stop following (?:your|the|all) (?:rules|guidelines|instructions)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /(?:do not|don't) follow (?:your|the|any) (?:rules|guidelines|instructions)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /(?:your )?(?:previous |prior )?context (?:is|was) (?:invalid|irrelevant|wrong)/i,
  },
  {
    reason: 'prompt_injection',
    pattern: /reset (?:your )?(?:context|memory|instructions|programming)/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /(?:fresh|new|clean) session (?:with )?no (?:constraints|rules|restrictions)/i,
  },

  // Role-play attacks
  {
    reason: 'prompt_injection',
    pattern:
      /(?:play a game|roleplay|imagine|hypothetical|pretend).*(?:unrestricted|(?:no|without) (?:rules|restrictions|guidelines|safety|limits))/i,
  },
  {
    reason: 'prompt_injection',
    pattern:
      /(?:for |as an? )?(?:educational|academic|research) (?:purposes?|exercise).*(?:without|no) (?:safety|restrictions|rules|guidelines)/i,
  },

  // Fake system/context markers
  {
    reason: 'prompt_injection',
    pattern: /\[SYSTEM\]|SYSTEM OVERRIDE/i,
  },

  // Developer/debug mode manipulation
  {
    reason: 'prompt_injection',
    pattern:
      /(?:enter|enable|activate|switch to|turn on) (?:developer|debug|admin|maintenance|DAN|sudo|god|root) mode/i,
  },

  // Multi-language injection (common patterns in French, German, Spanish)
  {
    reason: 'prompt_injection',
    pattern:
      /ignor(?:ez|ieren?|a)\b.*(?:instructions?|Anweisungen|instrucciones)/i,
  },

  // System prompt extraction - direct
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:repeat|show|tell|reveal|display|output|print|dump) (?:me )?(?:everything|your |the )?(?:system ?prompt|instructions|guidelines)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:repeat|show|tell|reveal|display|output|print|dump) (?:me )?(?:everything|your |the )?rules(?!\s+(?:of|for|at)\b)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern: /what (?:are|is) your (?:system ?prompt|instructions|rules)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:output|print|show) (?:everything|all|the text) (?:between|above|before|after)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:replace|convert|encode|transform|rewrite|translate|reverse|rot13|base64).*(?:system ?prompt|instructions|configuration)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:system ?prompt|instructions|configuration).*(?:replace|convert|encode|transform|rewrite|translate|reverse)/i,
  },

  // Indirect system prompt extraction
  {
    reason: 'system_prompt_extraction',
    pattern:
      /(?:summarize|describe|explain|list) (?:everything|all) (?:you know about yourself|about your (?:rules|instructions|configuration))/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /what (?:were you|are you) (?:told|given|configured|programmed) (?:before|with|to do)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /describe your (?:personality|guidelines|programming|configuration)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /how (?:were|are) you (?:configured|programmed|set up|instructed)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /what is your (?:initial|original|starting|base) (?:context|prompt|configuration)/i,
  },
  {
    reason: 'system_prompt_extraction',
    pattern:
      /list (?:all )?(?:the )?(?:rules|guidelines|instructions) you (?:follow|have|were given)/i,
  },
];

/**
 * Map visually confusable characters (Cyrillic, Greek, etc.) to their
 * Latin equivalents. NFKD normalization does not handle cross-script
 * homoglyphs, so we replace them explicitly.
 */
const CONFUSABLE_MAP: Record<string, string> = {
  '\u0430': 'a',
  '\u0435': 'e',
  '\u043E': 'o',
  '\u0440': 'p',
  '\u0441': 'c',
  '\u0443': 'y',
  '\u0445': 'x',
  '\u0456': 'i',
  '\u0410': 'A',
  '\u0415': 'E',
  '\u041E': 'O',
  '\u0420': 'P',
  '\u0421': 'C',
  '\u0423': 'Y',
  '\u0425': 'X',
  '\u0406': 'I',
  '\u0391': 'A',
  '\u0392': 'B',
  '\u0395': 'E',
  '\u0397': 'H',
  '\u0399': 'I',
  '\u039A': 'K',
  '\u039C': 'M',
  '\u039D': 'N',
  '\u039F': 'O',
  '\u03A1': 'P',
  '\u03A4': 'T',
  '\u03A5': 'Y',
  '\u03A7': 'X',
  '\u03B1': 'a',
  '\u03BF': 'o',
};

const confusableRegex = new RegExp(
  `[${Object.keys(CONFUSABLE_MAP).join('')}]`,
  'g',
);

/**
 * Strip zero-width Unicode characters and normalize homoglyphs before
 * matching. Zero-width chars are removed entirely so mid-word injection
 * (e.g. ig\u200Bnore) reconstitutes the original word. Homoglyphs are
 * mapped to Latin equivalents. Whitespace is collapsed so multi-space
 * and tab evasion fails.
 */
const normalizeInput = (raw: string): string =>
  raw
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, '')
    .replace(confusableRegex, (ch) => CONFUSABLE_MAP[ch] ?? ch)
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/\s+/g, ' ');

export const validateInput = (input: string): ValidationResult => {
  if (input.trim().length === 0) {
    return { flagged: true, reason: 'empty_message' };
  }
  const normalized = normalizeInput(input);
  for (const { reason, pattern } of INPUT_FLAG_PATTERNS) {
    if (pattern.test(normalized)) {
      return { flagged: true, reason };
    }
  }
  return { flagged: false };
};
