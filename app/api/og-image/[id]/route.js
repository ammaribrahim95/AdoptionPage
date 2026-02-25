import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export async function GET(request, { params }) {
    const { id } = await params

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: pet } = await supabase
            .from('pets')
            .select('image_url, name')
            .eq('id', id)
            .single()

        if (!pet?.image_url) {
            // Redirect to fallback favicon
            return Response.redirect(new URL('/favicon.png', request.url), 302)
        }

        // Fetch the image from Supabase storage
        const imageResponse = await fetch(pet.image_url, {
            headers: { 'Accept': 'image/*' },
        })

        if (!imageResponse.ok) {
            return Response.redirect(new URL('/favicon.png', request.url), 302)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

        return new Response(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        })
    } catch (error) {
        console.error('OG image proxy error:', error)
        return Response.redirect(new URL('/favicon.png', request.url), 302)
    }
}
