// Destination catalog. M2A registers the alumni shell/profile; other alumni routes are explicit upcoming stubs.
export const routePaths = {
  public: { home: '/', login: '/login', forgotPassword: '/forgot-password' },
  alumni: {
    home: '/app', network: '/app/network', jobs: '/app/jobs', mentorship: '/app/mentorship',
    events: '/app/events', news: '/app/news', profile: '/app/profile', settings: '/app/settings',
  },
  admin: {
    home: '/admin', alumni: '/admin/alumni', analytics: '/admin/analytics',
    mentorship: '/admin/mentorship', employers: '/admin/employers', jobs: '/admin/jobs',
    events: '/admin/events', surveys: '/admin/surveys', reports: '/admin/reports',
  },
} as const
