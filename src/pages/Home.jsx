import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

export default function Home() {
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUpdates = async () => {
            const { data, error } = await supabase
                .from('adoption_updates')
                .select(`
          id,
          message,
          created_at,
          pets (
            id,
            name,
            image_url,
            status
          )
        `)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) setUpdates(data)
            setLoading(false)
        }

        fetchUpdates()
    }, [])

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Latest <span className="text-teal-500">Pawsitive</span> News
                </h1>
                <p className="text-slate-600 text-lg">
                    Follow the journey of our furry friends finding their forever homes.
                </p>
            </header>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                </div>
            ) : updates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <p className="text-slate-500">No updates yet. Check back soon!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {updates.map((update) => (
                        <div key={update.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row gap-6 items-start border border-slate-100">
                            <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={update.pets?.image_url || 'https://placehold.co/200?text=No+Image'}
                                    alt={update.pets?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${update.pets?.status === 'adopted' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                        {update.pets?.status}
                                    </span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        <Clock size={14} /> {new Date(update.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    <Link to={`/pet/${update.pets?.id}`} className="hover:text-teal-600 transition">
                                        {update.pets?.name}
                                    </Link>
                                </h2>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {update.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
