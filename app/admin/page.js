'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import PetForm from '@/components/PetForm'
import StoryForm from '@/components/StoryForm'
import ApplicantDetailModal from '@/components/ApplicantDetailModal'
import { Plus, Pencil, Trash2, Eye, Search, LogIn, Image as ImageIcon, PawPrint, FileText, Users } from 'lucide-react'

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

    const handleDeletePet = async (id) => {
        if (!confirm('Delete this pet?')) return
        await supabase.from('pets').delete().eq('id', id)
        fetchData()
    }

    const handleDeleteStory = async (id) => {
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogIn className="text-brand" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm">Manage your shelter&apos;s pets, stories, and applications.</p>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 px-5 py-2 rounded-full transition-all text-sm font-bold"
                >
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
                {[
                    { key: 'pets', label: 'Pets', icon: PawPrint },
                    { key: 'stories', label: 'Stories', icon: FileText },
                    { key: 'applications', label: 'Applications', icon: Users }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearchTerm('') }}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.key
                            ? 'bg-brand text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                        <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full ml-1 min-w-[24px] text-center">
                            {tab.key === 'pets' ? pets.length : tab.key === 'stories' ? stories.length : applications.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand outline-none transition"
                />
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : (
                <>
                    {/* Pets Tab */}
                    {activeTab === 'pets' && (
                        <div>
                            <button
                                onClick={() => { setEditingPet({}); setShowPetForm(true) }}
                                className="mb-6 bg-brand hover:bg-brand-light text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition"
                            >
                                <Plus size={18} /> Add Pet
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                                <th className="px-6 py-4">Image</th>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Breed</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredPets.map(pet => (
                                                <tr key={pet.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <img src={pet.image_url || 'https://placehold.co/50'} alt={pet.name} className="w-12 h-12 rounded-lg object-cover border" />
                                                    </td>
                                                    <td className="px-6 py-3 font-bold text-slate-800">{pet.name}</td>
                                                    <td className="px-6 py-3 text-slate-500">{pet.breed}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${pet.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-brand-lighter/50 text-brand'}`}>
                                                            {pet.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button onClick={() => { setEditingPet(pet); setShowPetForm(true) }} className="p-2 text-slate-400 hover:text-blue-500 transition">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeletePet(pet.id)} className="p-2 text-slate-400 hover:text-red-500 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredPets.length === 0 && <p className="text-center text-slate-400 py-10">No pets found.</p>}
                            </div>
                        </div>
                    )}

                    {/* Stories Tab */}
                    {activeTab === 'stories' && (
                        <div>
                            <button
                                onClick={() => { setEditingStory({}); setShowStoryForm(true) }}
                                className="mb-6 bg-brand hover:bg-brand-light text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition"
                            >
                                <Plus size={18} /> Create Post
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                                <th className="px-6 py-4">Title</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStories.map(story => (
                                                <tr key={story.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-3 font-bold text-slate-800">{story.title}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${story.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {story.is_published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 text-sm">{new Date(story.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button onClick={() => { setEditingStory(story); setShowStoryForm(true) }} className="p-2 text-slate-400 hover:text-blue-500 transition">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteStory(story.id)} className="p-2 text-slate-400 hover:text-red-500 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredStories.length === 0 && <p className="text-center text-slate-400 py-10">No stories found.</p>}
                            </div>
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                            <th className="px-6 py-4">Applicant</th>
                                            <th className="px-6 py-4">Pet</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredApps.map(app => (
                                            <tr
                                                key={app.id}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedApplication(app)}
                                            >
                                                <td className="px-6 py-3 font-bold text-slate-800">{app.applicant_name}</td>
                                                <td className="px-6 py-3 text-slate-500">{app.pets?.name || 'Unknown'}</td>
                                                <td className="px-6 py-3 text-slate-500 text-sm">{app.email}</td>
                                                <td className="px-6 py-3 text-slate-500 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedApplication(app) }}
                                                        className="p-2 text-slate-400 hover:text-brand transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredApps.length === 0 && <p className="text-center text-slate-400 py-10">No applications found.</p>}
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
