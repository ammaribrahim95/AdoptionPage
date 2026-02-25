import { createClient } from '@supabase/supabase-js'
import PetDetailContent from './PetDetailContent'

// Server-side Supabase client for metadata generation
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  )
}

async function fetchPet(id) {
  const supabase = getServerSupabase()
  const { data } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const pet = await fetchPet(id)

  if (!pet) {
    return {
      title: 'Pet Not Found – The A Pawstrophe',
      description: 'This pet could not be found.',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adoptionpage.netlify.app'
  const description = pet.description
    ? pet.description.substring(0, 160)
    : `${pet.name} is looking for a forever home! Check out this adorable pet at The A Pawstrophe.`

  // Use our own proxy URL so crawlers (WhatsApp, Facebook) can always access the image
  const ogImageUrl = pet.image_url
    ? `${siteUrl}/api/og-image/${pet.id}`
    : `${siteUrl}/favicon.png`

  return {
    title: `${pet.name} – The A Pawstrophe`,
    description: description,
    openGraph: {
      title: `Meet ${pet.name}! 🐾`,
      description: description,
      images: [{ url: ogImageUrl, width: 800, height: 600, alt: pet.name }],
      url: `${siteUrl}/pet/${pet.id}`,
      siteName: 'The A Pawstrophe',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Meet ${pet.name}! 🐾`,
      description: description,
      images: [ogImageUrl],
    },
  }
}

export default async function PetPage({ params }) {
  const { id } = await params
  const pet = await fetchPet(id)
  return <PetDetailContent initialPet={pet} petId={id} />
}
