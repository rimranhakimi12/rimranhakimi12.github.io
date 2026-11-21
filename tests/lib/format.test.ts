import { expect, test } from 'vitest';
import { formatPeriod } from '../../src/lib/format';

test('ongoing period shows Present', () => {
  expect(formatPeriod(new Date('2025-01-15'))).toBe('Jan 2025 – Present');
});

test('closed period shows both months', () => {
  expect(formatPeriod(new Date('2024-06-01'), new Date('2024-09-30'))).toBe('Jun 2024 – Sep 2024');
});
