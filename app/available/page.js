'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import PetCard from '@/components/PetCard'
import { Search, Filter, ArrowDownUp } from 'lucide-react'
import { useScrollRestore } from '@/hooks/useScrollRestore'

export default function AvailablePage() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState('')
    const [breedFilter, setBreedFilter] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [ageFilter, setAgeFilter] = useState('all')

    useScrollRestore(!loading)

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

    const getAgeInMonths = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const dob = new Date(dateOfBirth);
        const now = new Date();
        if (isNaN(dob.getTime())) return 0;
        return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    }

    const filteredAndSortedPets = pets
        .filter(pet => {
            if (searchTerm && !pet.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (breedFilter && pet.breed && !pet.breed.toLowerCase().includes(breedFilter.toLowerCase())) {
                return false;
            }
            if (ageFilter !== 'all') {
                const months = getAgeInMonths(pet.date_of_birth);
                if (ageFilter === 'baby' && months >= 6) return false;
                if (ageFilter === 'young' && (months < 6 || months > 24)) return false;
                if (ageFilter === 'adult' && (months <= 24 || months > 96)) return false;
                if (ageFilter === 'senior' && months <= 96) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            return 0;
        });

    return (
        <div>
            <header className="mb-4 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Available for Adoption</h1>
                <p className="text-sm md:text-base text-slate-600">Meet our lovely pets waiting for a forever home.</p>
            </header>

            {/* Filter Bar — stacked on mobile, row on desktop */}
            <div className="glass p-3 md:p-4 rounded-xl mb-4 md:mb-8 shadow-sm flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/80 rounded-lg border-none hover:bg-white focus:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Filter by breed..."
                        value={breedFilter}
                        onChange={(e) => setBreedFilter(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/80 rounded-lg border-none hover:bg-white focus:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                        <Filter size={14} className="text-slate-500 flex-shrink-0" />
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            className="bg-transparent border-none text-slate-700 font-medium text-sm py-1 focus:ring-0 outline-none w-full cursor-pointer"
                        >
                            <option value="all">All Ages</option>
                            <option value="baby">Baby (&lt; 6m)</option>
                            <option value="young">Young (6m-2y)</option>
                            <option value="adult">Adult (2-8y)</option>
                            <option value="senior">Senior (&gt; 8y)</option>
                        </select>
                    </div>

                    <div className="flex-1 flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                        <ArrowDownUp size={14} className="text-slate-500 flex-shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-slate-700 font-medium text-sm py-1 focus:ring-0 outline-none w-full cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : filteredAndSortedPets.length === 0 ? (
                <div className="text-center py-16 bg-white/60 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm">
                    <p className="text-slate-500 text-base font-medium">No pets matched your criteria. Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {filteredAndSortedPets.map((pet) => (
                        <Link key={pet.id} href={`/pet/${pet.id}`}>
                            <PetCard pet={pet} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
