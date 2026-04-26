import Admin from './pages/Admin'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <AuthGuard>
      <Admin />
    </AuthGuard>
  )
}

export default App