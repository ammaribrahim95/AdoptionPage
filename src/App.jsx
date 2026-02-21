import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Layout from './components/Layout'

// Pages
import Home from './pages/Home'
import Available from './pages/Available'
import Adopted from './pages/Adopted'
import PetDetails from './pages/PetDetails'
import Admin from './pages/Admin'

// Auth
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/available" element={<Available />} />
          <Route path="/adopted" element={<Adopted />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
