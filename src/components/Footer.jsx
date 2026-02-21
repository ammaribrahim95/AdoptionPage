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
        <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
            <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left">

                {/* Brand & Stats */}
                <div>
                    <h3 className="text-2xl font-bold text-teal-400 mb-4">The Apawstrophe</h3>
                    <p className="mb-4">Connecting loving families with furry friends since 2026.</p>
                    <div className="inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-400">Total Lives Changed</p>
                        <p className="text-3xl font-bold text-pink-500 flex items-center justify-center md:justify-start gap-2">
                            <Heart className="fill-current" size={24} />
                            {adoptedCount}
                        </p>
                    </div>
                </div>

                {/* Contact Details */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-center md:justify-start gap-3">
                            <Instagram className="text-pink-500" size={20} />
                            <a href="https://instagram.com/theapawstrophe" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">@theapawstrophe</a>
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-3">
                            <Phone className="text-green-500" size={20} />
                            <a href="https://wa.me/60127953577" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">+60 12-795 3577</a>
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-3">
                            <Mail className="text-blue-500" size={20} />
                            <a href="mailto:theapawstrophe@gmail.com" className="hover:text-teal-400 transition">theapawstrophe@gmail.com</a>
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-3">
                            <MapPin className="text-red-500" size={20} />
                            <span>Klang Valley, Malaysia</span>
                        </li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        <li><a href="/" className="hover:text-teal-400 transition">Home</a></li>
                        <li><a href="/available" className="hover:text-teal-400 transition">Available Pets</a></li>
                        <li><a href="/adopted" className="hover:text-teal-400 transition">Success Stories</a></li>
                        <li><a href="/admin" className="hover:text-teal-400 transition">Admin Login</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} The Apawstrophe. All rights reserved.
            </div>
        </footer>
    )
}
