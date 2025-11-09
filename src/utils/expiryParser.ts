const MONTHS: Record<string, number> = {
  JAN: 0,
  JANUARY: 0,
  FEB: 1,
  FEBRUARY: 1,
  MAR: 2,
  MARCH: 2,
  APR: 3,
  APRIL: 3,
  MAY: 4,
  JUN: 5,
  JUNE: 5,
  JUL: 6,
  JULY: 6,
  AUG: 7,
  AUGUST: 7,
  SEP: 8,
  SEPT: 8,
  SEPTEMBER: 8,
  OCT: 9,
  OCTOBER: 9,
  NOV: 10,
  NOVEMBER: 10,
  DEC: 11,
  DECEMBER: 11,
};

function normaliseYear(y: number): number {
  // 2-digit year → assume 2000–2049, else 1900s
  if (y < 100) {
    return y <= 49 ? 2000 + y : 1900 + y;
  }
  return y;
}

export function parseExpiryString(raw: string | null | undefined): Date | null {
  if (!raw) return null;

  let s = raw.trim();
  if (!s) return null;

  // Strip common prefixes like "EXP", "Best before", etc.
  s = s.replace(
    /(best before|use by|use-before|expiry|exp\.?|exp date|expires on|bbd)[:\s]*/gi,
    ""
  );

  // Remove commas and normalise whitespace
  s = s.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  // 1) ISO-like: 2025-11-30 or 2025/11/30
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2) Day-first numeric: 30/11/2025, 30-11-25
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = normaliseYear(parseInt(m[3], 10));
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 3) Day + month name + year (with OR without spaces)
  //    This covers:
  //    "1 NOV 26", "1 NOVEMBER 2026", "1NOV26", "01NOV2026"
  m = s.match(/(\d{1,2})\s*([A-Za-z]{3,})\s*(\d{2,4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthName = m[2].toUpperCase();
    const year = normaliseYear(parseInt(m[3], 10));
    const month = MONTHS[monthName];

    if (month !== undefined) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 4) Year + month name + day: "2026 NOV 1", "26NOV1" (rare, but cheap to support)
  m = s.match(/(\d{2,4})\s*([A-Za-z]{3,})\s*(\d{1,2})/);
  if (m) {
    const year = normaliseYear(parseInt(m[1], 10));
    const monthName = m[2].toUpperCase();
    const day = parseInt(m[3], 10);
    const month = MONTHS[monthName];

    if (month !== undefined) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 5) Fallback: let JS try if the string looks date-ish
  const jsDate = new Date(s);
  if (!isNaN(jsDate.getTime())) {
    return jsDate;
  }

  // 6) ISO datetime like "2025-11-30T00:00:00Z"
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch) {
    const d = new Date(isoMatch[1]);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function toIsoDateString(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
