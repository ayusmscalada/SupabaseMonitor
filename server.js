// Serves the dashboard and proxies Supabase so the secret key never reaches the browser.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

process.loadEnvFile(path.join(__dirname, '.env'));

const { SUPABASE_URL, SUPABASE_KEY, SERVER_IP } = process.env;
const PORT = Number(process.env.PORT) || 3000;
const TABLE = 'gmail_contacts';
const PAGE_SIZE = 1000; // PostgREST returns at most 1000 rows per request by default
const DIST = path.join(__dirname, 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

async function fetchAllRows() {
  const base = SUPABASE_URL.replace(/\/+$/, '');
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${base}/${TABLE}?select=*&order=id.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Supabase responded ${res.status}: ${await res.text()}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Serves the React build produced by `npm run build`.
function serveStatic(pathname, res) {
  let rel;
  try {
    rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
  } catch {
    rel = null;
  }
  const file = rel === null ? null : path.resolve(DIST, rel);
  if (!file || !file.startsWith(DIST + path.sep)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      const missingBuild = rel === 'index.html';
      res.writeHead(missingBuild ? 500 : 404, { 'Content-Type': 'text/plain' });
      res.end(missingBuild ? 'Build not found. Run "npm run build" first.' : 'Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/contacts') {
    try {
      const rows = await fetchAllRows();
      sendJson(res, 200, { rows, fetchedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      sendJson(res, 502, { error: err.message });
    }
    return;
  }

  serveStatic(pathname, res);
});

// Bound to localhost only: the dashboard has no login and the table holds personal data.
server.listen(PORT, `${SERVER_IP}`, () => {
  console.log(`Dashboard running at http://${SERVER_IP}:${PORT}`);
});
