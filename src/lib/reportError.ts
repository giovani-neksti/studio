/**
 * Reports an error to the error logging API.
 * Fire-and-forget — never throws.
 */
export function reportError(
  error: unknown,
  source?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    // Get auth token if available
    let token: string | undefined;
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('sb-auth-token');
      if (raw) {
        try {
          token = JSON.parse(raw)?.access_token;
        } catch {}
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/errors', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        stack,
        source: source ?? 'client',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        metadata,
      }),
    }).catch(() => {}); // swallow — never break the app for logging
  } catch {}
}
