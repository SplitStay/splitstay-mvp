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

export interface MatchingUser {
  id: string;
  displayName: string;
  preferencesConfigured: boolean;
}

export interface EventRegistration {
  eventId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  isHost: boolean;
}

export interface MatchProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  sharedTraits: string[];
  sharedLanguages: string[];
  compatibilityScore: number;
  accommodationSummary: string | null;
  profileUrl: string | null;
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
  findUserByPhone: (phone: string) => Promise<MatchingUser | null>;
  getUserEventRegistrations: (userId: string) => Promise<EventRegistration[]>;
  getEventMatchProfiles: (
    eventId: string,
    userId: string,
  ) => Promise<MatchProfile[]>;
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
