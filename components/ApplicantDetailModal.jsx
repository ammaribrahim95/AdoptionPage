'use client'

import { X, Mail, Phone, MapPin, Home, User, Calendar, Trash2, Briefcase } from 'lucide-react'

export default function ApplicantDetailModal({ application, onClose, onDelete }) {
    if (!application) return null

    const handleDelete = () => {
        if (window.confirm('Delete this application permanently?')) {
            onDelete(application.id)
        }
    }

    const fullAddress = [
        application.address_line1,
        application.address_line2,
        application.zip_code,
        application.city,
        application.state,
        application.country
    ].filter(Boolean).join(', ')

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Applicant Details</h2>
                    <p className="text-slate-500 text-sm mt-1">Read-only application view</p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">

                    {/* Pet Info */}
                    {application.pets && (
                        <div className="flex items-center gap-4 p-4 bg-brand-lighter/10 rounded-xl border border-brand/10">
                            <img
                                src={application.pets.image_url || 'https://placehold.co/80'}
                                alt={application.pets.name}
                                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                            />
                            <div>
                                <p className="text-xs text-brand font-bold uppercase tracking-wider">Applied for</p>
                                <p className="text-lg font-black text-slate-800">{application.pets.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Personal Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <User size={18} className="text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Full Name</p>
                                <p className="font-bold text-slate-800">{application.applicant_name}</p>
                            </div>
                        </div>

                        <a
                            href={`mailto:${application.email}`}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors group cursor-pointer"
                        >
                            <Mail size={18} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Email</p>
                                <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{application.email}</p>
                            </div>
                        </a>

                        <a
                            href={`tel:${application.phone}`}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-transparent transition-colors group cursor-pointer"
                        >
                            <Phone size={18} className="text-slate-400 group-hover:text-green-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Phone</p>
                                <p className="font-bold text-slate-800 group-hover:text-green-600 transition-colors">{application.phone}</p>
                            </div>
                        </a>
                    </div>

                    {/* Address */}
                    {fullAddress && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</h3>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <MapPin size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    {application.address_line1 && <p className="font-medium text-slate-800">{application.address_line1}</p>}
                                    {application.address_line2 && <p className="text-slate-600">{application.address_line2}</p>}
                                    <p className="text-slate-600">
                                        {[application.zip_code, application.city].filter(Boolean).join(' ')}
                                    </p>
                                    <p className="text-slate-600">
                                        {[application.state, application.country].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Housing & Experience */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Housing &amp; Experience</h3>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Home size={18} className="text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Housing Type</p>
                                <p className="font-bold text-slate-800">{application.housing_type || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                            <Briefcase size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Pet Experience</p>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{application.experience || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Application Date */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Calendar size={18} className="text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Application Date</p>
                            <p className="font-bold text-slate-800">{new Date(application.created_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-5 py-2.5 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 border border-red-100"
                    >
                        <Trash2 size={16} /> Delete Application
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
