import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import AnalyzeWorkspace from "./pages/AnalyzeWorkspace";
import GlobalBackground from "./components/GlobalBackground";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <GlobalBackground />
        <header className="app-header">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12 h4 l3 -9 5 18 3 -9 h5" />
            </svg>
            FOLK ART AI
          </div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<AnalyzeWorkspace />} />
          <Route path="/about" element={<About />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>

        <footer className="app-footer">
          <p>Built with <span>PyTorch</span>, <span>FastAPI</span>, and <span>React</span></p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;