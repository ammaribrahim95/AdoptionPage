import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabaseClient'
import PetForm from '../components/PetForm'
import { Trash2, Edit, Plus, MessageCircle, X } from 'lucide-react'

export default function Admin() {
    const { user, login } = useAuth()
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPet, setEditingPet] = useState(null)
    const [updateModalOpen, setUpdateModalOpen] = useState(false)
    const [selectedPetForUpdate, setSelectedPetForUpdate] = useState(null)

    // Login State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        if (user) fetchPets()
    }, [user])

    const fetchPets = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('pets')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setPets(data)
        setLoading(false)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        const { error } = await login(email, password)
        if (error) setAuthError(error.message)
        else setAuthError(null)
    }

    const handleDelete = async (id) => {
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
        setUpdateModalOpen(false)
        setSelectedPetForUpdate(null)
    }

    const handleSuccess = () => {
        closeModals()
        fetchPets()
    }

    // Update Modal Logic
    const [updateMessage, setUpdateMessage] = useState('')

    const handleAddUpdate = async (e) => {
        e.preventDefault()
        if (!updateMessage.trim()) return

        const { error } = await supabase.from('adoption_updates').insert([
            { pet_id: selectedPetForUpdate.id, message: updateMessage }
        ])

        if (error) alert('Error adding update: ' + error.message)
        else {
            alert('Update added successfully!')
            setUpdateMessage('')
            closeModals()
        }
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Admin Login</h2>
                {authError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{authError}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-bold transition">
                        Login
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Pet Management</h1>
                <button
                    onClick={openAddModal}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} /> Add New Pet
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Pet</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date Added</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8">Loading...</td>
                                </tr>
                            ) : pets.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">No pets found. Add one!</td>
                                </tr>
                            ) : (
                                pets.map((pet) => (
                                    <tr key={pet.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <img
                                                src={pet.image_url || 'https://placehold.co/100?text=Pet'}
                                                alt={pet.name}
                                                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                            />
                                            <div>
                                                <div className="font-bold text-slate-800">{pet.name}</div>
                                                <div className="text-xs text-slate-500">{pet.breed}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${pet.status === 'adopted' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                {pet.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(pet.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedPetForUpdate(pet); setUpdateModalOpen(true); }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    title="Add Update"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(pet)}
                                                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pet.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
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
                </div>
            </div>

            {showModal && (
                <PetForm
                    pet={editingPet}
                    onSuccess={handleSuccess}
                    onCancel={closeModals}
                />
            )}

            {updateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={closeModals} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Add Update for {selectedPetForUpdate?.name}</h3>
                        <form onSubmit={handleAddUpdate}>
                            <textarea
                                value={updateMessage}
                                onChange={(e) => setUpdateMessage(e.target.value)}
                                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none mb-4"
                                rows="4"
                                placeholder="What's new? e.g. 'Found a designated nap spot!'"
                                required
                            ></textarea>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={closeModals} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Post Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
