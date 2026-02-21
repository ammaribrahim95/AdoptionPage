import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { ArrowLeft, Check, Calendar, Heart } from 'lucide-react'
import { calculateDynamicAge } from '../utils/helpers'
import AdoptionFormModal from '../components/AdoptionFormModal'

export default function PetDetails() {
    const { id } = useParams()
    const [pet, setPet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

    useEffect(() => {
        const fetchPet = async () => {
            const { data } = await supabase
                .from('pets')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setPet(data)
            setLoading(false)
        }

        fetchPet()
    }, [id])

    if (loading) return <div className="text-center py-20">Loading...</div>
    if (!pet) return <div className="text-center py-20">Pet not found.</div>

    const isAdopted = pet.status === 'adopted'

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
                    <Link to="/available" className="inline-flex items-center text-slate-500 hover:text-brand mb-6 transition">
                        <ArrowLeft size={16} className="mr-1" /> Back to Available Pets
                    </Link>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">{pet.name}</h1>
                            <p className="text-lg text-slate-500">{pet.breed} • {pet.gender}</p>
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
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">About {pet.name}</h3>
                        <p>{pet.description}</p>
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
