import { MetadataRoute } from 'next';

const BASE = 'https://roofsolar.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                       lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/calculator`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/installers`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/auth/login`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
