import { useRef, useState } from 'react';

interface Message {
  id: string;
  body: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  error?: boolean;
}

function generateMessageSid(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `SM${hex}`;
}

function parseTwimlMessages(xml: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const messageEls = doc.querySelectorAll('Message');
  return Array.from(messageEls).map((el) => el.textContent ?? '');
}

function renderMessageBody(body: string): React.ReactNode {
  // Convert [text](url) markdown links to clickable <a> tags
  const parts = body.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={part}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#53BDEB] underline hover:text-[#7DD3F0]"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={part}>{part}</span>;
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function BouncingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-[#8696A0] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Settings</title>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function WhatsAppTesterPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fromNumber, setFromNumber] = useState('whatsapp:+15551234567');
  const [webhookUrl, setWebhookUrl] = useState(
    'http://127.0.0.1:54321/functions/v1/whatsapp-webhook',
  );
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const sendMessage = async () => {
    const body = inputText.trim();
    if (!body || isLoading) return;

    const userMessage: Message = {
      id: generateMessageSid(),
      body,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const params = new URLSearchParams({
        MessageSid: generateMessageSid(),
        From: fromNumber,
        Body: body,
        NumMedia: '0',
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const xml = await response.text();
      const botTexts = parseTwimlMessages(xml);

      const botMessages: Message[] = botTexts.map((text) => ({
        id: generateMessageSid(),
        body: text,
        sender: 'bot',
        timestamp: new Date(),
      }));

      setMessages((prev) => [...prev, ...botMessages]);
      scrollToBottom();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to reach webhook';
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageSid(),
          body: `Error: ${errorMsg}`,
          sender: 'bot',
          timestamp: new Date(),
          error: true,
        },
      ]);
      scrollToBottom();
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#111B21]">
      {/* Left sidebar */}
      <div className="hidden w-[300px] flex-shrink-0 flex-col border-r border-[#222D34] md:flex">
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between bg-[#202C33] px-4">
          <span className="text-base font-medium text-[#E9EDEF]">Chats</span>
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="rounded-full p-2 text-[#AEBAC1] hover:bg-[#374045]"
            aria-label="Settings"
          >
            <GearIcon />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="border-b border-[#222D34] bg-[#111B21] p-4">
            <label className="mb-2 block text-xs text-[#8696A0]">
              From number
              <input
                type="text"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                className="mt-1 w-full rounded bg-[#2A3942] px-3 py-2 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            </label>
            <label className="block text-xs text-[#8696A0]">
              Webhook URL
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1 w-full rounded bg-[#2A3942] px-3 py-2 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            </label>
          </div>
        )}

        {/* Search bar */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-3 rounded-lg bg-[#202C33] px-3 py-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8696A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Search</title>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-sm text-[#8696A0]">
              Search or start new chat
            </span>
          </div>
        </div>

        {/* Conversation entry */}
        <div className="flex cursor-pointer items-center gap-3 bg-[#2A3942] px-4 py-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#00A884] text-lg font-bold text-white">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-base text-[#E9EDEF]">SplitStay Bot</span>
              <span className="text-xs text-[#8696A0]">
                {lastMessage ? formatTime(lastMessage.timestamp) : ''}
              </span>
            </div>
            <div className="truncate text-sm text-[#8696A0]">
              {lastMessage ? lastMessage.body : 'Tap to start chatting'}
            </div>
          </div>
        </div>
      </div>

      {/* Right chat panel */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex h-14 flex-shrink-0 items-center gap-3 bg-[#202C33] px-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#00A884] text-sm font-bold text-white">
            S
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-[#E9EDEF]">
              SplitStay Bot
            </div>
            <div className="text-xs text-[#8696A0]">
              {isLoading ? 'typing...' : 'online'}
            </div>
          </div>
          {/* Mobile settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="rounded-full p-2 text-[#AEBAC1] hover:bg-[#374045] md:hidden"
            aria-label="Settings"
          >
            <GearIcon />
          </button>
          {/* Three-dot menu (decorative) */}
          <button
            type="button"
            className="rounded-full p-2 text-[#AEBAC1] hover:bg-[#374045]"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <title>Menu</title>
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Mobile settings panel */}
        {showSettings && (
          <div className="border-b border-[#222D34] bg-[#111B21] p-4 md:hidden">
            <label className="mb-2 block text-xs text-[#8696A0]">
              From number
              <input
                type="text"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                className="mt-1 w-full rounded bg-[#2A3942] px-3 py-2 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            </label>
            <label className="block text-xs text-[#8696A0]">
              Webhook URL
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1 w-full rounded bg-[#2A3942] px-3 py-2 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            </label>
          </div>
        )}

        {/* Message area */}
        <div
          className="flex-1 overflow-y-auto bg-[#0B141A] px-4 py-3"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23182229'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23p)' width='200' height='200'/%3E%3C/svg%3E\")",
          }}
        >
          <div className="mx-auto max-w-2xl space-y-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'rounded-tr-none bg-[#005C4B] text-[#E9EDEF]'
                      : msg.error
                        ? 'rounded-tl-none bg-red-900/60 text-red-200'
                        : 'rounded-tl-none bg-[#202C33] text-[#E9EDEF]'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[14.2px] leading-[19px]">
                    {renderMessageBody(msg.body)}
                  </div>
                  <div
                    className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${
                      msg.sender === 'user'
                        ? 'text-[rgba(255,255,255,0.6)]'
                        : 'text-[#8696A0]'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                    {msg.sender === 'user' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="11"
                        viewBox="0 0 16 11"
                        fill="none"
                      >
                        <title>Read</title>
                        <path
                          d="M11.07 0.66L4.88 6.85L2.91 4.88L1.5 6.29L4.88 9.67L12.48 2.07L11.07 0.66ZM8.44 6.85L7.03 5.44L5.62 6.85L7.03 8.26L8.44 6.85ZM13.89 0.66L8.44 6.12L9.85 7.53L15.3 2.07L13.89 0.66Z"
                          fill="#53BDEB"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-tl-none bg-[#202C33] shadow-sm">
                  <BouncingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="flex flex-shrink-0 items-center gap-2 bg-[#202C33] px-3 py-2">
          {/* Emoji icon */}
          <button
            type="button"
            className="flex-shrink-0 p-1.5 text-[#8696A0] hover:text-[#AEBAC1]"
            aria-label="Emoji"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Emoji</title>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          {/* Attach icon */}
          <button
            type="button"
            className="flex-shrink-0 p-1.5 text-[#8696A0] hover:text-[#AEBAC1]"
            aria-label="Attach"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Attach</title>
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          {/* Message input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            disabled={isLoading}
            className="flex-1 rounded-[21px] bg-[#2A3942] px-4 py-2.5 text-[15px] text-[#E9EDEF] placeholder-[#8696A0] outline-none disabled:opacity-50"
          />
          {/* Send / Mic button */}
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#8696A0] hover:text-[#AEBAC1]"
            aria-label={inputText.trim() ? 'Send message' : 'Voice message'}
          >
            {inputText.trim() ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Send</title>
                <path d="M1.101 21L23 12 1.101 3 1.1 10l16 2-16 2z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Microphone</title>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
