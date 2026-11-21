import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import NotFound from '../../src/pages/404.astro';

test('404 page has a heading and a link home', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(NotFound);
  expect(html).toMatch(/<h1\b/);
  expect(html).toMatch(/<a[^>]*href="\/"[^>]*>[\s\S]*?Back to home/);
});
