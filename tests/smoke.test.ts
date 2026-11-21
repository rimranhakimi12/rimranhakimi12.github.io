import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { expect, test } from 'vitest';
import Index from '../src/pages/index.astro';

test('home page renders every section with its anchor', async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const html = await container.renderToString(Index);
  expect(html).toContain('<main');
  for (const id of ['about', 'projects', 'skills', 'timeline', 'certificates', 'contact']) {
    expect(html).toContain(`id="${id}"`);
  }
  // Drafts never reach the carousel.
  expect(html).not.toContain('Work In Progress');
});
