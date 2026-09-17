import test from 'node:test';
import assert from 'node:assert/strict';
import { bsLongDate, bsShortDate, bsDateTime, fiscalYearLabel } from '../src/lib/date';

test('bsLongDate converts a Gregorian date to Bikram Sambat', () => {
  assert.equal(bsLongDate('2026-09-17'), '1 Ashwin 2083');
});

test('bsLongDate accepts a Date instance', () => {
  assert.equal(bsLongDate(new Date('2026-05-14T00:00:00')), '31 Baisakh 2083');
});

test('bsShortDate is zero-padded DD/MM/YYYY', () => {
  assert.equal(bsShortDate('2026-09-17'), '01/06/2083');
});

test('bsDateTime keeps the wall-clock time and uses a BS date', () => {
  const out = bsDateTime(new Date(2026, 8, 17, 13, 42));
  assert.equal(out, '1 Ashwin, 13:42');
});

test('bsDateTime zero-pads the time', () => {
  const out = bsDateTime(new Date(2026, 8, 17, 9, 5));
  assert.equal(out, '1 Ashwin, 09:05');
});

test('fiscalYearLabel returns the BS year', () => {
  assert.equal(fiscalYearLabel('2026-09-17'), '2083');
});

test('fiscal year rolls over at Baisakh, not January', () => {
  // 2026-04-13 is 31 Chaitra 2082, the last day of the previous BS year.
  assert.equal(fiscalYearLabel('2026-04-13'), '2082');
  assert.equal(fiscalYearLabel('2026-04-14'), '2083');
});
