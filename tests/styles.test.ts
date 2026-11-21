import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// jsdom cannot compute these styles, so pin the rules in the stylesheet itself.
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('focus ring switches to mist on dark surfaces', () => {
  expect(css).toMatch(/\.bg-ink :focus-visible,\s*\.bg-slate :focus-visible,\s*dialog :focus-visible\s*\{\s*outline-color: var\(--color-mist\);/);
});

test('focused elements are not hidden under the mobile sticky header', () => {
  expect(css).toMatch(/html\s*\{[^}]*scroll-padding-top: 4rem/);
  expect(css).toMatch(/@media \(min-width: 64rem\)\s*\{\s*html\s*\{\s*scroll-padding-top: 0/);
});
