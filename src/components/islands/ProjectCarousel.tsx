import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectCard, { type CardData } from './ProjectCard';

/** Cards shown at the widest layout; also the server-render guess for whether arrows are needed. */
const MAX_VISIBLE = 3;

export default function ProjectCarousel({ projects }: { projects: CardData[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // Arrows show whenever the cards do not all fit; measured once mounted.
  const [showArrows, setShowArrows] = useState(projects.length > MAX_VISIBLE);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setShowArrows(track.scrollWidth > track.clientWidth + 1);
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
    if (!track || (direction === -1 ? atStart : atEnd)) return;
    const item = track.querySelector('li');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = (item?.getBoundingClientRect().width || track.clientWidth / MAX_VISIBLE) + gap;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // aria-disabled (not disabled) so a focused arrow keeps focus when it reaches the end.
  const arrowClass =
    'grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink';

  return (
    <div>
      {showArrows && (
        <div className="mb-4 flex justify-end gap-2">
          <button type="button" className={arrowClass} onClick={() => scrollByCard(-1)} aria-disabled={atStart} aria-label="Previous project">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className={arrowClass} onClick={() => scrollByCard(1)} aria-disabled={atEnd} aria-label="Next project">
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
