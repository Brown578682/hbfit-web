import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://honorboundfit.com'
  const now = new Date()

  const staticRoutes = [
    { url: base, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${base}/membership`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/join`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/schedule`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${base}/about`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/contact`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/events`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${base}/core-values`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/media`, priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  const heroRoutes = [
    'john-basilone', 'mitchell-paige', 'william-g-leftwich', 'daniel-b-chaires',
    'kevin-b-joyce', 'steven-a-valdez', 'anthony-capra', 'toby-humphrey',
    'jason-mooney', 'jessica-cheney', 'mia-ethridge', 'uss-cole-victims',
  ].map(slug => ({
    url: `${base}/hero-tree/${slug}`,
    priority: 0.5,
    changeFrequency: 'yearly' as const,
    lastModified: now,
  }))

  return [
    ...staticRoutes.map(r => ({ ...r, lastModified: now })),
    ...heroRoutes,
  ]
}
