'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Check, Calendar, Heart, Share2 } from 'lucide-react'
import { calculateDynamicAge } from '@/lib/helpers'
import AdoptionFormModal from '@/components/AdoptionFormModal'

export default function PetDetailContent({ initialPet, petId }) {
    const router = useRouter()
    const [pet, setPet] = useState(initialPet)
    const [loading, setLoading] = useState(!initialPet)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [shareTooltip, setShareTooltip] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0)
        // If no initial pet data (e.g. client nav), fetch it
        if (!initialPet) {
            const fetchPet = async () => {
                const { data } = await supabase
                    .from('pets')
                    .select('*')
                    .eq('id', petId)
                    .single()

                if (data) setPet(data)
                setLoading(false)
            }
            fetchPet()
        }
    }, [initialPet, petId])

    if (loading) return <div className="text-center py-20">Loading...</div>
    if (!pet) return <div className="text-center py-20">Pet not found.</div>

    const isAdopted = pet.status === 'adopted'

    const handleShare = async () => {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        const urlToShare = `${siteUrl}/pet/${pet.id}`
        const shareData = {
            title: `Meet ${pet.name}!`,
            text: `Check out ${pet.name}, currently available for adoption at The A Pawstrophe!`,
            url: urlToShare
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                copyToClipboard(urlToShare)
            }
        } else {
            copyToClipboard(urlToShare)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setShareTooltip('Link copied!')
            setTimeout(() => setShareTooltip(''), 2000)
        }).catch(err => {
            console.error('Failed to copy: ', err)
        })
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="md:flex">
                <div className="md:w-1/2 h-96 md:h-auto relative bg-gray-100">
                    <img
                        src={pet.image_url || 'https://placehold.co/600x600?text=No+Image'}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                    />
                    {isAdopted && (
                        <div className="absolute inset-0 bg-brand-lighter/60 flex items-center justify-center">
                            <span className="bg-white text-brand px-6 py-2 rounded-full font-bold text-xl uppercase tracking-widest shadow-lg transform -rotate-12">
                                Adopted!
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-8 md:w-1/2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => {
                                if (window.history.state && window.history.state.idx > 0) {
                                    router.back()
                                } else {
                                    router.push('/available')
                                }
                            }}
                            className="inline-flex items-center text-slate-500 hover:text-brand transition cursor-pointer"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </button>

                        <div className="relative">
                            <button
                                onClick={handleShare}
                                className="p-2 text-slate-400 hover:text-brand bg-slate-50 hover:bg-brand-lighter/20 rounded-full transition-colors flex items-center justify-center"
                                title="Share Pet"
                                aria-label="Share this pet"
                            >
                                <Share2 size={20} />
                            </button>
                            {shareTooltip && (
                                <div className="absolute right-0 -top-10 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    {shareTooltip}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">{pet.name}</h1>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg text-slate-500">{pet.breed}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-lg font-bold flex items-center gap-1">
                                    <span className="text-slate-600">{pet.gender}</span>
                                    {pet.gender?.toLowerCase() === 'male' ? (
                                        <img src="/male.png" alt="Male" className="w-6 h-6 inline-block" />
                                    ) : pet.gender?.toLowerCase() === 'female' ? (
                                        <img src="/female.png" alt="Female" className="w-6 h-6 inline-block" />
                                    ) : null}
                                </span>
                            </div>
                        </div>
                        {!isAdopted && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold uppercase">
                                Available
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-600">
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-slate-400 text-xs uppercase font-bold">Age</span>
                            {calculateDynamicAge(pet.date_of_birth)}
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-slate-400 text-xs uppercase font-bold">Posted</span>
                            {new Date(pet.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="prose prose-slate mb-8 flex-grow">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">About {pet.name}</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">{pet.description}</p>

                        {(pet.is_dewormed || pet.is_deflea || pet.is_vaccinated || pet.is_potty_trained || pet.is_neutered) && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Medical &amp; Care Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {pet.is_dewormed && (
                                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                                            <Check size={14} strokeWidth={3} /> Dewormed
                                        </span>
                                    )}
                                    {pet.is_deflea && (
                                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                                            <Check size={14} strokeWidth={3} /> Deflea
                                        </span>
                                    )}
                                    {pet.is_vaccinated && (
                                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                                            <Check size={14} strokeWidth={3} /> Vaccinated
                                        </span>
                                    )}
                                    {pet.is_potty_trained && (
                                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                                            <Check size={14} strokeWidth={3} /> Potty Trained
                                        </span>
                                    )}
                                    {pet.is_neutered && (
                                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                                            <Check size={14} strokeWidth={3} /> Spayed/Neutered
                                        </span>
                                    )}
                                </div>
                                {pet.is_vaccinated && pet.vaccination_date && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/60 text-sm text-slate-500 flex items-center gap-2">
                                        <Calendar size={14} /> Last Vaccinated: <span className="font-semibold text-slate-700">{new Date(pet.vaccination_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isAdopted ? (
                        <button
                            onClick={() => setIsApplyModalOpen(true)}
                            className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition text-center flex items-center justify-center gap-2"
                        >
                            <Heart className="fill-current" /> I want to Adopt {pet.name}
                        </button>
                    ) : (
                        <div className="bg-brand-lighter/20 p-4 rounded-xl text-center">
                            <p className="text-brand font-medium">This pet has found a loving home. ❤️</p>
                        </div>
                    )}
                </div>
            </div>

            {isApplyModalOpen && (
                <AdoptionFormModal
                    pet={pet}
                    onClose={() => setIsApplyModalOpen(false)}
                />
            )}
        </div>
    )
}
