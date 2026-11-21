export type CardData = {
  slug: string;
  title: string;
  subtitle: string;
  type: 'client' | 'personal';
  stack: string[];
  cover: { src: string; srcset?: string; alt: string };
};

const MAX_TAGS = 4;

export default function ProjectCard({ project, index, total }: { project: CardData; index: number; total: number }) {
  const { slug, title, subtitle, type, stack, cover } = project;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-ink/5 transition duration-300 focus-within:ring-2 focus-within:ring-mauve hover:-translate-y-1 hover:shadow-md motion-reduce:hover:translate-y-0">
      <img
        src={cover.src}
        srcSet={cover.srcset}
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
        alt={cover.alt}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2">
          <span className="rounded-full bg-mist px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-ink">
            {type === 'client' ? 'Client' : 'Personal'}
          </span>
        </p>
        <h3 className="line-clamp-2 font-display text-xl text-ink">
          {/* The ::after overlay makes the whole card clickable with a single link. */}
          <a href={`/projects/${slug}/`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate">{subtitle}</p>
        <ul aria-label="Tech stack" className="mt-4 flex flex-wrap gap-1.5">
          {stack.slice(0, MAX_TAGS).map((tech) => (
            <li key={tech} className="rounded-sm border border-ink/10 px-2 py-0.5 text-xs text-slate">
              {tech}
            </li>
          ))}
        </ul>
        <p aria-hidden="true" className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-mauve-deep">
          View case study <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </p>
        <span className="sr-only">
          Project {index + 1} of {total}
        </span>
      </div>
    </article>
  );
}
