import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, expect, test } from 'vitest';
import About from '../../src/components/home/About.astro';
import Certificates from '../../src/components/home/Certificates.astro';
import Contact from '../../src/components/home/Contact.astro';
import Hero from '../../src/components/home/Hero.astro';
import Skills from '../../src/components/home/Skills.astro';
import Timeline from '../../src/components/home/Timeline.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

const timeline = [
  { kind: 'education', org: 'Uni', title: 'BSc', start: new Date('2021-09-01'), end: new Date('2025-06-30'), bullets: [] },
  { kind: 'part-time', org: 'Studio', title: 'Web Dev', start: new Date('2025-02-01'), bullets: ['Did things'] },
  { kind: 'internship', org: 'Tech', title: 'Intern', start: new Date('2024-06-01'), end: new Date('2024-09-30'), bullets: [] },
] as const;

test('hero: h1 with name, two CTAs, no image, decorative monogram', async () => {
  const html = await container.renderToString(Hero);
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Raja Imran Hakimi[\s\S]*<\/h1>/);
  expect(html).toMatch(/<a[^>]*href="#projects"[^>]*>[\s\S]*View projects/);
  expect(html).toMatch(/<a[^>]*href="#contact"[^>]*>[\s\S]*Get in touch/);
  expect(html).not.toMatch(/<img\b/);
  expect(html).toMatch(/data-monogram[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-monogram/);
});

test('timeline: newest first, Present for ongoing, kind labels', async () => {
  const html = await container.renderToString(Timeline, { props: { entries: timeline } });
  const order = ['Web Dev', 'Intern', 'BSc'].map((t) => html.indexOf(t));
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(html).toContain('Feb 2025 – Present');
  for (const label of ['Education', 'Internship', 'Part-time']) expect(html).toContain(label);
});

test('certificates: verify links name the certificate', async () => {
  const html = await container.renderToString(Certificates, {
    props: { items: [{ name: 'Cloud Cert', issuer: 'AWS', date: new Date('2025-01-01'), verifyUrl: 'https://v.example/1' }] },
  });
  expect(html).toMatch(/<a[^>]*href="https:\/\/v.example\/1"[^>]*>[\s\S]*Verify[\s\S]*Cloud Cert[\s\S]*<\/a>/);
});

test('contact: mailto, copy button, socials, no form', async () => {
  const html = await container.renderToString(Contact);
  expect(html).toMatch(/href="mailto:[^"]+"/);
  expect(html).toMatch(/<button[^>]*data-copy="[^"]+@[^"]+"/);
  expect(html).toContain('GitHub');
  expect(html).toContain('LinkedIn');
  expect(html).not.toMatch(/<form\b/);
});

test('about: postcard with bio, decorative stamp and postmark, link to the personal page', async () => {
  const html = await container.renderToString(About);
  const card = html.match(/<article[^>]*data-postcard[\s\S]*<\/article>/)?.[0] ?? '';
  expect(card).toMatch(/<h2 id="about-heading"/);
  expect(card).toMatch(/<div[^>]*aria-hidden="true"[^>]*data-postmark[\s\S]*Kuala Lumpur[\s\S]*\d{4}/);
  expect(card).toMatch(/<div[^>]*aria-hidden="true"[^>]*data-stamp/);
  expect(card).toMatch(/<a[^>]*href="\/about\/"[^>]*>[\s\S]*More about me/);
  expect(html).toMatch(/<section[^>]*class="[^"]*bg-mist/);
});

test('section ids match the nav anchors', async () => {
  const rendered = await Promise.all([
    container.renderToString(About),
    container.renderToString(Skills, { props: { groups: [{ group: 'Front-end', items: ['React'] }] } }),
    container.renderToString(Timeline, { props: { entries: timeline } }),
    container.renderToString(Certificates, { props: { items: [] } }),
    container.renderToString(Contact),
  ]);
  const ids = rendered.map((h) => h.match(/<section[^>]*id="([^"]+)"/)?.[1]);
  expect(ids).toEqual(['about', 'skills', 'timeline', 'certificates', 'contact']);
});

test('skills: groups follow their order field, not id order', async () => {
  const html = await container.renderToString(Skills, {
    props: {
      groups: [
        { group: 'Back-end', items: ['Node'], order: 2 },
        { group: 'Front-end', items: ['React'], order: 1 },
      ],
    },
  });
  expect(html.indexOf('Front-end')).toBeLessThan(html.indexOf('Back-end'));
});

test('timeline: trail artwork with photos only when photos exist', async () => {
  const photos = [1, 2, 3, 4].map((n) => ({ src: `/p${n}.webp`, srcset: `/p${n}.webp 400w` }));
  const withPhotos = await container.renderToString(Timeline, { props: { entries: timeline, photos } });
  const trail = withPhotos.match(/<div[^>]*data-trail[\s\S]*<\/svg>/)?.[0] ?? '';
  expect(withPhotos).toMatch(/data-trail[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-trail/);
  expect(trail).toContain('<svg');
  for (let n = 1; n <= 4; n++) expect(withPhotos).toContain(`/p${n}.webp`);

  const without = await container.renderToString(Timeline, { props: { entries: timeline } });
  expect(without).not.toContain('data-trail');
  expect(without).not.toMatch(/<img\b/);
});

test('hero: thumbnails loop seamlessly, decorative, with a pause button', async () => {
  const thumbs = [1, 2, 3].map((n) => ({ src: `/t${n}.webp`, srcset: `/t${n}.webp 400w` }));
  const html = await container.renderToString(Hero, { props: { thumbs } });
  const loop = html.match(/<div[^>]*data-hero-loop[\s\S]*?<\/ul>\s*<\/div>/)?.[0] ?? '';
  expect(loop).toMatch(/aria-hidden="true"/);
  // Each thumbnail appears twice so the loop has no visible seam.
  for (let n = 1; n <= 3; n++) expect(loop.match(new RegExp(`/t${n}\.webp"`, 'g'))).toHaveLength(2);
  expect(loop).not.toMatch(/<a\b/);
  expect(html).toMatch(/<button[^>]*data-hero-pause[^>]*aria-pressed="false"/);
  expect(html).not.toContain('data-monogram');
});
