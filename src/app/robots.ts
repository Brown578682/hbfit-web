import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/', '/join/pending'],
      },
    ],
    sitemap: 'https://honorboundfit.com/sitemap.xml',
    host: 'https://honorboundfit.com',
  }
}
