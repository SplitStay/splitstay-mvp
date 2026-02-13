import { createLog, type StructuredLog } from './logger';
import {
  CANNED_REDIRECT_MESSAGE,
  validateInput as defaultValidateInput,
  validateOutput as defaultValidateOutput,
} from './outputValidator';
import type { ConversationMessage } from './schemas';
import { TwilioWebhookSchema } from './schemas';
import {
  buildAmbiguousEventPrompt,
  buildExistingListingPrompt,
  buildSupplierSystemPrompt,
  UNRECOGNIZED_EVENT_RESPONSE,
} from './supplierPrompt';
import {
  expandUniformRooms,
  extractJsonBlock,
  hasIncompleteJsonBlock,
  looksLikeConfirmation,
  looksLikeEventReference,
  looksLikeUserAffirmative,
  SupplierListingSchema,
  stripJsonBlock,
  toSavePropertyListingInput,
  validateRoomDatesWithinEvent,
} from './supplierSchema';
import { SYSTEM_PROMPT } from './systemPrompt';
import { twimlResponse } from './twiml';
import type { DbClient, HandlerDependencies, MatchedEvent } from './types';

const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CONVERSATION_HISTORY_LIMIT = 50;
const FLAG_ALERT_THRESHOLD = 3;
const FLAG_ALERT_WINDOW_MS = 60 * 60 * 1000;
const EXTRACTION_MAX_RETRIES = 3;

const twimlXmlResponse = (message: string, status = 200): Response =>
  new Response(twimlResponse(message), {
    status,
    headers: { 'Content-Type': 'text/xml' },
  });

const parseFormBody = (body: string): Record<string, string> =>
  Object.fromEntries(new URLSearchParams(body));

type AuditStage = Extract<
  StructuredLog['stage'],
  'input-validation' | 'response'
>;

const auditFlaggedContent = async (
  db: DbClient,
  phone: string,
  content: string,
  reason: string,
  stage: AuditStage = 'response',
): Promise<void> => {
  try {
    await db.saveFlaggedContent(phone, content, reason);
  } catch (auditError) {
    console.error(
      JSON.stringify(
        createLog(
          phone,
          stage,
          'Failed to save flagged content to audit',
          errorMessage(auditError),
        ),
      ),
    );
  }

  try {
    const recentFlags = await db.countRecentFlags(phone, FLAG_ALERT_WINDOW_MS);
    if (recentFlags >= FLAG_ALERT_THRESHOLD) {
      console.warn(
        JSON.stringify(
          createLog(
            phone,
            stage,
            `Flag volume spike: ${recentFlags} flags in the last hour, reasons include ${reason}`,
          ),
        ),
      );
    }
  } catch (alertError) {
    console.error(
      JSON.stringify(
        createLog(
          phone,
          stage,
          'Failed to check flag volume',
          errorMessage(alertError),
        ),
      ),
    );
  }
};

const tryParseAndSave = async (
  db: DbClient,
  phone: string,
  event: MatchedEvent,
  json: string,
): Promise<boolean> => {
  const raw = expandUniformRooms(
    JSON.parse(json) as Record<string, unknown>,
    event.startDate,
    event.endDate,
  );
  const listing = SupplierListingSchema.parse(raw);
  const dateCheck = validateRoomDatesWithinEvent(
    listing.rooms,
    event.startDate,
    event.endDate,
  );
  if (!dateCheck.valid) {
    console.error(
      JSON.stringify(
        createLog(
          phone,
          'response',
          `Room date validation failed: ${dateCheck.error}`,
        ),
      ),
    );
    return false;
  }
  await db.savePropertyListing(
    toSavePropertyListingInput(listing, phone, event.id),
  );
  return true;
};

