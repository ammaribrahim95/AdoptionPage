'use client'

import { calculateDynamicAge } from '@/lib/helpers'

export default function PetCard({ pet, isAdopted = false }) {
    const statusColors = {
        available: 'bg-green-100 text-green-700',
        adopted: 'bg-brand-lighter/50 text-brand',
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all overflow-hidden border border-slate-100 group cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={pet.image_url || 'https://placehold.co/400x400?text=No+Image'}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[pet.status] || 'bg-gray-100 text-gray-600'}`}>
                        {isAdopted ? '❤️ Adopted' : pet.status}
                    </span>
                </div>
            </div>

            <div className="p-3">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate flex-1 mr-2">{pet.name}</h3>
                    <span className="text-xs font-semibold flex items-center gap-0.5 text-slate-500 flex-shrink-0">
                        {pet.gender}
                        {pet.gender?.toLowerCase() === 'male' ? (
                            <img src="/male.png" alt="Male" className="w-3 h-3 inline-block" />
                        ) : pet.gender?.toLowerCase() === 'female' ? (
                            <img src="/female.png" alt="Female" className="w-3 h-3 inline-block" />
                        ) : null}
                    </span>
                </div>

                <p className="text-xs text-slate-400 mb-1.5">{pet.breed} • {calculateDynamicAge(pet.date_of_birth)}</p>

                {isAdopted ? (
                    <p className="text-xs text-brand-light italic truncate">
                        &quot;Happy in a new home!&quot;
                    </p>
                ) : (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {pet.description}
                    </p>
                )}
            </div>
        </div>
    )
}
