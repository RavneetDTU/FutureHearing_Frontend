/** Parse a CSV string (quoted fields, BOM). Returns { headers, rows }. */
export function parseCsv(text) {
  const source = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    if (row.length === 1 && row[0] === '' && rows.length === 0) {
      row = [];
      return;
    }
    if (row.some((cell) => cell !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') pushField();
    else if (ch === '\n') {
      pushField();
      pushRow();
    } else if (ch !== '\r') field += ch;
  }
  if (quoted || field !== '' || row.length) {
    pushField();
    pushRow();
  }

  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  return {
    headers,
    rows: rows.slice(1).map((cells) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = cells[index] ?? '';
      });
      return item;
    }),
  };
}

export function toCsv(headers, rows) {
  const escape = (value) => {
    const text = String(value ?? '');
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  return [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
}

export function csvCell(row, ...keys) {
  for (const key of keys) {
    if (!key) continue;
    const match = Object.keys(row).find((header) => header.trim().toLowerCase() === String(key).trim().toLowerCase());
    const value = match ? String(row[match] ?? '').trim() : '';
    if (value) return value;
  }
  return '';
}

/** Short unique-ish code for a scheme name. GEMS/POLMED-style parentheses win. */
export function schemeShortCode(name) {
  const raw = String(name || '').trim();
  const acronym = raw.match(/\(([A-Za-z0-9]{2,12})\)\s*$/);
  if (acronym) return acronym[1].toUpperCase();
  const stem = raw
    .replace(
      /\b(Medical Aid Society|Employees Medical Aid Society|Medical Benefit Fund|Medical Aid Fund|Medical Aid Scheme|Medical Scheme|Medical Fund|Medical Plan|Health Plan|Healthcare Fund|Group Medical Scheme)\b/gi,
      '',
    )
    .replace(/\b(Health|Healthcare)\s*$/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim();
  const parts = stem.split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SCHEME';
  if (parts.length === 1) return parts[0].slice(0, 12).toUpperCase();
  return parts.join('').slice(0, 12).toUpperCase();
}
