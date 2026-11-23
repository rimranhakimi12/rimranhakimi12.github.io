import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, expect, test } from 'vitest';
import Favourites from '../../src/components/about/Favourites.astro';
import Hobbies from '../../src/components/about/Hobbies.astro';
import Setup from '../../src/components/about/Setup.astro';
import Stats from '../../src/components/about/Stats.astro';
import Tinkering from '../../src/components/about/Tinkering.astro';
import HomeAbout from '../../src/components/home/About.astro';
import AboutView from '../../src/components/about/AboutView.astro';
import guitar from '../../src/content/about/guitar-1.jpg';

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
    [Setup, 'items'],
    [Favourites, 'items'],
    [Stats, 'items'],
  ] as const) {
    const html = await container.renderToString(Component, { props: { [prop]: [] } });
    // Ignore the component's hoisted <script>; the markup itself must be empty.
    expect(html.replace(/<script\b[^>]*><\/script>/g, '').trim()).toBe('');
  }
});

test('sections render their items', async () => {
  const hobbies = await container.renderToString(Hobbies, { props: { items: [{ title: 'Guitar', text: 'Strum', photos: [] }] } });
  expect(hobbies).toMatch(/<h3[^>]*>Guitar<\/h3>/);
  const setup = await container.renderToString(Setup, { props: { items: [{ group: 'Desk', gear: ['Ryzen build', '27" monitor'] }] } });
  expect(setup).toMatch(/<dt[^>]*>Desk<\/dt>[\s\S]*<dd[^>]*>[\s\S]*<li[^>]*>Ryzen build<\/li>[\s\S]*<li[^>]*>27&quot; monitor<\/li>/);
  const stats = await container.renderToString(Stats, { props: { items: [{ value: '+12', label: 'Songs learned' }] } });
  expect(stats).toContain('+12');
  expect(stats).toContain('Songs learned');
});

test('hobby photos stack, top card first, with a shuffle button only when there is more than one', async () => {
  const photo = (alt: string) => ({ src: guitar, alt });
  const html = await container.renderToString(Hobbies, {
    props: {
      items: [
        { title: 'Manga', text: 'Read', photos: [photo('One'), photo('Two'), photo('Three')] },
        { title: 'Guitar', text: 'Strum', photos: [photo('Solo')] },
      ],
    },
  });
  const [manga, guitarItem] = html.split(/<li\b/).slice(1);
  expect([...manga.matchAll(/data-pos="(\d)"/g)].map((m) => m[1])).toEqual(['0', '1', '2']);
  expect([...manga.matchAll(/alt="([^"]+)"/g)].map((m) => m[1])).toEqual(['One', 'Two', 'Three']);
  expect(manga).toMatch(/<button[^>]*type="button"[^>]*data-stack-next[^>]*aria-label="Show next Manga photo"/);
  expect(guitarItem).toContain('alt="Solo"');
  expect(guitarItem).not.toMatch(/<button/);
});

test('about page: text-only hero, every section, links back to projects and contact', async () => {
  // Fixture data: the content store is not available to tests on a fresh clone (CI).
  const data = {
    greeting: "Hey, I'm Imran.",
    hobbies: [{ title: 'Guitar', text: 'Strum', photos: [] }],
    tinkering: [{ title: 'PC building', text: 'Builds' }],
    setup: [{ group: 'Desk', gear: ['PC'] }],
    favourites: [{ title: 'Fav', kind: 'Anime' }],
    stats: [{ value: '+1', label: 'Songs' }],
  };
  const html = await container.renderToString(AboutView, { props: { data }, slots: { default: '<p>Intro</p>' } });
  const hero = html.match(/<header[^>]*data-about-hero[\s\S]*?<\/header>/)?.[0] ?? '';
  expect(hero).toMatch(/<h1[^>]*>[\s\S]*Hey, I(?:'|&#39;)m Imran\.[\s\S]*<\/h1>/);
  expect(hero).not.toMatch(/<img\b/);
  for (const heading of ['Things I enjoy', 'Things I tinker with', 'My setup', 'Favourites shelf', 'Fun numbers']) {
    expect(html).toContain(heading);
  }
  expect(html).toMatch(/href="\/#projects"/);
  expect(html).toMatch(/href="\/#contact"/);
});
