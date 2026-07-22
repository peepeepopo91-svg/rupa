import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { loadSeoConfig } from '../server/publishServer'
import '../styles.css'

export const Route = createRootRoute({
  loader: async () => {
    try { return await loadSeoConfig() } catch { return null }
  },

  head: (ctx) => {
    const d = ctx.loaderData
    const title     = d?.seoTitle       ?? 'Blue Tiers | #1 Minecraft PvP Tier List'
    const desc      = d?.seoDescription ?? '#1 Tier List for all types of Minecraft PvP players.'
    const keywords  = d?.seoKeywords    ?? 'minecraft, pvp, tier list, blue tiers, rankings'
    const canonical = d?.canonicalUrl?.trim() || 'https://bluetiers.bolt.host'
    const ogImage   = d?.ogImageUrl     ?? ''
    const ga4Id     = d?.ga4Id?.trim()  ?? ''
    const gscTag    = d?.gscVerificationTag?.trim() ?? ''

    // ── Schema.org JSON-LD ─────────────────────────────────────────────────
    const sameAs = [d?.discordLink, d?.twitterLink, d?.youtubeLink].filter(Boolean)
    const schemaWebSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Blue Tiers',
      url: canonical,
      description: desc,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${canonical}/rankings?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
      ...(sameAs.length ? { sameAs } : {}),
      publisher: {
        '@type': 'Organization',
        name: 'Blue Tiers',
        url: canonical,
        logo: { '@type': 'ImageObject', url: `${canonical}/icons/icon-192x192.png` },
      },
    }
    const schemaBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: canonical },
        { '@type': 'ListItem', position: 2, name: 'Rankings',   item: `${canonical}/rankings` },
        { '@type': 'ListItem', position: 3, name: 'Tournament', item: `${canonical}/tournament` },
        { '@type': 'ListItem', position: 4, name: 'Mining',     item: `${canonical}/mining` },
      ],
    }

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport',     content: 'width=device-width, initial-scale=1' },
        { title },
        { name: 'description',  content: desc },
        { name: 'keywords',     content: keywords },
        { name: 'theme-color',  content: '#00BFFF' },
        { name: 'robots',       content: 'index, follow' },
        // Open Graph
        { property: 'og:url',         content: canonical },
        { property: 'og:type',        content: 'website' },
        { property: 'og:title',       content: title },
        { property: 'og:description', content: desc },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        // Twitter Card
        { name: 'twitter:card',        content: ogImage ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title',       content: title },
        { name: 'twitter:description', content: desc },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
        // Google Search Console verification
        ...(gscTag ? [{ name: 'google-site-verification', content: gscTag }] : []),
      ],
      links: [
        { rel: 'canonical', href: canonical },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap',
        },
      ],
      scripts: [
        // JSON-LD structured data (WebSite + BreadcrumbList)
        { type: 'application/ld+json', children: JSON.stringify([schemaWebSite, schemaBreadcrumb]) },
        // Google Analytics 4
        ...(ga4Id ? [
          { src: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`, async: true },
          { children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');` },
        ] : []),
      ],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0B0F17] text-white font-['Inter'] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
