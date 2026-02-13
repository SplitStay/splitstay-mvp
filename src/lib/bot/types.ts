import type { ValidationResult } from './outputValidator';
import type { ConversationMessage } from './schemas';

export interface MatchedEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface LlmClient {
  chatCompletion: (
    messages: ConversationMessage[],
  ) => Promise<{ content: string }>;
}

export interface SavePropertyListingInput {
  phoneNumber: string;
  supplierName: string;
  eventId: string;
  location: string;
  accommodationTypeId: string;
  numBedrooms: number;
  pricePerNight: number;
  houseRules: string;
  rooms: Array<{
    roomNumber: number;
    availableFrom: string;
    availableTo: string;
  }>;
}

export interface DbClient {
  checkSeenSid: (messageSid: string) => Promise<boolean>;
  markSidSeen: (messageSid: string) => Promise<void>;
  checkRateLimit: (
    phone: string,
    maxMessages: number,
    windowMs: number,
  ) => Promise<{ allowed: boolean; retryAfterMinutes: number }>;
  getConversationHistory: (
    phone: string,
    limit: number,
  ) => Promise<ConversationMessage[]>;
  saveMessages: (
    phone: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) => Promise<void>;
  saveFlaggedContent: (
    phone: string,
    content: string,
    reason: string,
  ) => Promise<void>;
  countRecentFlags: (phone: string, windowMs: number) => Promise<number>;
  findMatchingEvents: (messageBody: string) => Promise<MatchedEvent[]>;
  findPropertyListing: (phone: string, eventId: string) => Promise<boolean>;
  savePropertyListing: (
    input: SavePropertyListingInput,
  ) => Promise<{ propertyListingId: string }>;
}

export interface AccessControl {
  isAdmin: (phone: string) => boolean;
}

export interface TwilioValidator {
  validate: (
    signature: string,
    url: string,
    params: Record<string, string>,
  ) => Promise<boolean>;
}

export interface HandlerDependencies {
  llm: LlmClient;
  db: DbClient;
  accessControl: AccessControl;
  twilioValidator: TwilioValidator;
  validateOutput?: (content: string) => ValidationResult;
  validateInput?: (content: string) => ValidationResult;
}
