import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/checkout', '/cart'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
