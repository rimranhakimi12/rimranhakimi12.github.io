// Single source for personal details. Never add a phone number here.
export const site = {
  name: 'Raja Imran Hakimi',
  monogram: 'RH',
  title: 'Full-stack Developer',
  tagline: 'Front-end focused full-stack developer building fast, accessible web apps.',
  description: 'Raja Imran\'s portfolio, a front-end focused full-stack developer.',
  bio: [
    'I am a recent graduate who enjoys turning designs into fast, accessible interfaces, and wiring them to solid back ends.',
    'I am looking for a junior front-end or full-stack role where I can ship real features and keep learning.',
  ],
  /** General area only, shown on the About postcard's postmark. */
  location: 'Kuala Lumpur',
  email: 'rimranhakimi@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/rimranhakimi12', icon: '/github-logo.png' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/raja-imran-hakimi/', icon: '/linkedin.png' },
  ],
} as const;

export const navSections = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
] as const;
