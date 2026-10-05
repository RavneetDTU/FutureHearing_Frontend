const API_ORIGIN = (process.env.API_ORIGIN || 'http://103.55.104.142:5035').replace(/\/$/, '');

const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding']);
const SKIP_RESPONSE_HEADERS = new Set(['connection', 'content-length', 'content-encoding', 'transfer-encoding', 'set-cookie']);

export const config = {
  api: {
    bodyParser: false,
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function upstreamUrl(req) {
  const raw = req.url || '/';
  const queryAt = raw.indexOf('?');
  const pathname = queryAt === -1 ? raw : raw.slice(0, queryAt);
  const search = queryAt === -1 ? '' : raw.slice(queryAt);
  const marker = '/api/proxy';
  const markerAt = pathname.indexOf(marker);
  const path = markerAt === -1 ? pathname : pathname.slice(markerAt + marker.length) || '/';
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}${search}`;
}

function rewriteCookie(cookie) {
  return cookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !/^domain=/i.test(part))
    .join('; ');
}

export default async function handler(req, res) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || SKIP_REQUEST_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await readBody(req) : null;

  let upstream;
  try {
    upstream = await fetch(upstreamUrl(req), {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
      redirect: 'manual',
    });
  } catch {
    res.status(502).json({ message: 'Unable to reach the API server.' });
    return;
  }

  const payload = Buffer.from(await upstream.arrayBuffer());
  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    res.setHeader(key, value);
  });

  const cookies = typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : [];
  if (cookies.length) res.setHeader('set-cookie', cookies.map(rewriteCookie));
  res.send(payload);
}
