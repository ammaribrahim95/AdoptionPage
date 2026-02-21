import { Calendar, Heart } from 'lucide-react'
import { calculateDynamicAge } from '../utils/helpers'

export default function PetCard({ pet, isAdopted = false }) {
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
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{pet.name}</h3>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {pet.gender}
                    </span>
                </div>

                <p className="text-sm text-slate-500 mb-4">{pet.breed} • {calculateDynamicAge(pet.date_of_birth)}</p>

                {isAdopted ? (
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
