'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import PetForm from '@/components/PetForm'
import StoryForm from '@/components/StoryForm'
import ApplicantDetailModal from '@/components/ApplicantDetailModal'
import { Plus, Pencil, Trash2, Search, LogIn, PawPrint, FileText, Users } from 'lucide-react'

export default function AdminPage() {
    const { user, login, logout } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const [activeTab, setActiveTab] = useState('pets')
    const [pets, setPets] = useState([])
    const [stories, setStories] = useState([])
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)

    const [editingPet, setEditingPet] = useState(null)
    const [showPetForm, setShowPetForm] = useState(false)
    const [editingStory, setEditingStory] = useState(null)
    const [showStoryForm, setShowStoryForm] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState(null)

    const [searchTerm, setSearchTerm] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoginError('')
        const { error } = await login(email, password)
        if (error) setLoginError(error.message)
    }

    const fetchData = async () => {
        setLoading(true)
        const [petsRes, storiesRes, appsRes] = await Promise.all([
            supabase.from('pets').select('*').order('created_at', { ascending: false }),
            supabase.from('adoption_updates').select('*').order('created_at', { ascending: false }),
            supabase.from('adoption_applications').select('*, pets(id, name, image_url)').order('created_at', { ascending: false })
        ])
        if (petsRes.data) setPets(petsRes.data)
        if (storiesRes.data) setStories(storiesRes.data)
        if (appsRes.data) setApplications(appsRes.data)
        setLoading(false)
    }

    useEffect(() => {
        if (user) fetchData()
    }, [user])

    const handleDeletePet = async (e, id) => {
        e.stopPropagation()
        if (!confirm('Delete this pet?')) return
        await supabase.from('pets').delete().eq('id', id)
        fetchData()
    }

    const handleDeleteStory = async (e, id) => {
        e.stopPropagation()
        if (!confirm('Delete this story?')) return
        await supabase.from('adoption_updates').delete().eq('id', id)
        fetchData()
    }

    const handleDeleteApplication = async (id) => {
        await supabase.from('adoption_applications').delete().eq('id', id)
        setSelectedApplication(null)
        fetchData()
    }

    // Login Screen
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="bg-brand/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LogIn className="text-brand" size={28} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Admin Login</h2>
                        <p className="text-slate-500 text-sm mt-1">Sign in to manage your shelter</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand outline-none transition bg-slate-50 focus:bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand outline-none transition bg-slate-50 focus:bg-white"
                                required
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                        <button type="submit" className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 rounded-xl transition shadow-md">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    const filteredPets = pets.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.breed?.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredStories = stories.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredApps = applications.filter(a => a.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Manage pets, stories & applications</p>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 px-4 py-2 rounded-full transition-all text-xs md:text-sm font-bold"
                >
                    Logout
                </button>
            </div>

            {/* Tabs — horizontally scrollable */}
            <div className="flex gap-2 mb-4 md:mb-8 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {[
                    { key: 'pets', label: 'Pets', icon: PawPrint, count: pets.length },
                    { key: 'stories', label: 'Stories', icon: FileText, count: stories.length },
                    { key: 'applications', label: 'Apps', icon: Users, count: applications.length }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearchTerm('') }}
                        className={`px-4 py-2 rounded-full font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.key
                            ? 'bg-brand text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <tab.icon size={14} /> {tab.label}
                        <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 min-w-[20px] text-center">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative mb-4 md:mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand outline-none transition text-sm"
                />
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : (
                <>
                    {/* ===== PETS TAB ===== */}
                    {activeTab === 'pets' && (
                        <div>
                            <button
                                onClick={() => { setEditingPet({}); setShowPetForm(true) }}
                                className="mb-4 bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md transition"
                            >
                                <Plus size={16} /> Add Pet
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {filteredPets.map(pet => (
                                    <div
                                        key={pet.id}
                                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex"
                                    >
                                        {/* Pet Image */}
                                        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100">
                                            <img
                                                src={pet.image_url || 'https://placehold.co/100'}
                                                alt={pet.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Pet Info + Actions */}
                                        <div className="flex-1 p-3 flex items-center min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold text-sm text-slate-800 truncate">{pet.name}</h3>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${pet.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-brand-lighter/50 text-brand'}`}>
                                                        {pet.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 truncate">{pet.breed}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 ml-auto flex-shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingPet(pet); setShowPetForm(true) }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePet(e, pet.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredPets.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No pets found.</p>}
                        </div>
                    )}

                    {/* ===== STORIES TAB ===== */}
                    {activeTab === 'stories' && (
                        <div>
                            <button
                                onClick={() => { setEditingStory({}); setShowStoryForm(true) }}
                                className="mb-4 bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md transition"
                            >
                                <Plus size={16} /> Create Post
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {filteredStories.map(story => (
                                    <div
                                        key={story.id}
                                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-3 md:p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-2 flex-1">{story.title}</h3>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${story.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {story.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{new Date(story.created_at).toLocaleDateString()}</p>
                                        {story.content && (
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{story.content}</p>
                                        )}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setEditingStory(story); setShowStoryForm(true) }}
                                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteStory(e, story.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredStories.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No stories found.</p>}
                        </div>
                    )}

                    {/* ===== APPLICATIONS TAB ===== */}
                    {activeTab === 'applications' && (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {filteredApps.map(app => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApplication(app)}
                                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all p-3 md:p-4 cursor-pointer active:scale-[0.98] flex items-start gap-3"
                                    >
                                        {/* Pet thumbnail */}
                                        {app.pets?.image_url && (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                <img
                                                    src={app.pets.image_url}
                                                    alt={app.pets?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm text-slate-800 truncate">{app.applicant_name}</h3>
                                            <p className="text-xs text-brand font-medium truncate">For: {app.pets?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-slate-300 text-xs mt-1 flex-shrink-0">›</span>
                                    </div>
                                ))}
                            </div>
                            {filteredApps.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No applications found.</p>}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {showPetForm && (
                <PetForm
                    pet={editingPet}
                    onSuccess={() => { setShowPetForm(false); setEditingPet(null); fetchData() }}
                    onCancel={() => { setShowPetForm(false); setEditingPet(null) }}
                />
            )}

            {showStoryForm && (
                <StoryForm
                    story={editingStory}
                    onSuccess={() => { setShowStoryForm(false); setEditingStory(null); fetchData() }}
                    onCancel={() => { setShowStoryForm(false); setEditingStory(null) }}
                />
            )}

            {selectedApplication && (
                <ApplicantDetailModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onDelete={handleDeleteApplication}
                />
            )}
        </div>
    )
}