const handleSupplierExtraction = async (
  db: DbClient,
  llm: HandlerDependencies['llm'],
  phone: string,
  event: MatchedEvent,
  llmContent: string,
  jsonString: string,
  messages: ConversationMessage[],
): Promise<string> => {
  const today = new Date().toISOString().split('T')[0];
  if (event.endDate < today) {
    console.log(
      JSON.stringify(
        createLog(phone, 'response', 'Event has expired, not saving listing'),
      ),
    );
    return stripJsonBlock(llmContent);
  }

  // First attempt with the original JSON from the LLM response
  try {
    if (await tryParseAndSave(db, phone, event, jsonString)) {
      return stripJsonBlock(llmContent);
    }
  } catch (parseError) {
    console.error(
      JSON.stringify(
        createLog(
          phone,
          'response',
          'Extraction attempt 1 failed',
          errorMessage(parseError),
        ),
      ),
    );
  }

  // Retry up to (EXTRACTION_MAX_RETRIES - 1) additional times
  const retryMsgs: ConversationMessage[] = [
    ...messages,
    { role: 'assistant', content: llmContent },
    {
      role: 'user',
      content:
        'Please include the JSON block with all listing details as specified. The listing cannot be saved without it.',
    },
  ];
  for (let retry = 1; retry < EXTRACTION_MAX_RETRIES; retry++) {
    try {
      const retryResult = await llm.chatCompletion(retryMsgs);
      const retryJson = extractJsonBlock(retryResult.content);
      if (!retryJson.found) continue;
      if (await tryParseAndSave(db, phone, event, retryJson.json)) {
        return stripJsonBlock(retryResult.content);
      }
    } catch (retryError) {
      console.error(
        JSON.stringify(
          createLog(
            phone,
            'response',
            `Extraction attempt ${retry + 1} failed`,
            errorMessage(retryError),
          ),
        ),
      );
    }
  }

  // All retries exhausted
  await auditFlaggedContent(db, phone, llmContent, 'extraction_failed');
  return 'Your listing details have been received. Our team will follow up with you shortly to confirm everything.';
};

