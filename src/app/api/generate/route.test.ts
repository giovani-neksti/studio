import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockUpload: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    auth: { getUser: mocks.mockGetUser },
    rpc: mocks.mockRpc,
    storage: { from: vi.fn(() => ({ upload: mocks.mockUpload })) },
    from: vi.fn(() => ({ insert: mocks.mockInsert })),
  },
}));

vi.mock('google-auth-library', () => ({
  GoogleAuth: vi.fn(() => ({ getAccessToken: vi.fn().mockResolvedValue('fake-token') })),
}));

vi.mock('@/lib/resend', () => ({
  sendCreditsExhaustedEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('img')),
  })),
}));

import { POST } from './route';

function makeFormRequest(fields: Record<string, string | File[]>, token?: string): Request {
  const form = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (Array.isArray(val)) val.forEach(f => form.append(key, f));
    else form.append(key, val);
  }
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: form,
  });
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

const VALID_SELECTIONS = JSON.stringify({ bgTab: 'solid', displayTab: 'expositor' });
const VALID_FILE = makeFile('photo.jpg', 'image/jpeg', 100);
const VALID_TOKEN = 'valid-token';
const VALID_USER = { data: { user: { id: 'u1', email: 'a@b.com' } }, error: null };

describe('POST /api/generate — auth & credits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when Authorization header is missing', async () => {
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files: [VALID_FILE] });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mocks.mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid' } });
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files: [VALID_FILE] }, 'bad-token');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user has no credits', async () => {
    mocks.mockGetUser.mockResolvedValueOnce(VALID_USER);
    mocks.mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'no credits' } });
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files: [VALID_FILE] }, VALID_TOKEN);
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/generate — file validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetUser.mockResolvedValue(VALID_USER);
    mocks.mockRpc.mockResolvedValue({ data: 2, error: null });
  });

  it('returns 400 when no files are attached', async () => {
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry' }, VALID_TOKEN);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when more than 5 files are attached', async () => {
    const files = Array.from({ length: 6 }, (_, i) => makeFile(`f${i}.jpg`, 'image/jpeg', 100));
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files }, VALID_TOKEN);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Máximo/);
  });

  it('returns 400 for unsupported file type (PDF)', async () => {
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files: [makeFile('doc.pdf', 'application/pdf', 100)] }, VALID_TOKEN);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Formato não suportado/);
  });

  it('returns 400 when a file exceeds 10 MB', async () => {
    const bigFile = makeFile('big.jpg', 'image/jpeg', 11 * 1024 * 1024);
    const req = makeFormRequest({ selections: VALID_SELECTIONS, niche: 'jewelry', files: [bigFile] }, VALID_TOKEN);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/excede o limite/);
  });
});
