import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { X, Image as ImageIcon } from 'lucide-react'

export default function StoryForm({ story = {}, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        title: story.title || '',
        content: story.content || '',
        pet_id: story.pet_id || '', // Now optional
        is_published: story.is_published !== undefined ? story.is_published : true
    })

    const [availablePets, setAvailablePets] = useState([])
    const [loading, setLoading] = useState(false)

    // Optional: Fetch pets to populate the optional dropdown linker
    useEffect(() => {
        const fetchPetsForDropdown = async () => {
            const { data } = await supabase
                .from('pets')
                .select('id, name')
                .order('name')
            if (data) setAvailablePets(data)
        }
        fetchPetsForDropdown()
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSave = {
                title: formData.title,
                content: formData.content,
                is_published: formData.is_published,
                pet_id: formData.pet_id === '' ? null : formData.pet_id
            }

            let error
            if (story.id) {
                const { error: updateError } = await supabase
                    .from('adoption_updates')
                    .update(dataToSave)
                    .eq('id', story.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('adoption_updates')
                    .insert([dataToSave])
                error = insertError
            }

            if (error) throw error
            onSuccess()
        } catch (error) {
            alert('Error saving story: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button onClick={onCancel} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-2">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-brand-lighter/30 p-3 rounded-xl">
                        <ImageIcon className="text-brand" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {story.id ? 'Edit Story Post' : 'Create New Post'}
                        </h2>
                        <p className="text-slate-500 font-medium">Publish news, announcements, or success stories.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Story Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Breaking News! We received a massive food donation."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand outline-none transition font-medium text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="6"
                            placeholder="Write the full story or announcement here..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand outline-none transition text-slate-700 leading-relaxed resize-y"
                        ></textarea>
                    </div>

                    <div className="bg-brand-lighter/10 border border-brand/20 p-5 rounded-xl">
                        <label className="block text-sm font-bold text-brand mb-2">Optional: Link to a Specific Pet</label>
                        <p className="text-xs text-slate-500 mb-3">If this story is about a specific pet in the shelter, map them here to display their badge on the feed.</p>
                        <select
                            name="pet_id"
                            value={formData.pet_id || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand outline-none transition font-medium text-slate-700"
                        >
                            <option value="">-- No linked pet (General Announcement) --</option>
                            {availablePets.map(pet => (
                                <option key={pet.id} value={pet.id}>{pet.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            <span className="ml-3 text-sm font-bold text-slate-700">
                                {formData.is_published ? 'Published (Visible on Feed)' : 'Draft (Hidden)'}
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-brand hover:bg-brand-light text-white font-bold rounded-xl shadow-lg shadow-brand/30 disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                'Save Story'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
