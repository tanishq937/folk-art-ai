import React from "react";

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>Preserving Heritage with AI</h1>
        <p>
          Folk Art AI was built to preserve India's diverse folk art traditions while 
          protecting the authenticity of hand-crafted pieces in a digital world. 
          As machine-printed replicas are increasingly sold as authentic hand-crafted 
          paintings online, this project provides a technical defense for local artisans.
        </p>
      </div>

      <div className="about-content">
        <section className="about-section about-card">
          <h2>The ML Architecture</h2>
          <p className="section-intro">
            The system is powered by a pipeline of 5 specialized modules designed for 
            accuracy and interpretability.
          </p>

          <div className="timeline">
            <div className="timeline-item" style={{ animationDelay: '0.1s' }}>
              <div className="timeline-marker">1</div>
              <div className="timeline-content">
                <h3>Style Classifier</h3>
                <p>
                  Built with <strong>ResNet18 transfer learning</strong>. Fine-tuned to recognize 
                  nuanced stylistic patterns across distinct regional art forms, achieving a <strong>90% validation accuracy</strong>.
                </p>
              </div>
            </div>

            <div className="timeline-item" style={{ animationDelay: '0.2s' }}>
              <div className="timeline-marker">2</div>
              <div className="timeline-content">
                <h3>Authenticity Detector</h3>
                <p>
                  Powered by a <strong>Random Forest</strong> trained on hand-engineered texture, sharpness, and noise features, achieving a <strong>91% validation accuracy</strong>. 
                  <em>Note:</em> A CNN approach was initially attempted but failed because frozen ImageNet features are invariant to the fine texture signals needed to distinguish hand-painted strokes from machine prints. This led to a successful pivot towards direct feature engineering.
                </p>
              </div>
            </div>

            <div className="timeline-item" style={{ animationDelay: '0.3s' }}>
              <div className="timeline-marker">3</div>
              <div className="timeline-content">
                <h3>Explainability Engine (Grad-CAM)</h3>
                <p>
                  Provides visual transparency by overlaying heatmaps on uploaded images, 
                  highlighting the exact brushstrokes or patterns that the model used to make 
                  its classification decision.
                </p>
              </div>
            </div>

            <div className="timeline-item" style={{ animationDelay: '0.4s' }}>
              <div className="timeline-marker">4</div>
              <div className="timeline-content">
                <h3>Similarity Search</h3>
                <p>
                  Utilizes an <strong>embedding-based</strong> approach to retrieve and display 
                  visually and stylistically similar artworks from our curated gallery database.
                </p>
              </div>
            </div>

            <div className="timeline-item" style={{ animationDelay: '0.5s' }}>
              <div className="timeline-marker">5</div>
              <div className="timeline-content">
                <h3>Cultural Context Engine</h3>
                <p>
                  Maps the identified style to its geographical origin and retrieves deep 
                  cultural context, history, and significance to educate the user.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="about-grid">
          <section className="about-section about-card" style={{ animationDelay: '0.6s' }}>
            <h2>Dataset</h2>
            <p>
              The models were trained using a custom-curated subset of the <strong>Kaggle Indian Paintings Dataset</strong>. 
              The dataset comprises approximately <strong>660 high-resolution images</strong> spanning across 8 distinct Indian folk art styles.
            </p>
          </section>

          <section className="about-section about-card" style={{ animationDelay: '0.7s' }}>
            <h2>Tech Stack</h2>
            <ul className="tech-stack-list">
              <li>
                <span className="tech-highlight">PyTorch</span> for model training and inference
              </li>
              <li>
                <span className="tech-highlight">FastAPI</span> for the high-performance ML serving backend
              </li>
              <li>
                <span className="tech-highlight">React</span> for the dynamic, responsive frontend
              </li>
              <li>
                <span className="tech-highlight">react-simple-maps</span> for geographical visualizations
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
