/**
 * Maps common footer-link labels to real routes in the app.
 * Unknown labels fall back to '/' so clicks never break navigation.
 */
const MAP = {
  // ── For Clients ─────────────────────────────────────────
  'How to hire':            '/how-it-works',
  'Talent Marketplace':     '/freelancers',
  'Project Catalog':        '/freelancers',
  'Hire an agency':         '/agencies',
  'Enterprise':             '/pricing',
  'Business Plus':          '/pricing',
  'Any hire':               '/freelancers',
  'Contract-to-hire':       '/freelancers',
  'Direct Contracts':       '/freelancers',
  'Hire worldwide':         '/freelancers',
  'Hire in the USA':        '/freelancers',
  'Post a Job':             '/jobs/post',
  'Find Talent':            '/freelancers',
  'Managed Services':       '/agencies',

  // ── For Freelancers / For Talent ────────────────────────
  'How to find work':                       '/how-it-works',
  'Find Work':                              '/jobs',
  'Find freelance jobs worldwide':          '/jobs',
  'Find freelance jobs in the USA':         '/jobs',
  'Create Profile':                         '/register',
  'Community':                              '/blog',
  'Resources':                              '/blog',
  'We work with ads':                       '/blog',
  'Exclusive resources with Freelancer Plus': '/pricing',

  // ── Resources ───────────────────────────────────────────
  'Help & support':         '/how-it-works',
  'Success stories':        '/success-stories',
  'PANDA reviews':          '/reviews',
  'Reviews':                '/reviews',
  'Blog':                   '/blog',
  'Affiliate program':      '/blog',
  'Refer a client':         '/register',
  'Free Business Tools':    '/blog',
  'Release notes':          '/updates',

  // ── Company ─────────────────────────────────────────────
  'About':                  '/',
  'About us':               '/',
  'Leadership':             '/',
  'Investor relations':     '/',
  'Careers':                '/',
  'Our impact':             '/success-stories',
  'Press':                  '/blog',
  'Contact us':             '/how-it-works',
  'Partners':               '/agencies',
  'Trust & Safety':         '/how-it-works',
  'Trust, safety & security': '/how-it-works',
  'Modern slavery statement': '/how-it-works',

  // ── Legal (footer bottom row) ───────────────────────────
  'Privacy Policy':         '/',
  'Terms of Service':       '/',
  'Cookie Policy':          '/',
};

export function resolveFooter(label) {
  return MAP[label] || '/';
}
