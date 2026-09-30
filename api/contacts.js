// Vercel serverless function: same response as /api/contacts in server.js.
const { fetchAllRows } = require('../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const rows = await fetchAllRows();
    res.status(200).json({ rows, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
};
