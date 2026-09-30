import { useMemo, useState } from 'react';
import { LABELS, fmtDate, isBlank } from '../format.js';

const PAGE_SIZE = 25;

export default function ContactsTable({ rows, loaded, loading }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 1 });
  const [page, setPage] = useState(1);

  const columns = useMemo(() => (rows.length ? Object.keys(rows[0]) : Object.keys(LABELS)), [rows]);
  const sortKey = columns.includes(sort.key) ? sort.key : columns[0];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? rows.filter((r) => columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q)))
      : rows.slice();
    return matches.sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      if (isBlank(x) && isBlank(y)) return 0;
      if (isBlank(x)) return 1; // blanks always last
      if (isBlank(y)) return -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * sort.dir;
      return String(x).localeCompare(String(y)) * sort.dir;
    });
  }, [rows, columns, query, sortKey, sort.dir]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  function sortBy(col) {
    setSort({ key: col, dir: col === sortKey ? -sort.dir : 1 });
    setPage(1);
  }

  let state = null;
  if (!loaded) state = loading ? 'Loading…' : 'No data loaded.';
  else if (!rows.length) state = 'The table is empty.';
  else if (!list.length) state = 'No contacts match your search.';

  return (
    <section className="card">
      <div className="toolbar">
        <strong>Contacts</strong>
        <input
          type="search"
          placeholder="Search all columns…"
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} onClick={() => sortBy(col)}>
                  {LABELS[col] || col}
                  {col === sortKey && <span className="arrow">{sort.dir === 1 ? '▲' : '▼'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={row.id ?? start + i}>
                {columns.map((col) => <Cell key={col} col={col} value={row[col]} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {state && <div className="state">{state}</div>}
      <div className="pager">
        <span>
          {list.length > 0 &&
            `Showing ${start + 1}–${start + slice.length} of ${list.length.toLocaleString()}`}
        </span>
        <div className="controls">
          <button onClick={() => setPage(current - 1)} disabled={current <= 1}>Previous</button>
          <span>Page {current} of {pages}</span>
          <button onClick={() => setPage(current + 1)} disabled={current >= pages}>Next</button>
        </div>
      </div>
    </section>
  );
}

function Cell({ col, value }) {
  if (isBlank(value)) return <td className="empty">—</td>;
  if (col === 'extracted_at') return <td>{fmtDate(value)}</td>;
  if (col === 'source_url' && /^https?:\/\//i.test(value)) {
    return (
      <td>
        <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
      </td>
    );
  }
  return <td className={col === 'id' ? 'num' : undefined}>{String(value)}</td>;
}
