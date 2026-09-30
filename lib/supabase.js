// Shared by server.js (local) and api/contacts.js (Vercel).
const TABLE = 'gmail_contacts';
const PAGE_SIZE = 1000; // PostgREST returns at most 1000 rows per request by default

async function fetchAllRows() {
  const { SUPABASE_URL, SUPABASE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variable');
  }
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

module.exports = { fetchAllRows };
