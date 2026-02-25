import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'The A Pawstrophe | Pet Adoption',
  description: 'Connecting loving families with furry friends. Every pet deserves a loving home. Start your journey today and discover the unconditional love of a rescued companion.',
  openGraph: {
    title: 'The A Pawstrophe | Pet Adoption',
    description: 'Connecting loving families with furry friends. Every adoption saves a life.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://adoptionpage.netlify.app',
    siteName: 'The A Pawstrophe',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://adoptionpage.netlify.app'}/favicon.png`,
        width: 512,
        height: 512,
        alt: 'The A Pawstrophe Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'The A Pawstrophe | Pet Adoption',
    description: 'Connecting loving families with furry friends. Every adoption saves a life.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://adoptionpage.netlify.app'}/favicon.png`],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
