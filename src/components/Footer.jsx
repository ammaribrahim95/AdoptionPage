import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Instagram, Phone, Mail, MapPin, Heart } from 'lucide-react'

export default function Footer() {
    const [adoptedCount, setAdoptedCount] = useState(0)

    useEffect(() => {
        const fetchAdoptedCount = async () => {
            const { count, error } = await supabase
                .from('pets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'adopted')

            if (!error) {
                setAdoptedCount(count || 0)
            }
        }

        fetchAdoptedCount()
    }, [])

    return (
        <footer className="bg-[#b75960] text-white py-12 mt-auto">
            <div className="container mx-auto px-6 max-w-5xl flex flex-col items-center text-center">

                {/* Brand Logo & Name */}
                <div className="mb-6 flex flex-col items-center">
                    <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="The A Pawstrophe Logo" className="w-40 h-40 -mt-12 -mb-2 object-cover drop-shadow-md relative z-10" />
                    <h3 className="text-2xl font-black tracking-tight mb-2 relative z-20">The A Pawstrophe</h3>
                    <p className="text-white/80 font-medium max-w-md relative z-20">
                        Connecting loving families with furry friends. Every adoption saves a life.
                    </p>
                </div>

                {/* Minimal Stats */}
                <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full mb-10 border border-white/20">
                    <Heart className="fill-white" size={18} />
                    <span className="font-bold">{adoptedCount} Lives Changed</span>
                </div>

                {/* Clean Contact Row */}
                <div className="flex flex-wrap justify-center gap-8 mb-10">
                    <a href="https://instagram.com/theapawstrophe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-200 transition-colors font-medium">
                        <Instagram size={20} /> @theapawstrophe
                    </a>
                    <a href="https://wa.me/60127953577" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-200 transition-colors font-medium">
                        <Phone size={20} /> +60 12-795 3577
                    </a>
                    <a href="mailto:theapawstrophe@gmail.com" className="flex items-center gap-2 hover:text-slate-200 transition-colors font-medium">
                        <Mail size={20} /> Email Us
                    </a>
                </div>

                {/* Minimal Links */}
                <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-bold text-white/80">
                    <a href="/" className="hover:text-white transition-colors">Home</a>
                    <a href="/available" className="hover:text-white transition-colors">Available Pets</a>
                    <a href="/adopted" className="hover:text-white transition-colors">Success Stories</a>
                    <a href="/admin" className="hover:text-white transition-colors">Admin Login</a>
                </div>

                {/* Copyright */}
                <div className="w-full border-t border-white/20 pt-8 text-sm text-white/60 font-medium">
                    &copy; {new Date().getFullYear()} The A Pawstrophe. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
