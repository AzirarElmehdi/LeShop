export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 p-6 flex justify-between">
        <h1 className="font-black">AZMethods</h1>
        <nav>...</nav>
      </header>

      {/* CONTENT */}
      <main>
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 p-6 text-xs text-slate-500">
        © 2026 AZMethods
      </footer>

    </div>
  )
}