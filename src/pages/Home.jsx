import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'
import { Clock, Heart, Share2, Image as ImageIcon, Check } from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
    const { user } = useAuth()
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(null)

    const handleShare = async (update) => {
        let urlToShare = window.location.origin + import.meta.env.BASE_URL;
        let shareTitle = "The A Pawstrophe - Shelter Update";
        let shareText = update.title || "Check out this update!";

        if (update.pet) {
            // Strip trailing slash from BASE_URL if it exists before appending path
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
            urlToShare = window.location.origin + base + `/#/pet/${update.pet.id}`;
            shareTitle = `Meet ${update.pet.name}!`;
            shareText = update.type === 'new_pet' ? `Say hello to ${update.pet.name}! Could you be their forever family?` : update.title;
        }

        const shareData = {
            title: shareTitle,
            text: shareText,
            url: urlToShare
        }

        const copyToFallback = () => {
            navigator.clipboard.writeText(urlToShare).then(() => {
                setCopiedId(update.id)
                setTimeout(() => setCopiedId(null), 2000)
            })
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                copyToFallback()
            }
        } else {
            copyToFallback()
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0)
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
                .select('id, name, description, image_url, status, created_at, gender, is_dewormed, is_deflea, is_vaccinated, is_potty_trained, is_neutered')
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
                ...(petsData || []).map(p => {
                    const messages = [
                        `Could you be ${p.name}'s forever family?`,
                        `This sweet soul is looking for warm cuddles and a loving home.`,
                        `Are you the paw parent ${p.name} has been waiting for?`,
                        `Ready to make a lifetime of memories together?`,
                        `Your home might be the happily ever after this little one deserves.`
                    ];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    return {
                        type: 'new_pet',
                        id: `newpet-${p.id}`,
                        created_at: p.created_at,
                        title: `Say hello to ${p.name}! 🐾`,
                        content: `${randomMessage}\n\n${p.description ? p.description.substring(0, 150) + '...' : ''}`,
                        pet: p
                    };
                })
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

            setUpdates(combined)
            setLoading(false)
        }

        fetchUpdates()
    }, [])

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full min-h-[75svh] lg:min-h-[65svh] flex items-center justify-center overflow-hidden pt-20 pb-10 lg:pt-20 lg:pb-10 mb-16 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-sm bg-[#b75960]">
                {/* Decorative background logo */}
                <div
                    className="absolute inset-0 opacity-10 bg-[length:400px_400px] bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${import.meta.env.BASE_URL}favicon.png')` }}
                />

                <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-2 md:mb-4"
                    >
                        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="The A Pawstrophe Logo" className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 object-cover drop-shadow-xl -mt-14 sm:-mt-16 md:-mt-24 -mb-2 sm:-mb-4 md:-mb-6 relative z-10" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight drop-shadow-md"
                    >
                        Find Your Forever Friend <span className="inline-block animate-bounce">🐾</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-base md:text-2xl text-white/90 mb-8 md:mb-10 font-medium max-w-2xl drop-shadow px-2"
                    >
                        Every pet deserves a loving home. Start your journey today and
                        discover the unconditional love of a rescued companion.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-2"
                    >
                        <Link
                            to="/available"
                            className="bg-white text-[#b75960] hover:bg-slate-50 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Browse Pets
                        </Link>
                        {user && (
                            <Link
                                to="/admin"
                                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-white/30"
                            >
                                <ImageIcon size={20} className="hidden sm:inline-block" /> Manage Stories & Pets
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

                                    {update.type === 'new_pet' && update.pet && (
                                        <div className="mt-5 mb-2 flex flex-col gap-4">
                                            {/* Gender */}
                                            <div className="flex items-center">
                                                <span className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${update.pet.gender?.toLowerCase() === 'male' ? 'bg-blue-50 border-blue-100 text-blue-700' : update.pet.gender?.toLowerCase() === 'female' ? 'bg-pink-50 border-pink-100 text-pink-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="text-slate-800 tracking-wide">{update.pet.gender}</span>
                                                    {update.pet.gender?.toLowerCase() === 'male' ? (
                                                        <img src={`${import.meta.env.BASE_URL}male.png`} alt="Male" className="w-5 h-5 inline-block" />
                                                    ) : update.pet.gender?.toLowerCase() === 'female' ? (
                                                        <img src={`${import.meta.env.BASE_URL}female.png`} alt="Female" className="w-5 h-5 inline-block" />
                                                    ) : null}
                                                </span>
                                            </div>

                                            {/* Health Status */}
                                            {(update.pet.is_dewormed || update.pet.is_deflea || update.pet.is_vaccinated || update.pet.is_potty_trained || update.pet.is_neutered) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {update.pet.is_dewormed && (
                                                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            <Check size={12} strokeWidth={3} /> Dewormed
                                                        </span>
                                                    )}
                                                    {update.pet.is_deflea && (
                                                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            <Check size={12} strokeWidth={3} /> Deflea
                                                        </span>
                                                    )}
                                                    {update.pet.is_vaccinated && (
                                                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            <Check size={12} strokeWidth={3} /> Vaccinated
                                                        </span>
                                                    )}
                                                    {update.pet.is_potty_trained && (
                                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            <Check size={12} strokeWidth={3} /> Potty Trained
                                                        </span>
                                                    )}
                                                    {update.pet.is_neutered && (
                                                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            <Check size={12} strokeWidth={3} /> Spayed/Neutered
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Image Showcase (Placeholder for multi-image logic later) */}
                                {update.pet?.image_url && (
                                    <Link to={`/pet/${update.pet.id}`} className="block w-full h-80 bg-slate-100 rounded-2xl overflow-hidden mb-4 group cursor-pointer relative">
                                        <img
                                            src={update.pet.image_url}
                                            alt={update.pet?.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>
                                )}

                                {/* Social Actions */}
                                <div className="flex items-center gap-6 pt-3 border-t border-slate-50 mt-2">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors group">
                                        <Heart size={20} className="group-hover:fill-current" />
                                        <span className="text-sm font-semibold">Like</span>
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => handleShare(update)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors"
                                        >
                                            <Share2 size={20} />
                                            <span className="text-sm font-semibold">Share</span>
                                        </button>
                                        {copiedId === update.id && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200">
                                                Link copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
