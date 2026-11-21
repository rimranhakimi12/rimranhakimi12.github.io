import { expect, test } from 'vitest';
import { excludeDrafts, getAdjacent, sortProjects } from '../../src/lib/projects';

const p = (id: string, start: string, extra: Record<string, unknown> = {}) => ({
  id,
  data: { period: { start: new Date(start) }, draft: false, ...extra },
});

test('sortProjects puts ordered entries first, then newest first', () => {
  const sorted = sortProjects([
    p('old', '2023-01-01'),
    p('second', '2022-01-01', { order: 2 }),
    p('new', '2025-01-01'),
    p('first', '2021-01-01', { order: 1 }),
  ]);
  expect(sorted.map((e) => e.id)).toEqual(['first', 'second', 'new', 'old']);
});

test('excludeDrafts drops draft entries', () => {
  const kept = excludeDrafts([p('a', '2024-01-01'), p('b', '2024-01-01', { draft: true })]);
  expect(kept.map((e) => e.id)).toEqual(['a']);
});

test('getAdjacent does not wrap', () => {
  expect(getAdjacent(['a', 'b', 'c'], 0)).toEqual({ prev: undefined, next: 'b' });
  expect(getAdjacent(['a', 'b', 'c'], 2)).toEqual({ prev: 'b', next: undefined });
});
