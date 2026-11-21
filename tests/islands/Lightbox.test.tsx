// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test } from 'vitest';
import Lightbox from '../../src/components/islands/Lightbox';

// jsdom does not implement <dialog> modality; emulate open/close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const images = [1, 2, 3].map((n) => ({ thumb: `/t${n}.png`, full: `/f${n}.png`, alt: `Screen ${n}`, caption: `Caption ${n}` }));

test('opens at the clicked image, arrows move without wrapping, Esc restores focus', async () => {
  const user = userEvent.setup();
  render(<Lightbox images={images} />);
  const thumb2 = screen.getByRole('button', { name: /Screen 2/ });
  await user.click(thumb2);

  const dialog = screen.getByRole('dialog', { hidden: true });
  expect(dialog).toHaveAttribute('open');
  expect(dialog).toHaveAccessibleName('Screen 2');

  await user.keyboard('{ArrowRight}');
  expect(dialog).toHaveAccessibleName('Screen 3');
  await user.keyboard('{ArrowRight}');
  expect(dialog).toHaveAccessibleName('Screen 3');

  await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
  expect(dialog).toHaveAccessibleName('Screen 1');

  await user.keyboard('{Escape}');
  expect(dialog).not.toHaveAttribute('open');
  expect(thumb2).toHaveFocus();
});

test('Next image at the last image keeps focus inside the dialog', async () => {
  const user = userEvent.setup();
  render(<Lightbox images={images} />);
  await user.click(screen.getByRole('button', { name: /Screen 2/ }));
  const next = screen.getByRole('button', { name: 'Next image', hidden: true });
  await user.click(next);
  expect(next).toHaveAttribute('aria-disabled', 'true');
  expect(next).not.toBeDisabled();
  expect(next).toHaveFocus();
  await user.click(next);
  expect(screen.getByRole('dialog', { hidden: true })).toHaveAccessibleName('Screen 3');
});

test('Tab stays within the open dialog', async () => {
  const user = userEvent.setup();
  render(<Lightbox images={images} />);
  await user.click(screen.getByRole('button', { name: /Screen 1/ }));
  const dialog = screen.getByRole('dialog', { hidden: true });
  for (let i = 0; i < 5; i++) {
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  }
});
