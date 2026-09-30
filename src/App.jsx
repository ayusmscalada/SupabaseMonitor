import { useContacts } from './useContacts.js';
import { fmtDate } from './format.js';
import StatTiles from './components/StatTiles.jsx';
import ContactsTable from './components/ContactsTable.jsx';

export default function App() {
  const { rows, fetchedAt, loading, error, reload } = useContacts();

  let updated = 'loading…';
  if (error) updated = 'load failed';
  else if (fetchedAt) updated = `updated ${fmtDate(fetchedAt)}`;

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Supabase Monitor</h1>
          <div className="sub">
            Table <strong>gmail_contacts</strong> · <span>{updated}</span>
          </div>
        </div>
        <button className="primary" onClick={reload} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {error && <div className="error">Could not load data: {error}</div>}

      <StatTiles rows={rows} loaded={fetchedAt !== null} />
      <ContactsTable rows={rows} loaded={fetchedAt !== null} loading={loading} />
    </div>
  );
}
