import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './components/Admin/Admin'
import AuthGuard from './components/AuthGuard'
import Cart from './pages/Cart' 
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<Home />} />
        
        {/* Page Panier */}
        <Route path="/cart" element={<Cart />} />

        {/* LA ROUTE DYNAMIQUE : Chaque ID aura sa page */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Panel Admin  */}
        <Route 
          path="/admin" 
          element={
            <AuthGuard>
              <Admin />
            </AuthGuard>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App