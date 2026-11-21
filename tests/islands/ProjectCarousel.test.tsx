// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import ProjectCarousel from '../../src/components/islands/ProjectCarousel';
import type { CardData } from '../../src/components/islands/ProjectCard';

const make = (n: number): CardData[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `p${i + 1}`,
    title: `Project ${i + 1} title`,
    subtitle: 'Subtitle',
    type: i % 2 ? 'client' : 'personal',
    stack: ['A', 'B', 'C', 'D', 'E', 'F'],
    cover: { src: `/c${i}.png`, alt: `Cover ${i + 1}` },
  }));

function stubTrack(track: HTMLElement, { scrollWidth = 1500, clientWidth = 900, scrollLeft = 0 } = {}) {
  Object.defineProperty(track, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(track, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(track, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });
  const scrollBy = vi.fn();
  track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
  return scrollBy;
}

test('arrows are not rendered with 3 or fewer projects', () => {
  render(<ProjectCarousel projects={make(3)} />);
  expect(screen.queryByRole('button', { name: /previous project/i })).toBeNull();
  expect(screen.queryByRole('button', { name: /next project/i })).toBeNull();
});

test('arrows scroll one card and disable at the ends', async () => {
  render(<ProjectCarousel projects={make(5)} />);
  const track = screen.getByRole('list', { name: 'Projects' });
  const scrollBy = stubTrack(track);
  fireEvent.scroll(track);

  const prev = screen.getByRole('button', { name: /previous project/i });
  const next = screen.getByRole('button', { name: /next project/i });
  expect(prev).toHaveAttribute('aria-disabled', 'true');
  expect(next).toHaveAttribute('aria-disabled', 'false');

  await userEvent.click(next);
  expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }));
  expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);

  track.scrollLeft = 600; // scrollWidth - clientWidth
  fireEvent.scroll(track);
  expect(next).toHaveAttribute('aria-disabled', 'true');
  expect(prev).toHaveAttribute('aria-disabled', 'false');
});

test('an arrow at its end keeps focus and does not scroll', async () => {
  render(<ProjectCarousel projects={make(5)} />);
  const track = screen.getByRole('list', { name: 'Projects' });
  const scrollBy = stubTrack(track, { scrollLeft: 600 });
  fireEvent.scroll(track);
  const next = screen.getByRole('button', { name: /next project/i });
  next.focus();
  await userEvent.keyboard('{Enter}');
  expect(next).not.toBeDisabled();
  expect(next).toHaveFocus();
  expect(scrollBy).not.toHaveBeenCalled();
});

test('arrows appear for 3 or fewer projects when the cards overflow', () => {
  render(<ProjectCarousel projects={make(2)} />);
  const track = screen.getByRole('list', { name: 'Projects' });
  stubTrack(track, { scrollWidth: 800, clientWidth: 375 });
  fireEvent.scroll(track);
  expect(screen.getByRole('button', { name: /next project/i })).toBeInTheDocument();
});

test('cards are list items linking to case studies with position text', () => {
  render(<ProjectCarousel projects={make(5)} />);
  const items = [...screen.getByRole('list', { name: 'Projects' }).querySelectorAll<HTMLElement>(':scope > li')];
  expect(items).toHaveLength(5);
  const link = within(items[1]).getByRole('link', { name: /Project 2 title/ });
  expect(link).toHaveAttribute('href', '/projects/p2/');
  expect(items[1]).toHaveTextContent('Project 2 of 5');
  expect(items[1]).toHaveTextContent('Client');
  expect(items[0]).toHaveTextContent('Personal');
});

test('at most 4 stack tags per card', () => {
  render(<ProjectCarousel projects={make(1)} />);
  const tags = screen.getByRole('list', { name: /tech stack/i });
  expect(within(tags).getAllByRole('listitem')).toHaveLength(4);
});
