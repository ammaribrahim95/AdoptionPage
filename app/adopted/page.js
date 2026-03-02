'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import PetCard from '@/components/PetCard'
import { useScrollRestore } from '@/hooks/useScrollRestore'

export default function AdoptedPage() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    useScrollRestore(!loading)

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
            <header className="mb-4 md:mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-brand">Happy Tails 🏠</h1>
                <p className="text-sm md:text-base text-slate-600">See all the pets that found their forever families.</p>
            </header>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : pets.length === 0 ? (
                <div className="text-center py-16 bg-brand-lighter/20 rounded-xl">
                    <p className="text-brand">No adoptions yet. Be the first!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {pets.map((pet) => (
                        <Link key={pet.id} href={`/pet/${pet.id}`}>
                            <PetCard pet={pet} isAdopted={true} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
