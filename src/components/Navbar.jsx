import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
    const { user, logout } = useAuth()

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-teal-600 flex items-center gap-2">
                    🐾 The A Pawstrophe
                </Link>
                <div className="hidden md:flex gap-6 items-center">
                    <Link to="/" className="text-slate-600 hover:text-teal-600 font-medium">Home</Link>
                    <Link to="/available" className="text-slate-600 hover:text-teal-600 font-medium">Available Pets</Link>
                    <Link to="/adopted" className="text-slate-600 hover:text-teal-600 font-medium">Happy Tails</Link>
                </div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link to="/admin" className="text-slate-600 hover:text-teal-600 font-medium">Admin</Link>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition text-sm font-semibold"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/admin"
                            className="text-slate-400 hover:text-teal-600 text-sm"
                        >
                            Admin Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
