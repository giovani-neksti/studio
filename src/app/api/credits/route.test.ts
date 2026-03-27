import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockInsertSingle = vi.fn();
  return {
    mockSingle,
    mockInsertSingle,
    mockRpc: vi.fn(),
    mockGetUserById: vi.fn(),
    mockFrom: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: mockInsertSingle })) })),
    })),
  };
});

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: mocks.mockFrom,
    rpc: mocks.mockRpc,
    auth: { admin: { getUserById: mocks.mockGetUserById } },
  },
}));

import { GET, POST } from './route';

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/credits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when userId is missing', async () => {
    const res = await GET(makeRequest('GET', 'http://localhost/api/credits'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns credits for an existing user', async () => {
    mocks.mockSingle.mockResolvedValueOnce({ data: { credits: 5 }, error: null });
    const res = await GET(makeRequest('GET', 'http://localhost/api/credits?userId=abc-123'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.credits).toBe(5);
  });

  it('auto-creates profile with 3 credits when not found (PGRST116)', async () => {
    mocks.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    mocks.mockInsertSingle.mockResolvedValueOnce({ data: { credits: 3 }, error: null });
    mocks.mockGetUserById.mockResolvedValueOnce({ data: { user: { email: 'new@example.com' } } });

    const res = await GET(makeRequest('GET', 'http://localhost/api/credits?userId=new-user'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.credits).toBe(3);
  });
});

describe('POST /api/credits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest('POST', 'http://localhost/api/credits', {}));
    expect(res.status).toBe(400);
  });

  it('decrements credit and returns new balance', async () => {
    mocks.mockRpc.mockResolvedValueOnce({ data: 4, error: null });
    const res = await POST(makeRequest('POST', 'http://localhost/api/credits', { userId: 'abc-123' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.credits).toBe(4);
  });

  it('returns 500 when rpc fails', async () => {
    mocks.mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'db error' } });
    const res = await POST(makeRequest('POST', 'http://localhost/api/credits', { userId: 'abc-123' }));
    expect(res.status).toBe(500);
  });
});
