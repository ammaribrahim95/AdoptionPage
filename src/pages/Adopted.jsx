import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import PetCard from '../components/PetCard'
import { Link } from 'react-router-dom'

export default function Adopted() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPets = async () => {
            const { data } = await supabase
                .from('pets')
                .select('*')
                .eq('status', 'adopted')
                .order('created_at', { ascending: false })

            if (data) setPets(data)
            setLoading(false)
        }

        fetchPets()
    }, [])

    return (
        <div>
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-brand">Happy Tails 🏠</h1>
                <p className="text-slate-600">See all the pets that found their forever families.</p>
            </header>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : pets.length === 0 ? (
                <div className="text-center py-20 bg-brand-lighter/20 rounded-xl">
                    <p className="text-brand">No adoptions yet. Be the first!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <Link key={pet.id} to={`/pet/${pet.id}`}>
                            <PetCard pet={pet} isAdopted={true} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
