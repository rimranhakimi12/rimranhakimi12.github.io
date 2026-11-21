import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      type: z.enum(['client', 'personal']),
      role: z.string(),
      period: z.object({ start: z.coerce.date(), end: z.coerce.date().optional() }),
      status: z.enum(['live', 'in-development', 'completed']),
      stack: z.array(z.string()).min(1),
      cover: image(),
      coverAlt: z.string(),
      gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
      architecture: image().optional(),
      links: z.object({ live: z.url().optional(), source: z.url().optional() }).default({}),
      order: z.number().optional(),
      draft: z.boolean().default(false),
    }),
});

const skills = defineCollection({
  loader: file('src/data/skills.yaml'),
  schema: z.object({ group: z.string(), items: z.array(z.string()) }),
});

const timeline = defineCollection({
  loader: file('src/data/timeline.yaml'),
  schema: z.object({
    kind: z.enum(['education', 'internship', 'part-time']),
    org: z.string(),
    title: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    bullets: z.array(z.string()).default([]),
  }),
});

const certificates = defineCollection({
  loader: file('src/data/certificates.yaml'),
  schema: z.object({ name: z.string(), issuer: z.string(), date: z.coerce.date(), verifyUrl: z.url() }),
});

export const collections = { projects, skills, timeline, certificates };
