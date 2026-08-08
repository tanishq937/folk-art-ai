import React from "react";
import { useNavigate } from "react-router-dom";
import StyleIcon from "../components/StyleIcon";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-content">
          <h1>Indian Folk Art<br/>Intelligence System</h1>
          <p className="subtitle">
            Preserving heritage through machine learning. Identify styles, verify authenticity, 
            and explore the deep cultural roots of traditional Indian art.
          </p>
          <button className="cta-button" onClick={() => navigate("/analyze")}>
            Enter the Portal
          </button>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Deep Style Classification</h3>
            <p>Our CNN-based models are trained on thousands of authentic artworks to instantly identify styles like Warli, Gond, and Madhubani.</p>
          </div>
          <div className="feature-card">
            <h3>Authenticity Detection</h3>
            <p>Using advanced Random Forest forgery detection, we analyze edge density, saturation, and sharpness to distinguish true masterpieces from replicas.</p>
          </div>
          <div className="feature-card">
            <h3>Cultural Storytelling</h3>
            <p>Every analysis unlocks a multisensory portal into the heritage, geography, and rich storytelling traditions of the art form.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
