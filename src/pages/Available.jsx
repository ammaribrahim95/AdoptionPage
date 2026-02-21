import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import PetCard from '../components/PetCard'
import { Link } from 'react-router-dom'

export default function Available() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPets = async () => {
            const { data } = await supabase
                .from('pets')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false })

            if (data) setPets(data)
            setLoading(false)
        }

        fetchPets()
    }, [])

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Available for Adoption</h1>
                <p className="text-slate-600">Meet our lovely pets waiting for a forever home.</p>
            </header>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                </div>
            ) : pets.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500">No pets currently available. Good news!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pets.map((pet) => (
                        <Link key={pet.id} to={`/pet/${pet.id}`}>
                            <PetCard pet={pet} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
