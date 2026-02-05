import { createLog } from './logger';
import type { ConversationMessage } from './schemas';
import { TwilioWebhookSchema } from './schemas';
import { SYSTEM_PROMPT } from './systemPrompt';
import { twimlResponse } from './twiml';
import type { HandlerDependencies } from './types';

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CONVERSATION_HISTORY_LIMIT = 50;

const twimlXmlResponse = (message: string, status = 200): Response =>
  new Response(twimlResponse(message), {
    status,
    headers: { 'Content-Type': 'text/xml' },
  });

const parseFormBody = (body: string): Record<string, string> =>
  Object.fromEntries(new URLSearchParams(body));

export const createHandler = (deps: HandlerDependencies) => {
  const { llm, db, accessControl, twilioValidator } = deps;

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

      // Build LLM context (fail open on history fetch error)
      let history: ConversationMessage[] = [];
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
              'Failed to fetch conversation history, continuing without it',
              errorMessage(historyError),
            ),
          ),
        );
      }

      const messages: ConversationMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: webhook.Body },
      ];

      // Call LLM
      let llmContent: string;
      try {
        console.log(JSON.stringify(createLog(phone, 'llm', 'Calling LLM')));
        const llmResult = await llm.chatCompletion(messages);
        llmContent = llmResult.content;
      } catch (llmError) {
        console.error(
          JSON.stringify(
            createLog(phone, 'llm', 'LLM call failed', errorMessage(llmError)),
          ),
        );
        return twimlXmlResponse(
          "I'm having trouble thinking right now. Please try again in a moment.",
        );
      }

      // Save conversation (don't drop LLM response on failure)
      try {
        await db.saveMessages(phone, [
          { role: 'user', content: webhook.Body },
          { role: 'assistant', content: llmContent },
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

      // Mark SID as seen (don't drop LLM response on failure)
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
      return twimlXmlResponse(llmContent);
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
