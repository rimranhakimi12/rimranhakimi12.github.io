import { getCollection, type CollectionEntry } from 'astro:content';

type Sortable = { data: { order?: number; draft?: boolean; period: { start: Date } } };

export function excludeDrafts<T extends Sortable>(entries: T[]): T[] {
  return entries.filter((e) => !e.data.draft);
}

/** Entries with `order` first (ascending), then the rest newest first. */
export function sortProjects<T extends Sortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ao = a.data.order ?? Infinity;
    const bo = b.data.order ?? Infinity;
    if (ao !== bo) return ao - bo;
    return b.data.period.start.getTime() - a.data.period.start.getTime();
  });
}

export async function getPublishedProjects(): Promise<CollectionEntry<'projects'>[]> {
  return sortProjects(excludeDrafts(await getCollection('projects')));
}

export function getAdjacent<T>(list: T[], index: number): { prev?: T; next?: T } {
  return { prev: list[index - 1], next: list[index + 1] };
}
