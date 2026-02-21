import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import PetCard from '../components/PetCard'
import { Link } from 'react-router-dom'
import { Search, Filter, ArrowDownUp } from 'lucide-react'

export default function Available() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('')
    const [breedFilter, setBreedFilter] = useState('')
    const [sortBy, setSortBy] = useState('newest') // newest, oldest
    const [ageFilter, setAgeFilter] = useState('all') // all, baby, young, adult, senior

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

    // Helper to get total months
    const getAgeInMonths = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const dob = new Date(dateOfBirth);
        const now = new Date();
        if (isNaN(dob.getTime())) return 0;
        return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    }

    const filteredAndSortedPets = pets
        .filter(pet => {
            // Search filter
            if (searchTerm && !pet.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Breed filter
            if (breedFilter && pet.breed && !pet.breed.toLowerCase().includes(breedFilter.toLowerCase())) {
                return false;
            }

            // Age filter
            if (ageFilter !== 'all') {
                const months = getAgeInMonths(pet.date_of_birth);
                if (ageFilter === 'baby' && months >= 6) return false; // < 6 months
                if (ageFilter === 'young' && (months < 6 || months > 24)) return false; // 6mo - 2yrs
                if (ageFilter === 'adult' && (months <= 24 || months > 96)) return false; // 2yrs - 8yrs
                if (ageFilter === 'senior' && months <= 96) return false; // > 8yrs
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Available for Adoption</h1>
                <p className="text-slate-600">Meet our lovely pets waiting for a forever home.</p>
            </header>

            <div className="glass p-4 rounded-xl mb-8 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/80 rounded-lg border-none hover:bg-white focus:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex-1 relative min-w-[150px]">
                    <input
                        type="text"
                        placeholder="Filter by breed..."
                        value={breedFilter}
                        onChange={(e) => setBreedFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-white/80 rounded-lg border-none hover:bg-white focus:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/60 p-1 rounded-lg">
                        <Filter size={18} className="text-slate-500 ml-2" />
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            className="bg-transparent border-none text-slate-700 font-medium py-1.5 focus:ring-0 outline-none w-full cursor-pointer hover:text-brand transition-colors"
                        >
                            <option value="all">All Ages</option>
                            <option value="baby">Baby (&lt; 6 months)</option>
                            <option value="young">Young (6 mos - 2 yrs)</option>
                            <option value="adult">Adult (2 - 8 yrs)</option>
                            <option value="senior">Senior (&gt; 8 yrs)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/60 p-1 rounded-lg">
                        <ArrowDownUp size={18} className="text-slate-500 ml-2" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-slate-700 font-medium py-1.5 focus:ring-0 outline-none w-full cursor-pointer hover:text-brand transition-colors"
                        >
                            <option value="newest">Recently Added</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : filteredAndSortedPets.length === 0 ? (
                <div className="text-center py-20 bg-white/60 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm pt-28 pb-28">
                    <p className="text-slate-500 text-lg font-medium">No pets matched your criteria. Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedPets.map((pet) => (
                        <Link key={pet.id} to={`/pet/${pet.id}`}>
                            <PetCard pet={pet} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
