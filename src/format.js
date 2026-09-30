export const LABELS = {
  id: 'ID',
  email: 'Email',
  location: 'Location',
  source_url: 'Source URL',
  extracted_at: 'Extracted at',
  platform: 'Platform',
  Author_IP: 'Author IP',
};

export const isBlank = (v) => v === null || v === undefined || v === '';
export const fmtDate = (v) => new Date(v).toLocaleString();
