import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, expect, test } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

let html = '';
beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(BaseLayout, {
    props: { title: 'Test', description: 'Desc' },
    slots: { default: '<p>content</p>' },
  });
});

test('skip link is the first focusable element', () => {
  const firstLink = html.match(/<(a|button)\b[^>]*>/)?.[0] ?? '';
  expect(firstLink).toContain('href="#main"');
});

test('exactly one main landmark', () => {
  expect(html.match(/<main\b/g)).toHaveLength(1);
  expect(html).toContain('id="main"');
});

test('primary nav has the six section links', () => {
  const nav = html.match(/<nav[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  expect(nav.match(/<a\b/g)).toHaveLength(6);
  for (const id of ['about', 'projects', 'skills', 'timeline', 'certificates', 'contact']) {
    expect(nav).toContain(`href="#${id}"`);
  }
});

test('mobile nav is a dialog opened by a controlling button', () => {
  const dialogId = html.match(/<dialog[^>]*id="([^"]+)"/)?.[1];
  expect(dialogId).toBeTruthy();
  expect(html).toMatch(new RegExp(`<button[^>]*aria-controls="${dialogId}"`));
});

test('no phone-like number appears in visible text', () => {
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  expect(text).not.toMatch(/\+?\d[\d\s-]{7,}\d/);
});
