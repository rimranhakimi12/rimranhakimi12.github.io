import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, expect, test } from 'vitest';
import FactsBlock from '../../src/components/project/FactsBlock.astro';
import ProjectLinks from '../../src/components/project/ProjectLinks.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

const links = (props: Record<string, unknown>) => container.renderToString(ProjectLinks, { props });

test('renders private note when no links', async () => {
  const html = await links({ type: 'client' });
  expect(html).not.toMatch(/<a\b/);
  expect(html).toContain('Source is private');
});

test('only live link: one external link plus private-source note', async () => {
  const html = await links({ type: 'personal', live: 'https://example.com' });
  expect(html.match(/<a\b/g)).toHaveLength(1);
  expect(html).toContain('Live demo');
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain('Source is private');
});

test('both links: two links and no note', async () => {
  const html = await links({ type: 'personal', live: 'https://a.com', source: 'https://b.com' });
  expect(html.match(/<a\b/g)).toHaveLength(2);
  expect(html).not.toContain('Source is private');
});

test('facts block is a description list with human status', async () => {
  const html = await container.renderToString(FactsBlock, {
    props: { role: 'Dev', period: 'Jan 2025 – Present', status: 'in-development', stack: ['React', 'Astro'] },
  });
  expect(html).toContain('<dl');
  for (const term of ['Role', 'Period', 'Status', 'Stack']) expect(html).toMatch(new RegExp(`<dt[^>]*>${term}</dt>`));
  expect(html).toContain('In development');
});
