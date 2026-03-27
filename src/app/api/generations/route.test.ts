import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockRange = vi.fn();
  return {
    mockGetUser: vi.fn(),
    mockRange,
    mockFrom: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ range: mockRange })),
        })),
      })),
    })),
  };
});

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: mocks.mockFrom,
    auth: { getUser: mocks.mockGetUser },
  },
}));

import { GET } from './route';

function makeRequest(headers?: Record<string, string>, url = 'http://localhost/api/generations?page=1'): Request {
  return new Request(url, { headers });
}

describe('GET /api/generations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 when token does not start with Bearer', async () => {
    const res = await GET(makeRequest({ authorization: 'Token abc' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mocks.mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid' } });
    const res = await GET(makeRequest({ authorization: 'Bearer bad-token' }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Token inválido.');
  });

  it('returns paginated generations for authenticated user', async () => {
    mocks.mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
    mocks.mockRange.mockResolvedValueOnce({
      data: [{ id: '1', niche: 'jewelry', original_image_url: 'http://a', generated_image_url: 'http://b', created_at: new Date().toISOString() }],
      error: null,
      count: 1,
    });

    const res = await GET(makeRequest({ authorization: 'Bearer valid-token' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.generations).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);
  });

  it('clamps page to minimum of 1 for invalid page param', async () => {
    mocks.mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
    mocks.mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    const res = await GET(makeRequest({ authorization: 'Bearer valid-token' }, 'http://localhost/api/generations?page=-5'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBe(1);
  });

  it('returns 500 when database query fails', async () => {
    mocks.mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
    mocks.mockRange.mockResolvedValueOnce({ data: null, error: { message: 'db error' }, count: null });

    const res = await GET(makeRequest({ authorization: 'Bearer valid-token' }));
    expect(res.status).toBe(500);
  });
});
