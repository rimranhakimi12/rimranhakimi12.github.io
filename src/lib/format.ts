const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function formatPeriod(start: Date, end?: Date): string {
  return `${monthYear.format(start)} – ${end ? monthYear.format(end) : 'Present'}`;
}
