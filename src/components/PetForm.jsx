import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Upload, X } from 'lucide-react'

export default function PetForm({ pet = {}, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: pet.name || '',
        age: pet.age || '',
        gender: pet.gender || 'Unknown',
        breed: pet.breed || '',
        description: pet.description || '',
        status: pet.status || 'available',
        image_url: pet.image_url || ''
    })
    const [imageFile, setImageFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    const uploadImage = async () => {
        if (!imageFile) return formData.image_url

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('pet-images')
            .upload(filePath, imageFile)

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage
            .from('pet-images')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setUploading(true)

        try {
            const imageUrl = await uploadImage()

            const dataToSave = {
                ...formData,
                image_url: imageUrl
            }

            let error
            if (pet.id) {
                const { error: updateError } = await supabase
                    .from('pets')
                    .update(dataToSave)
                    .eq('id', pet.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('pets')
                    .insert([dataToSave])
                error = insertError
            }

            if (error) throw error
            onSuccess()
        } catch (error) {
            alert('Error saving pet: ' + error.message)
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-slate-800">{pet.id ? 'Edit Pet' : 'Add New Pet'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input
                                type="text"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="e.g. 2 years"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Breed</label>
                            <input
                                type="text"
                                name="breed"
                                value={formData.breed}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="available">Available</option>
                                <option value="adopted">Adopted</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-600 text-sm flex items-center gap-2 transition">
                                    <Upload size={16} /> Choose File
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                {imageFile && <span className="text-xs text-slate-500 truncate max-w-[150px]">{imageFile.name}</span>}
                            </div>
                            {formData.image_url && !imageFile && (
                                <img src={formData.image_url} alt="Current" className="h-10 w-10 object-cover mt-2 rounded border" />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Pet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
