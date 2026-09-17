import NepaliDate from 'nepali-date-converter';

const NEPALI_MONTHS = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

/** Gregorian date (or ISO string) to a Bikram Sambat date. */
export function toBsDate(value: Date | string): NepaliDate {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  return new NepaliDate(date);
}

/** e.g. "17 Ashwin 2083" */
export function bsLongDate(value: Date | string): string {
  const bs = toBsDate(value);
  return `${bs.getDate()} ${NEPALI_MONTHS[bs.getMonth()]} ${bs.getYear()}`;
}

/** e.g. "17/06/2083" */
export function bsShortDate(value: Date | string): string {
  const bs = toBsDate(value);
  return `${String(bs.getDate()).padStart(2, '0')}/${String(bs.getMonth() + 1).padStart(2, '0')}/${bs.getYear()}`;
}

/** e.g. "17 Ashwin, 13:42" */
export function bsDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const bs = toBsDate(date);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${bs.getDate()} ${NEPALI_MONTHS[bs.getMonth()]}, ${time}`;
}

/** Fiscal year label (e.g. "2083") derived from a Gregorian date. */
export function fiscalYearLabel(value: Date | string = new Date()): string {
  return String(toBsDate(value).getYear());
}
