import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, expect, test } from 'vitest';
import Currently from '../../src/components/about/Currently.astro';
import Favourites from '../../src/components/about/Favourites.astro';
import Hobbies from '../../src/components/about/Hobbies.astro';
import Stats from '../../src/components/about/Stats.astro';
import Tinkering from '../../src/components/about/Tinkering.astro';
import HomeAbout from '../../src/components/home/About.astro';
import AboutView from '../../src/components/about/AboutView.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

test('home About section links to the personal page', async () => {
  const html = await container.renderToString(HomeAbout);
  expect(html).toMatch(/<a[^>]*href="\/about\/"[^>]*>[\s\S]*More about me/);
});

test('each personal section renders nothing when its list is empty', async () => {
  for (const [Component, prop] of [
    [Hobbies, 'items'],
    [Tinkering, 'items'],
    [Currently, 'items'],
    [Favourites, 'items'],
    [Stats, 'items'],
  ] as const) {
    const html = await container.renderToString(Component, { props: { [prop]: [] } });
    expect(html.trim()).toBe('');
  }
});

test('sections render their items', async () => {
  const hobbies = await container.renderToString(Hobbies, { props: { items: [{ title: 'Guitar', text: 'Strum', imageAlt: '' }] } });
  expect(hobbies).toMatch(/<h3[^>]*>Guitar<\/h3>/);
  const currently = await container.renderToString(Currently, { props: { items: [{ label: 'Reading', value: 'Berserk' }] } });
  expect(currently).toMatch(/<dt[^>]*>Reading<\/dt>[\s\S]*<dd[^>]*>Berserk<\/dd>/);
  const stats = await container.renderToString(Stats, { props: { items: [{ value: '+12', label: 'Songs learned' }] } });
  expect(stats).toContain('+12');
  expect(stats).toContain('Songs learned');
});

test('about page: text-only hero, every section, links back to projects and contact', async () => {
  // Fixture data: the content store is not available to tests on a fresh clone (CI).
  const data = {
    greeting: "Hey, I'm Imran.",
    hobbies: [{ title: 'Guitar', text: 'Strum', imageAlt: '' }],
    tinkering: [{ title: 'PC building', text: 'Builds' }],
    currently: [{ label: 'Reading', value: 'Manga' }],
    favourites: [{ title: 'Fav', kind: 'Anime' }],
    stats: [{ value: '+1', label: 'Songs' }],
  };
  const html = await container.renderToString(AboutView, { props: { data }, slots: { default: '<p>Intro</p>' } });
  const hero = html.match(/<header[^>]*data-about-hero[\s\S]*?<\/header>/)?.[0] ?? '';
  expect(hero).toMatch(/<h1[^>]*>[\s\S]*Hey, I(?:'|&#39;)m Imran\.[\s\S]*<\/h1>/);
  expect(hero).not.toMatch(/<img\b/);
  for (const heading of ['Things I enjoy', 'Things I tinker with', 'Currently', 'Favourites shelf', 'Fun numbers']) {
    expect(html).toContain(heading);
  }
  expect(html).toMatch(/href="\/#projects"/);
  expect(html).toMatch(/href="\/#contact"/);
});
