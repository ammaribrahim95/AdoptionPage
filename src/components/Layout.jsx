import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}
