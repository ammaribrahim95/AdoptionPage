import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabaseClient'
import PetForm from '../components/PetForm'
import StoryForm from '../components/StoryForm'
import { Trash2, Edit, Plus, MessageCircle, X, CheckCircle, XCircle, LayoutTemplate } from 'lucide-react'

export default function Admin() {
    const { user, login } = useAuth()
    const [activeTab, setActiveTab] = useState('pets') // 'pets' or 'applications'

    // Data State
    const [pets, setPets] = useState([])
    const [applications, setApplications] = useState([])
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [editingPet, setEditingPet] = useState(null)
    const [showStoryModal, setShowStoryModal] = useState(false)
    const [editingStory, setEditingStory] = useState(null)

    // Login State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        await Promise.all([fetchPets(), fetchApplications(), fetchStories()])
        setLoading(false)
    }

    const fetchPets = async () => {
        const { data } = await supabase
            .from('pets')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setPets(data)
    }

    const fetchApplications = async () => {
        const { data } = await supabase
            .from('adoption_applications')
            .select(`*, pets(name, image_url)`)
            .order('created_at', { ascending: false })
        if (data) setApplications(data)
    }

    const fetchStories = async () => {
        const { data } = await supabase
            .from('adoption_updates')
            .select('*, pets(name)')
            .order('created_at', { ascending: false })
        if (data) setStories(data)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        const { error } = await login(email, password)
        if (error) setAuthError(error.message)
        else setAuthError(null)
    }

    // --- Pet Actions ---
    const handleDeletePet = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) return
        const { error } = await supabase.from('pets').delete().eq('id', id)
        if (error) alert('Error deleting: ' + error.message)
        else fetchPets()
    }

    const openEditModal = (pet) => {
        setEditingPet(pet)
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingPet({})
        setShowModal(true)
    }

    const closeModals = () => {
        setShowModal(false)
        setEditingPet(null)
        setShowStoryModal(false)
        setEditingStory(null)
    }

    const handleSuccess = () => {
        closeModals()
        fetchData() // Refresh everything
    }

    // --- Story Actions ---
    const handleDeleteStory = async (id) => {
        if (!window.confirm('Delete this story?')) return
        const { error } = await supabase.from('adoption_updates').delete().eq('id', id)
        if (error) alert('Error deleting: ' + error.message)
        else fetchStories()
    }

    const openEditStoryModal = (story) => {
        setEditingStory(story)
        setShowStoryModal(true)
    }

    const openAddStoryModal = () => {
        setEditingStory({})
        setShowStoryModal(true)
    }

    // --- Application Actions ---
    const updateApplicationStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('adoption_applications')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) alert('Error updating status: ' + error.message)
        else fetchApplications()
    }

    const deleteApplication = async (id) => {
        if (!window.confirm('Delete this application permanently?')) return;
        const { error } = await supabase.from('adoption_applications').delete().eq('id', id)
        if (error) alert('Error deleting: ' + error.message)
        else fetchApplications()
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 glass rounded-2xl shadow-lg border border-slate-100">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Admin Login</h2>
                {authError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{authError}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand hover:bg-brand-light text-white py-3 rounded-xl font-bold transition shadow-md">
                        Login
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage shelter pets and adoption stories.</p>
                </div>
                {activeTab === 'pets' && (
                    <button
                        onClick={openAddModal}
                        className="bg-brand hover:bg-brand-light text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus size={20} /> Add New Pet
                    </button>
                )}
                {activeTab === 'stories' && (
                    <button
                        onClick={openAddStoryModal}
                        className="bg-brand hover:bg-brand-light text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <LayoutTemplate size={20} /> Write New Story
                    </button>
                )}
            </div>

            {/* Custom Tabs */}
            <div className="flex space-x-2 mb-6 bg-slate-100/50 p-1.5 rounded-2xl w-max">
                <button
                    onClick={() => setActiveTab('pets')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'pets'
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                >
                    Pets ({pets.length})
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'applications'
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                >
                    Applications ({applications.length})
                </button>
                <button
                    onClick={() => setActiveTab('stories')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'stories'
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                >
                    Stories ({stories.length})
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {/* PETS TABLE */}
                    {activeTab === 'pets' && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Pet</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 hidden md:table-cell">Date Added</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : pets.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-slate-500">No pets found. Add one!</td>
                                    </tr>
                                ) : (
                                    pets.map((pet) => (
                                        <tr key={pet.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <img
                                                    src={pet.image_url || 'https://placehold.co/100?text=Pet'}
                                                    alt={pet.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <div className="font-bold text-slate-800">{pet.name}</div>
                                                    <div className="text-xs text-slate-500">{pet.breed}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${pet.status === 'adopted' ? 'bg-brand-lighter/30 text-brand' : 'bg-green-100 text-green-700'}`}>
                                                    {pet.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                                {new Date(pet.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(pet)}
                                                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                                        title="Edit Pet"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePet(pet.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Pet"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* APPLICATIONS TABLE */}
                    {activeTab === 'applications' && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Applicant</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Pet</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Details</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-500">No applications found.</td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{app.applicant_name}</div>
                                                <div className="text-xs text-slate-500">{app.email}</div>
                                                <div className="text-xs text-slate-500">{app.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.pets ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={app.pets.image_url || 'https://placehold.co/50'} alt={app.pets.name} className="w-8 h-8 rounded-full object-cover" />
                                                        <span className="font-medium text-slate-700">{app.pets.name}</span>
                                                    </div>
                                                ) : <span className="text-slate-400 italic">Pet Deleted</span>}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-xs font-semibold text-slate-600 mb-1">{app.housing_type}</div>
                                                <p className="text-xs text-slate-500 line-clamp-2" title={app.experience}>{app.experience}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                    ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {app.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateApplicationStatus(app.id, 'approved')}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => deleteApplication(app.id)}
                                                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-lg transition ml-2"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* STORIES TABLE */}
                    {activeTab === 'stories' && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Story Title</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Linked Pet</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 hidden md:table-cell">Publish Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : stories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-500">No stories created yet.</td>
                                    </tr>
                                ) : (
                                    stories.map((story) => (
                                        <tr key={story.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{story.title || 'Untitled Update'}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{story.content}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                    ${story.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                                                    {story.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {story.pet_id ? (
                                                    <span className="font-medium text-brand bg-brand-lighter/20 px-2 py-1 rounded-md text-xs">
                                                        🐾 {story.pets?.name || 'Unknown Pet'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">General News</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                                {new Date(story.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditStoryModal(story)}
                                                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                                        title="Edit Story"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStory(story.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Story"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <PetForm
                    pet={editingPet}
                    onSuccess={handleSuccess}
                    onCancel={closeModals}
                />
            )}

            {showStoryModal && (
                <StoryForm
                    story={editingStory}
                    onSuccess={handleSuccess}
                    onCancel={closeModals}
                />
            )}
        </div>
    )
}
