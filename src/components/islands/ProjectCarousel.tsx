import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectCard, { type CardData } from './ProjectCard';

/** Arrows appear only when there are more projects than the widest layout shows. */
const MAX_VISIBLE = 3;

export default function ProjectCarousel({ projects }: { projects: CardData[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const showArrows = projects.length > MAX_VISIBLE;

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [update]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const item = track.querySelector('li');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = (item?.getBoundingClientRect().width || track.clientWidth / MAX_VISIBLE) + gap;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const arrowClass =
    'grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink';

  return (
    <div>
      {showArrows && (
        <div className="mb-4 flex justify-end gap-2">
          <button type="button" className={arrowClass} onClick={() => scrollByCard(-1)} disabled={atStart} aria-label="Previous project">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className={arrowClass} onClick={() => scrollByCard(1)} disabled={atEnd} aria-label="Next project">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
      <ul
        ref={trackRef}
        onScroll={update}
        aria-label="Projects"
        className="-mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-2 pb-4 pt-2 [scrollbar-width:thin]"
      >
        {projects.map((project, i) => (
          <li
            key={project.slug}
            className="shrink-0 basis-[85%] snap-start md:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
          >
            <ProjectCard project={project} index={i} total={projects.length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
