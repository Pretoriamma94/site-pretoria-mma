/** CSV avec séparateur `;` et BOM UTF-8 (Excel français). */

export function escapeCsvField(value: string | number): string {
  const str = String(value ?? '');
  if (/["\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(
  columns: { header: string; value: (row: T) => string | number }[],
  rows: T[],
): string {
  const header = columns.map((c) => escapeCsvField(c.header)).join(';');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvField(c.value(row))).join(';'),
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