export const createHandler = (deps: HandlerDependencies) => {
  const { llm, db, accessControl, twilioValidator } = deps;
  const validateOutput = deps.validateOutput ?? defaultValidateOutput;
  const validateInput = deps.validateInput ?? defaultValidateInput;

  return async (request: Request): Promise<Response> => {
    let phone = 'unknown';

    try {
      const contentType = request.headers.get('Content-Type');
      if (!contentType?.includes('application/x-www-form-urlencoded')) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'validation',
              'Invalid Content-Type',
              contentType ?? 'missing',
            ),
          ),
        );
        return new Response('Bad Request', { status: 400 });
      }

      const rawBody = await request.text();
      const params = parseFormBody(rawBody);

      // Validate Twilio signature
      const signature = request.headers.get('X-Twilio-Signature') ?? '';
      if (!(await twilioValidator.validate(signature, request.url, params))) {
        console.error(
          JSON.stringify(createLog(phone, 'validation', 'Invalid signature')),
        );
        return new Response('Forbidden', { status: 403 });
      }

      // Parse and validate webhook payload
      const parseResult = TwilioWebhookSchema.safeParse(params);
      if (!parseResult.success) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'validation',
              'Invalid webhook payload',
              parseResult.error.message,
            ),
          ),
        );
        return new Response('Bad Request', { status: 400 });
      }
      const webhook = parseResult.data;
      phone = webhook.From;

      console.log(
        JSON.stringify(createLog(phone, 'validation', 'Webhook validated')),
      );

      // Check access control
      if (!accessControl.isAdmin(phone)) {
        console.log(
          JSON.stringify(
            createLog(phone, 'access-control', 'Non-admin rejected'),
          ),
        );
        return twimlXmlResponse(
          "Thanks for reaching out! We're not quite ready yet - check back in a few days.",
        );
      }

      // Check for duplicate MessageSid (fail open on error)
      try {
        const seen = await db.checkSeenSid(webhook.MessageSid);
        if (seen) {
          console.log(
            JSON.stringify(
              createLog(phone, 'dedup', 'Duplicate MessageSid rejected'),
            ),
          );
          return twimlXmlResponse(
            'This message was already received and processed.',
          );
        }
      } catch (dedupError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'dedup',
              'Dedup check failed, allowing through',
              errorMessage(dedupError),
            ),
          ),
        );
      }

      // Check rate limit (fail open on error)
      try {
        const rateResult = await db.checkRateLimit(
          phone,
          RATE_LIMIT_MAX,
          RATE_LIMIT_WINDOW_MS,
        );
        if (!rateResult.allowed) {
          console.log(
            JSON.stringify(createLog(phone, 'rate-limit', 'Rate limited')),
          );
          return twimlXmlResponse(
            `You've sent too many messages. Please try again in ${rateResult.retryAfterMinutes} minutes.`,
          );
        }
      } catch (rateLimitError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'rate-limit',
              'Rate limit check failed, allowing through',
              errorMessage(rateLimitError),
            ),
          ),
        );
      }

      // Check for non-text messages (media)
      const numMedia = Number.parseInt(webhook.NumMedia ?? '0', 10);
      if (numMedia > 0) {
        console.log(
          JSON.stringify(
            createLog(phone, 'validation', 'Non-text message received'),
          ),
        );
        return twimlXmlResponse(
          'I can only read text messages right now. Could you type your response instead?',
        );
      }

      // Validate user input (fail closed on validator error)
      try {
        const inputValidation = validateInput(webhook.Body);
        if (inputValidation.flagged) {
          console.log(
            JSON.stringify(
              createLog(
                phone,
                'input-validation',
                `Input flagged: ${inputValidation.reason}`,
              ),
            ),
          );

          try {
            await db.markSidSeen(webhook.MessageSid);
          } catch (markSeenError) {
            console.error(
              JSON.stringify(
                createLog(
                  phone,
                  'dedup',
                  'Failed to mark SID as seen',
                  errorMessage(markSeenError),
                ),
              ),
            );
          }

          try {
            await auditFlaggedContent(
              db,
              phone,
              webhook.Body,
              inputValidation.reason,
              'input-validation',
            );
          } catch (auditError) {
            console.error(
              JSON.stringify(
                createLog(
                  phone,
                  'input-validation',
                  'Failed to audit flagged input',
                  errorMessage(auditError),
                ),
              ),
            );
          }

          return twimlXmlResponse(CANNED_REDIRECT_MESSAGE);
        }
      } catch (inputValidatorError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'input-validation',
              'Input validator error, blocking request',
              errorMessage(inputValidatorError),
            ),
          ),
        );
        return twimlXmlResponse(
          'Sorry, something went wrong. Please try again.',
        );
      }

      // Build LLM context (fail closed on history fetch error)
      let history: ConversationMessage[];
      try {
        history = await db.getConversationHistory(
          phone,
          CONVERSATION_HISTORY_LIMIT,
        );
      } catch (historyError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'llm',
              'Failed to fetch conversation history',
              errorMessage(historyError),
            ),
          ),
        );
        return twimlXmlResponse(
          "There's a temporary issue accessing your conversation. Please send your request again.",
        );
      }

      // Event detection: runs on first message using the incoming body,
      // and on follow-up messages using the first user message in history.
      // When the first message was ambiguous (multiple matches), also try
      // the current message to resolve disambiguation.
      let detectedEvent: MatchedEvent | undefined;
      let systemPrompt = SYSTEM_PROMPT;
      let unrecognizedEventRef = false;

      const eventDetectionBody =
        history.length === 0
          ? webhook.Body
          : history.find((m) => m.role === 'user')?.content;

      if (eventDetectionBody) {
        try {
          const events = await db.findMatchingEvents(eventDetectionBody);
          if (events.length === 1) {
            detectedEvent = events[0];
            const hasListing = await db.findPropertyListing(
              phone,
              detectedEvent.id,
            );
            systemPrompt = hasListing
              ? buildExistingListingPrompt(detectedEvent)
              : buildSupplierSystemPrompt(detectedEvent);
          } else if (events.length > 1 && history.length === 0) {
            systemPrompt = buildAmbiguousEventPrompt(events);
          } else if (events.length > 1 && history.length > 0) {
            // First message was ambiguous — try matching the current message
            // to see if the user clarified which event they mean
            const currentEvents = await db.findMatchingEvents(webhook.Body);
            if (currentEvents.length === 1) {
              detectedEvent = currentEvents[0];
              const hasListing = await db.findPropertyListing(
                phone,
                detectedEvent.id,
              );
              systemPrompt = hasListing
                ? buildExistingListingPrompt(detectedEvent)
                : buildSupplierSystemPrompt(detectedEvent);
            }
          } else if (
            events.length === 0 &&
            history.length === 0 &&
            looksLikeEventReference(webhook.Body)
          ) {
            unrecognizedEventRef = true;
          }
        } catch (eventError) {
          console.error(
            JSON.stringify(
              createLog(
                phone,
                'llm',
                'Event detection failed, using default prompt',
                errorMessage(eventError),
              ),
            ),
          );
        }
      }

      // Short-circuit for unrecognized event references (bypass LLM)
      let responseContent: string;

      if (unrecognizedEventRef) {
        console.log(
          JSON.stringify(
            createLog(
              phone,
              'llm',
              'Unrecognized event reference, skipping LLM',
            ),
          ),
        );
        responseContent = UNRECOGNIZED_EVENT_RESPONSE;
      } else {
        const messages: ConversationMessage[] = [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: webhook.Body },
        ];

        // Call LLM (with retry for supplier JSON extraction)
        let llmContent: string;
        try {
          console.log(JSON.stringify(createLog(phone, 'llm', 'Calling LLM')));
          const llmResult = await llm.chatCompletion(messages);
          llmContent = llmResult.content;
        } catch (llmError) {
          console.error(
            JSON.stringify(
              createLog(
                phone,
                'llm',
                'LLM call failed',
                errorMessage(llmError),
              ),
            ),
          );
          return twimlXmlResponse(
            "I'm having trouble thinking right now. Please try again in a moment.",
          );
        }

        // Check for supplier listing JSON in LLM response
        const jsonResult = extractJsonBlock(llmContent);

        if (jsonResult.found && detectedEvent) {
          responseContent = await handleSupplierExtraction(
            db,
            llm,
            phone,
            detectedEvent,
            llmContent,
            jsonResult.json,
            messages,
          );
        } else if (
          !jsonResult.found &&
          detectedEvent &&
          (hasIncompleteJsonBlock(llmContent) ||
            (looksLikeUserAffirmative(webhook.Body) &&
              looksLikeConfirmation(llmContent)))
        ) {
          // LLM confirmed without JSON block or produced truncated JSON — retry to obtain structured data
          console.error(
            JSON.stringify(
              createLog(
                phone,
                'response',
                'LLM confirmed listing without JSON block, retrying',
              ),
            ),
          );

          let recovered = false;
          const retryMessages: ConversationMessage[] = [
            ...messages,
            { role: 'assistant', content: llmContent },
            {
              role: 'user',
              content:
                'Please include the JSON block with all listing details as specified. The listing cannot be saved without it.',
            },
          ];
          for (let retry = 0; retry < EXTRACTION_MAX_RETRIES; retry++) {
            try {
              const retryResult = await llm.chatCompletion(retryMessages);
              const retryJson = extractJsonBlock(retryResult.content);
              if (
                retryJson.found &&
                (await tryParseAndSave(
                  db,
                  phone,
                  detectedEvent,
                  retryJson.json,
                ))
              ) {
                responseContent = stripJsonBlock(retryResult.content);
                recovered = true;
                break;
              }
            } catch (retryError) {
              console.error(
                JSON.stringify(
                  createLog(
                    phone,
                    'response',
                    `Confirmation recovery attempt ${retry + 1} failed`,
                    errorMessage(retryError),
                  ),
                ),
              );
            }
          }

          if (!recovered) {
            await auditFlaggedContent(
              db,
              phone,
              llmContent,
              'extraction_failed',
            );
            responseContent =
              'Your listing details have been received. Our team will follow up with you shortly to confirm everything.';
          }
        } else {
          // Standard output validation flow
          try {
            const validation = validateOutput(llmContent);
            if (validation.flagged) {
              console.log(
                JSON.stringify(
                  createLog(
                    phone,
                    'response',
                    `Output flagged: ${validation.reason}`,
                  ),
                ),
              );
              responseContent = CANNED_REDIRECT_MESSAGE;
              await auditFlaggedContent(
                db,
                phone,
                llmContent,
                validation.reason,
              );
            } else {
              responseContent = llmContent;
            }
          } catch (validatorError) {
            console.error(
              JSON.stringify(
                createLog(
                  phone,
                  'response',
                  'Output validator error, blocking unvalidated content',
                  errorMessage(validatorError),
                ),
              ),
            );
            responseContent = 'Sorry, something went wrong. Please try again.';
          }
        }
      } // end unrecognizedEventRef else

      // Save conversation (don't drop response on failure)
      try {
        await db.saveMessages(phone, [
          { role: 'user', content: webhook.Body },
          { role: 'assistant', content: responseContent },
        ]);
      } catch (saveError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'response',
              'Failed to save conversation',
              errorMessage(saveError),
            ),
          ),
        );
      }

      // Mark SID as seen (don't drop response on failure)
      try {
        await db.markSidSeen(webhook.MessageSid);
      } catch (markSeenError) {
        console.error(
          JSON.stringify(
            createLog(
              phone,
              'dedup',
              'Failed to mark SID as seen',
              errorMessage(markSeenError),
            ),
          ),
        );
      }

      console.log(
        JSON.stringify(createLog(phone, 'response', 'Response sent')),
      );
      return twimlXmlResponse(responseContent);
    } catch (error) {
      console.error(
        JSON.stringify(
          createLog(
            phone,
            'response',
            'Unhandled error',
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          ),
        ),
      );
      return twimlXmlResponse('Sorry, something went wrong. Please try again.');
    }
  };
};
