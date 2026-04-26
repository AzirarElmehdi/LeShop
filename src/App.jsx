import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home' // <--- L'import crucial
import Admin from './components/Admin/Admin'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Ici on utilise le vrai composant Home du dossier pages */}
        <Route path="/" element={<Home />} />
        
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