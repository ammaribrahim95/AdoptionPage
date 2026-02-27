import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crawler user-agent patterns (WhatsApp, Facebook, Telegram, Twitter, LinkedIn, etc.)
const CRAWLER_PATTERNS = [
    'WhatsApp',
    'facebookexternalhit',
    'Facebot',
    'TelegramBot',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
    'Pinterest',
    'Googlebot',
    'bingbot',
]

function isCrawler(userAgent) {
    if (!userAgent) return false
    return CRAWLER_PATTERNS.some(pattern => userAgent.includes(pattern))
}

export async function middleware(request) {
    const { pathname } = request.nextUrl
    const userAgent = request.headers.get('user-agent') || ''

    // Only intercept /pet/[id] routes for crawlers
    const petMatch = pathname.match(/^\/pet\/([a-f0-9-]+)$/i)
    if (!petMatch || !isCrawler(userAgent)) {
        return NextResponse.next()
    }

    const petId = petMatch[1]

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adoptionpage.vercel.app'

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.next()
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: pet } = await supabase
            .from('pets')
            .select('id, name, description, image_url')
            .eq('id', petId)
            .single()

        if (!pet) {
            return NextResponse.next()
        }

        const description = pet.description
            ? pet.description.substring(0, 160)
            : `${pet.name} is looking for a forever home!`

        // Use Next.js image optimization to compress the image (2.8MB → ~100KB)
        // WhatsApp won't load images over ~1MB for preview
        const imageUrl = pet.image_url
            ? `${siteUrl}/_next/image?url=${encodeURIComponent(pet.image_url)}&w=1200&q=75`
            : `${siteUrl}/favicon.png`
        const pageUrl = `${siteUrl}/pet/${pet.id}`

        // Return a minimal HTML page with all OG tags properly in <head>
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Meet ${escapeHtml(pet.name)}! 🐾 – The A Pawstrophe</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="Meet ${escapeHtml(pet.name)}! 🐾" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(pet.name)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:site_name" content="The A Pawstrophe" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Meet ${escapeHtml(pet.name)}! 🐾" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
</head>
<body>
    <p>Redirecting...</p>
    <script>window.location.href = "${escapeHtml(pageUrl)}";</script>
    <noscript><a href="${escapeHtml(pageUrl)}">Click here to view ${escapeHtml(pet.name)}</a></noscript>
</body>
</html>`

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        })
    } catch (error) {
        console.error('Middleware OG error:', error)
        return NextResponse.next()
    }
}

function escapeHtml(str) {
    if (!str) return ''
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

export const config = {
    matcher: '/pet/:id*',
}
