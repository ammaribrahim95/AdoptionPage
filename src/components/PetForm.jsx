import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Upload, X } from 'lucide-react'
import { calculateDobFromAge } from '../utils/helpers'

export default function PetForm({ pet = {}, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: pet.name || '',
        date_of_birth: pet.date_of_birth || '',
        gender: pet.gender || 'Unknown',
        breed: pet.breed || '',
        description: pet.description || '',
        status: pet.status || 'available',
        image_url: pet.image_url || '',
        is_dewormed: pet.is_dewormed || false,
        is_deflea: pet.is_deflea || false,
        is_vaccinated: pet.is_vaccinated || false,
        is_potty_trained: pet.is_potty_trained || false,
        is_neutered: pet.is_neutered || false,
        vaccination_date: pet.vaccination_date || ''
    })
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    // State for approx age calculator
    const [approxAgeValue, setApproxAgeValue] = useState('')
    const [approxAgeUnit, setApproxAgeUnit] = useState('months')

    const handleSetApproxAge = () => {
        const dob = calculateDobFromAge(approxAgeValue, approxAgeUnit)
        if (dob) {
            setFormData(prev => ({ ...prev, date_of_birth: dob }))
            setApproxAgeValue('')
            // Optional: minimal alert or notification could go here if needed
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        // Handle boolean values specifically if passed from our custom radio buttons
        if (value === 'true' || value === 'false') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }))
            return
        }

        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const renderBooleanToggle = (label, name) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, [name]: true }))}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${formData[name] ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, [name]: false }))}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${!formData[name] ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    No
                </button>
            </div>
        </div>
    )

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

        try {
            const imageUrl = await uploadImage()

            const finalVaccinationDate = formData.is_vaccinated && formData.vaccination_date ? formData.vaccination_date : null

            const dataToSave = {
                ...formData,
                image_url: imageUrl,
                vaccination_date: finalVaccinationDate
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                />
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Or Calculate Approximate DOB</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        value={approxAgeValue}
                                        onChange={(e) => setApproxAgeValue(e.target.value)}
                                        placeholder="Age"
                                        min="0"
                                        className="w-16 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-brand outline-none"
                                    />
                                    <select
                                        value={approxAgeUnit}
                                        onChange={(e) => setApproxAgeUnit(e.target.value)}
                                        className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-brand outline-none bg-white"
                                    >
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleSetApproxAge}
                                        className="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand text-sm font-bold rounded-md transition"
                                    >
                                        Calculate
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
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
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                        ></textarea>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Medical & Care Status</h3>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderBooleanToggle('Dewormed', 'is_dewormed')}
                            {renderBooleanToggle('Deflea', 'is_deflea')}
                            {renderBooleanToggle('Potty Trained', 'is_potty_trained')}
                            {renderBooleanToggle('Spayed/Neutered', 'is_neutered')}

                            <div className="col-span-2 lg:col-span-2 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    {renderBooleanToggle('Vaccinated', 'is_vaccinated')}

                                    {formData.is_vaccinated && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Vaccination Date</label>
                                            <input
                                                type="date"
                                                name="vaccination_date"
                                                value={formData.vaccination_date || ''}
                                                onChange={handleChange}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
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
                            className="px-6 py-2 bg-brand hover:bg-brand-light text-white rounded-lg font-medium transition shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Pet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
