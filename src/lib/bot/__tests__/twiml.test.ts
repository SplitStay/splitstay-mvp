import { describe, expect, it } from 'vitest';
import { twimlResponse } from '../twiml';

describe('twimlResponse', () => {
  it('wraps message in valid TwiML XML', () => {
    const result = twimlResponse('Hello there');

    expect(result).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Hello there</Message></Response>',
    );
  });

  it('escapes ampersands in message text', () => {
    const result = twimlResponse('Tom & Jerry');

    expect(result).toContain('Tom &amp; Jerry');
  });

  it('escapes angle brackets in message text', () => {
    const result = twimlResponse('Use <b> tags');

    expect(result).toContain('Use &lt;b&gt; tags');
  });

  it('escapes double quotes in message text', () => {
    const result = twimlResponse('She said "hello"');

    expect(result).toContain('She said &quot;hello&quot;');
  });

  it('escapes single quotes in message text', () => {
    const result = twimlResponse("It's fine");

    expect(result).toContain('It&apos;s fine');
  });

  it('escapes all special characters together', () => {
    const result = twimlResponse('<script>"alert(\'xss\');"&</script>');

    expect(result).toContain(
      '&lt;script&gt;&quot;alert(&apos;xss&apos;);&quot;&amp;&lt;/script&gt;',
    );
  });
});
