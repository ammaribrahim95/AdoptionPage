import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" onClick={closeMenu} className="text-2xl font-black text-brand flex items-center gap-2 tracking-tight hover:scale-105 transition-transform z-50">
                    🐾 The A Pawstrophe
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link to="/" className="text-slate-600 hover:text-brand font-semibold transition-colors">Home</Link>
                    <Link to="/available" className="text-slate-600 hover:text-brand font-semibold transition-colors">Available Pets</Link>
                    <Link to="/adopted" className="text-slate-600 hover:text-brand font-semibold transition-colors">Happy Tails</Link>
                </div>

                {/* Desktop Auth */}
                <div className="hidden md:flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link to="/admin" className="text-slate-600 hover:text-brand font-semibold transition-colors">Admin</Link>
                            <button
                                onClick={logout}
                                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 px-5 py-2 rounded-full transition-all text-sm font-bold shadow-sm"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/admin"
                            className="bg-brand hover:bg-brand-light text-white px-5 py-2 rounded-full transition-all text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Admin Login
                        </Link>
                    )}
                </div>

                {/* Mobile Hamburger Icon */}
                <button
                    className="md:hidden text-brand p-2 z-50 relative"
                    onClick={toggleMenu}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Full Screen Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-t border-slate-100 md:hidden flex flex-col pt-4 pb-8 px-6 gap-6"
                    >
                        <Link to="/" onClick={closeMenu} className="text-xl font-semibold text-slate-700 hover:text-brand transition-colors">Home</Link>
                        <Link to="/available" onClick={closeMenu} className="text-xl font-semibold text-slate-700 hover:text-brand transition-colors">Available Pets</Link>
                        <Link to="/adopted" onClick={closeMenu} className="text-xl font-semibold text-slate-700 hover:text-brand transition-colors">Happy Tails</Link>

                        <div className="h-px w-full bg-slate-100 my-2"></div>

                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/admin" onClick={closeMenu} className="text-xl font-semibold text-brand transition-colors">Admin Dashboard</Link>
                                <button
                                    onClick={() => { logout(); closeMenu(); }}
                                    className="bg-red-50 text-red-600 px-5 py-3 rounded-xl transition-all text-lg font-bold text-left w-max"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/admin"
                                onClick={closeMenu}
                                className="bg-brand text-white px-6 py-3 rounded-xl transition-all text-lg font-bold text-center w-full shadow-md"
                            >
                                Admin Login
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
