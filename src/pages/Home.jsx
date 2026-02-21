import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'
import { Clock, Heart, Share2, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
    const { user } = useAuth()
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUpdates = async () => {
            // Fetch updates (using content, fallback to message if migration not run)
            const { data: updatesData } = await supabase
                .from('adoption_updates')
                .select(`
                  id,
                  title,
                  content,
                  is_published,
                  created_at,
                  pets (
                    id,
                    name,
                    image_url,
                    status
                  )
                `)
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(10)

            // Fetch newest available pets
            const { data: petsData } = await supabase
                .from('pets')
                .select('id, name, description, image_url, status, created_at')
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .limit(10)

            const combined = [
                ...(updatesData || []).map(u => ({
                    type: 'update',
                    id: `update-${u.id}`,
                    created_at: u.created_at,
                    title: u.title,
                    content: u.content,
                    pet: u.pets
                })),
                ...(petsData || []).map(p => ({
                    type: 'new_pet',
                    id: `newpet-${p.id}`,
                    created_at: p.created_at,
                    title: `Welcome, ${p.name}!`,
                    content: `🐾 Say hello to ${p.name}! We just welcomed them to the shelter. ${p.description ? p.description.substring(0, 100) + '...' : ''}`,
                    pet: p
                }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

            setUpdates(combined)
            setLoading(false)
        }

        fetchUpdates()
    }, [])

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden mb-16 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/90 to-brand-lighter/90 mix-blend-multiply z-10" />
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2574&auto=format&fit=crop')] 
                               bg-cover bg-center bg-no-repeat"
                />

                <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-md"
                    >
                        Find Your Forever Friend <span className="inline-block animate-bounce">🐾</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg md:text-2xl text-white/90 mb-10 font-medium max-w-2xl drop-shadow"
                    >
                        Every pet deserves a loving home. Start your journey today and
                        discover the unconditional love of a rescued companion.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            to="/available"
                            className="bg-white text-brand hover:bg-primary px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Browse Pets
                        </Link>
                        {user && (
                            <Link
                                to="/admin"
                                className="bg-brand-lighter hover:bg-brand-light text-slate-800 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <ImageIcon size={20} /> Manage Stories & Pets
                            </Link>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Social Feed Section */}
            <div className="max-w-3xl mx-auto px-4 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-3">
                        Pawsitive <span className="text-brand">Updates</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Follow the journey of our furry friends in real-time.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                ) : updates.length === 0 ? (
                    <div className="text-center py-24 glass rounded-2xl">
                        <p className="text-slate-500 font-medium text-lg">No updates yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {updates.map((update, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                key={update.id}
                                className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100/50 overflow-hidden"
                            >
                                {/* Post Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {update.pet ? (
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                                                <img
                                                    src={update.pet.image_url || 'https://placehold.co/100?text=Pet'}
                                                    alt={update.pet.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">📢</span>
                                            </div>
                                        )}

                                        <div>
                                            {update.title && (
                                                <div className="text-lg font-black text-slate-800 leading-tight mb-1">
                                                    {update.title}
                                                    {update.type === 'new_pet' && <span className="text-xs ml-2 bg-brand/10 text-brand px-2 py-0.5 rounded-full inline-block align-middle">New Arrival!</span>}
                                                </div>
                                            )}
                                            {update.pet ? (
                                                <Link to={`/pet/${update.pet.id}`} className="text-sm font-bold text-brand hover:text-brand-light transition-colors">
                                                    🐾 About {update.pet.name}
                                                </Link>
                                            ) : (
                                                <span className="text-sm font-bold text-slate-500">Shelter Update</span>
                                            )}
                                            <div className="flex items-center text-slate-400 text-xs mt-0.5">
                                                <Clock size={12} className="mr-1" />
                                                <span>{new Date(update.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {update.pet && (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${update.pet.status === 'adopted'
                                            ? 'bg-brand-lighter/50 text-brand'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {update.pet.status === 'adopted' ? '❤️ Adopted' : '🟢 Available'}
                                        </span>
                                    )}
                                </div>

                                {/* Post Content */}
                                <div className="mb-4">
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {update.content}
                                    </p>
                                </div>

                                {/* Image Showcase (Placeholder for multi-image logic later) */}
                                {update.pet?.image_url && (
                                    <div className="w-full h-80 bg-slate-100 rounded-2xl overflow-hidden mb-4 group cursor-pointer relative">
                                        <img
                                            src={update.pet.image_url}
                                            alt={update.pet?.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}

                                {/* Social Actions */}
                                <div className="flex items-center gap-6 pt-3 border-t border-slate-50 mt-2">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors group">
                                        <Heart size={20} className="group-hover:fill-current" />
                                        <span className="text-sm font-semibold">Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors">
                                        <Share2 size={20} />
                                        <span className="text-sm font-semibold">Share</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
