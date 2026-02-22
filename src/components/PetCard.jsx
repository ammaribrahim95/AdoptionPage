import { Calendar, Heart, Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { calculateDynamicAge } from '../utils/helpers'

export default function PetCard({ pet, isAdopted = false }) {
    const [shareTooltip, setShareTooltip] = useState('')

    const handleShare = async (e) => {
        e.preventDefault() // Prevent navigating to the pet details page if clicking the share button
        const urlToShare = `${window.location.origin}/pet/${pet.id}`
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
            setShareTooltip('Copied!')
            setTimeout(() => setShareTooltip(''), 2000)
        }).catch(err => {
            console.error('Failed to copy: ', err)
        })
    }
    const statusColors = {
        available: 'bg-green-100 text-green-700',
        adopted: 'bg-brand-lighter/50 text-brand',
    }

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-100 group">
            <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                    src={pet.image_url || 'https://placehold.co/400x400?text=No+Image'}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {!isAdopted && (
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[pet.status] || 'bg-gray-100 text-gray-600'}`}>
                            {pet.status}
                        </span>
                    </div>
                )}
                {/* Share Button Overlay */}
                <div className="absolute top-3 left-3 z-10">
                    <button
                        onClick={handleShare}
                        className="bg-white/80 backdrop-blur block p-2 rounded-full shadow-sm hover:bg-white text-slate-500 hover:text-brand transition-all relative"
                        title="Share this pet"
                    >
                        {shareTooltip ? <Copy size={16} className="text-green-500" /> : <Share2 size={16} />}
                        {shareTooltip && (
                            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden md:block">
                                {shareTooltip}
                            </span>
                        )}
                    </button>
                    {/* Mobile toast fallback since hover tooltip won't work well */}
                    {shareTooltip && (
                        <span className="md:hidden absolute top-10 left-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                            {shareTooltip}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{pet.name}</h3>

                    {/* Gender Badge with Dynamic Icon & Color */}
                    <span className="text-sm font-bold flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 shadow-sm">
                        <span className="text-slate-600">{pet.gender}</span>
                        {pet.gender?.toLowerCase() === 'male' ? (
                            <img src={`${import.meta.env.BASE_URL}male.png`} alt="Male" className="w-2.5 h-2.5 inline-block" />
                        ) : pet.gender?.toLowerCase() === 'female' ? (
                            <img src={`${import.meta.env.BASE_URL}female.png`} alt="Female" className="w-2.5 h-2.5 inline-block" />
                        ) : null}
                    </span>
                </div>

                <p className="text-sm text-slate-500 mb-3">{pet.breed} • {calculateDynamicAge(pet.date_of_birth)}</p>

                {/* Medical & Care Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {pet.is_dewormed && (
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Check size={10} strokeWidth={3} /> Dewormed
                        </span>
                    )}
                    {pet.is_deflea && (
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Check size={10} strokeWidth={3} /> Deflea
                        </span>
                    )}
                    {pet.is_vaccinated && (
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Check size={10} strokeWidth={3} /> Vaccinated
                        </span>
                    )}
                    {pet.is_potty_trained && (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Check size={10} strokeWidth={3} /> Potty Trained
                        </span>
                    )}
                    {pet.is_neutered && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Check size={10} strokeWidth={3} /> Spayed/Neutered
                        </span>
                    )}
                </div>                {isAdopted ? (
                    <div className="mt-4 p-3 bg-brand-lighter/20 rounded-lg">
                        <p className="text-sm text-brand-light font-medium italic">
                            "Find happiness in your new home, {pet.name}!"
                        </p>
                    </div>
                ) : (
                    <p className="text-slate-600 line-clamp-3 text-sm">
                        {pet.description}
                    </p>
                )}

                {!isAdopted && (
                    <button className="w-full mt-4 bg-brand hover:bg-brand-light text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <Heart size={18} /> Adopt Me
                    </button>
                )}
            </div>
        </div>
    )
}
