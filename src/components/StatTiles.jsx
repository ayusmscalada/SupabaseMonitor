import { useMemo } from 'react';
import { fmtDate, isBlank } from '../format.js';

export default function StatTiles({ rows, loaded }) {
  const stats = useMemo(() => {
    const emails = new Set(rows.map((r) => String(r.email ?? '').toLowerCase()).filter(Boolean));
    const latest = rows.map((r) => r.extracted_at).filter(Boolean).sort().pop();
    return {
      total: rows.length.toLocaleString(),
      unique: emails.size.toLocaleString(),
      withLocation: rows.filter((r) => !isBlank(r.location)).length.toLocaleString(),
      latest: latest ? fmtDate(latest) : '–',
    };
  }, [rows]);

  const show = (v) => (loaded ? v : '–');

  return (
    <section className="tiles">
      <Tile label="Total contacts" value={show(stats.total)} />
      <Tile label="Unique emails" value={show(stats.unique)} />
      <Tile label="With location" value={show(stats.withLocation)} />
      <Tile label="Latest extraction" value={show(stats.latest)} small />
    </section>
  );
}

function Tile({ label, value, small }) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className={small ? 'value small' : 'value'}>{value}</div>
    </div>
  );
}
