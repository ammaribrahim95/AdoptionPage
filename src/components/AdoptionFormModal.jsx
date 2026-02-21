import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { X, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

export default function AdoptionFormModal({ pet, onClose }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        applicant_name: '',
        email: '',
        phone: '',
        housing_type: '',
        experience: '',
        agreed: false
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const validateStep = (currentStep) => {
        const newErrors = {}
        if (currentStep === 1) {
            if (!formData.applicant_name.trim()) newErrors.applicant_name = 'Name is required'
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email format'
            }
            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone is required'
            } else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
                newErrors.phone = 'Invalid phone format'
            }
        }
        if (currentStep === 2) {
            if (!formData.housing_type) newErrors.housing_type = 'Please select a housing type'
        }
        if (currentStep === 3) {
            if (!formData.experience.trim()) newErrors.experience = 'Experience details are required'
            if (!formData.agreed) newErrors.agreed = 'You must agree to the terms to proceed'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3))
        } else {
            // Scroll to the first error (simple fallback by just showing errors)
            const firstErrorNode = document.querySelector('.border-red-500')
            if (firstErrorNode) firstErrorNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep(3)) {
            const firstErrorNode = document.querySelector('.border-red-500')
            if (firstErrorNode) firstErrorNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase
                .from('adoption_applications')
                .insert([
                    {
                        pet_id: pet.id,
                        applicant_name: formData.applicant_name,
                        email: formData.email,
                        phone: formData.phone,
                        housing_type: formData.housing_type,
                        experience: formData.experience,
                        status: 'pending'
                    }
                ])

            if (error) throw error
            setSuccess(true)
        } catch (error) {
            alert('Error submitting application: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center relative border border-slate-100">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Thank you for your interest in giving {pet.name} a forever home. Our team will review your application and contact you soon.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Apply to Adopt {pet.name}</h2>
                    <p className="text-slate-500 text-sm mt-1">Step {step} of 3</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-brand h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="adoption-form" onSubmit={handleSubmit}>

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-slate-700 mb-4 tracking-tight">Personal Information</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="applicant_name"
                                        value={formData.applicant_name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand/50 outline-none transition-all placeholder:text-slate-400 
                                            ${errors.applicant_name ? 'border-red-500 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-brand focus:bg-white focus:shadow-[0_0_0_2px_rgba(183,89,96,0.1)]'}`}
                                    />
                                    {errors.applicant_name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.applicant_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand/50 outline-none transition-all placeholder:text-slate-400 
                                            ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-brand focus:bg-white focus:shadow-[0_0_0_2px_rgba(183,89,96,0.1)]'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+60 12-345 6789"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand/50 outline-none transition-all placeholder:text-slate-400 
                                            ${errors.phone ? 'border-red-500 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-brand focus:bg-white focus:shadow-[0_0_0_2px_rgba(183,89,96,0.1)]'}`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Housing */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-slate-700 mb-4 tracking-tight">Housing Situation</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">What type of housing do you live in? <span className="text-red-500">*</span></label>
                                    <select
                                        name="housing_type"
                                        value={formData.housing_type}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand/50 outline-none transition-all text-slate-700
                                            ${errors.housing_type ? 'border-red-500 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-brand focus:bg-white focus:shadow-[0_0_0_2px_rgba(183,89,96,0.1)]'}`}
                                    >
                                        <option value="" disabled>Select housing type</option>
                                        <option value="House (Own)">House (Own)</option>
                                        <option value="House (Rent)">House (Rent)</option>
                                        <option value="Apartment/Condo (Own)">Apartment/Condo (Own)</option>
                                        <option value="Apartment/Condo (Rent)">Apartment/Condo (Rent)</option>
                                    </select>
                                    {errors.housing_type && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.housing_type}</p>}
                                    {formData.housing_type.includes('Rent') && (
                                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-start">
                                            <span className="mr-1 mt-0.5">⚠️</span>
                                            Since you rent, please ensure you have landlord permission for pets before proceeding.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Experience & Agreement */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-slate-700 mb-4 tracking-tight">Experience & Lifestyle</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tell us about your pet experience <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Have you had pets before? Who lives in your household? How many hours will the pet be alone?"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand/50 outline-none transition-all placeholder:text-slate-400 resize-none
                                            ${errors.experience ? 'border-red-500 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-brand focus:bg-white focus:shadow-[0_0_0_2px_rgba(183,89,96,0.1)]'}`}
                                    ></textarea>
                                    {errors.experience && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.experience}</p>}
                                </div>
                                <div className={`p-4 rounded-xl border text-sm tracking-wide leading-relaxed shadow-sm transition-colors 
                                    ${errors.agreed ? 'bg-red-50 border-red-500 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="agreed"
                                            checked={formData.agreed}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand focus:ring-2"
                                        />
                                        <span>
                                            I affirm that all information provided is true and complete. I understand that submission does not guarantee adoption.
                                            {errors.agreed && <span className="block font-bold text-red-500 mt-1">{errors.agreed}</span>}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2.5 bg-brand hover:bg-brand-light text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="adoption-form"
                            disabled={loading}
                            className="px-8 py-2.5 bg-brand hover:bg-brand-light text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                            Submit Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
