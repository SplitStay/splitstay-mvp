interface StructuredLog {
  timestamp: string;
  phone: string;
  stage:
    | 'validation'
    | 'access-control'
    | 'dedup'
    | 'rate-limit'
    | 'llm'
    | 'response';
  message: string;
  error?: string;
}

const truncatePhone = (phone: string): string =>
  phone.length >= 4 ? `****${phone.slice(-4)}` : '****';

export const createLog = (
  phone: string,
  stage: StructuredLog['stage'],
  message: string,
  error?: string,
): StructuredLog => ({
  timestamp: new Date().toISOString(),
  phone: truncatePhone(phone),
  stage,
  message,
  ...(error !== undefined ? { error } : {}),
});
