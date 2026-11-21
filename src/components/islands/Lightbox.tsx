import { useRef, useState, type KeyboardEvent } from 'react';

export type LightboxImage = { thumb: string; full: string; alt: string; caption?: string };

const FOCUSABLE = 'button:not([disabled]), a[href]';

export default function Lightbox({ images }: { images: LightboxImage[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [index, setIndex] = useState(0);
  const current = images[index];

  const open = (i: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setIndex(i);
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();
  const go = (delta: 1 | -1) => setIndex((i) => Math.min(images.length - 1, Math.max(0, i + delta)));

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // Keep focus cycling inside the dialog.
      const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
      if (!items.length) return;
      const pos = items.indexOf(document.activeElement as HTMLElement);
      const nextPos = e.shiftKey ? (pos <= 0 ? items.length - 1 : pos - 1) : pos === items.length - 1 ? 0 : pos + 1;
      e.preventDefault();
      items[nextPos].focus();
    }
  };

  // aria-disabled (not disabled) so a focused button keeps focus at the first/last image.
  const navClass =
    'grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-30';

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.full}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="group block w-full overflow-hidden rounded-sm ring-1 ring-ink/10"
            >
              <img
                src={img.thumb}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              />
              {img.caption && <span className="block bg-white px-3 py-2 text-left text-xs text-slate">{img.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label={current.alt}
        onKeyDown={onKeyDown}
        onClose={() => openerRef.current?.focus()}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto max-h-[95dvh] w-[min(1100px,95vw)] max-w-none bg-transparent p-0 backdrop:bg-ink/90"
      >
        <div className="flex flex-col gap-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm" aria-live="polite">
              {index + 1} / {images.length}
              {current.caption && <span className="ml-3 text-mist">{current.caption}</span>}
            </p>
            <button ref={closeRef} type="button" onClick={close} className={navClass} aria-label="Close">
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <img src={current.full} alt={current.alt} className="max-h-[78dvh] w-full rounded-sm object-contain" />
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-disabled={index === 0} className={navClass} aria-label="Previous image">
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-disabled={index === images.length - 1}
              className={navClass}
              aria-label="Next image"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
