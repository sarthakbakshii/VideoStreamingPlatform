import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import VideoCatalog from './components/VideoCatalog'
import VideoPlayer from './components/VideoPlayer'
import UploadPage from "./pages/UploadPage"
import './App.css'

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme()

    return (
        <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            )}
        </button>
    )
}

function Navbar() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/" className="netflix-logo">
                        StreamFlow
                    </Link>
                    <ul className="nav-links">
                        <li><Link to="/" className="active">Home</Link></li>
                        <li><Link to="/?filter=series">Series</Link></li>
                        <li><Link to="/?filter=movies">Movies</Link></li>
                        <li><Link to="/?filter=new">New & Popular</Link></li>
                    </ul>
                </div>
                <div className="nav-right">
                    <ThemeToggle />
                    <Link to="/upload" className="upload-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Upload</span>
                    </Link>
                    <div className="profile-menu">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="Profile" />
                    </div>
                </div>
            </div>
        </nav>
    )
}

function AppContent() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<VideoCatalog />} />
                    <Route path="/watch/:videoId" element={<VideoPlayer />} />
                    <Route path="/upload" element={<UploadPage />} />
                </Routes>
            </main>
            <footer className="footer">
                <p>© 2026 StreamFlow. All rights reserved. | Inspired by Netflix 🎬</p>
            </footer>
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App