import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
    const { id } = await params

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: pet } = await supabase
            .from('pets')
            .select('image_url')
            .eq('id', id)
            .single()

        if (!pet?.image_url) {
            return Response.redirect(new URL('/favicon.png', request.url), 302)
        }

        // Redirect to the public Supabase URL directly
        // This is fast (no image proxying needed) and Supabase storage is public (CORS: *)
        return Response.redirect(pet.image_url, 302)
    } catch (error) {
        console.error('OG image error:', error)
        return Response.redirect(new URL('/favicon.png', request.url), 302)
    }
}
