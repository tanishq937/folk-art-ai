import { useState, useRef, useEffect } from "react";
import MapView from "../MapView";
import axios from "axios";
import StyleIcon from "../components/StyleIcon";
import { jsPDF } from "jspdf";

function AnalyzeWorkspace() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Adversarial Playground State
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [blurLevel, setBlurLevel] = useState(0);
  const [saturationLevel, setSaturationLevel] = useState(0);
  const [adversarialScore, setAdversarialScore] = useState(null);
  const [forging, setForging] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [pulseIndex, setPulseIndex] = useState(-1);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const loadingTexts = [
    "AUTHENTICATING CANVAS...",
    "DECONSTRUCTING FOLK GEOMETRY...",
    "MAPPING CULTURAL COORDINATES...",
    "DECODING ANCIENT IMAGERY..."
  ];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Immersive Audio & TTS Effect
  useEffect(() => {
    let timeoutId;
    if (result && result.cultural_info) {
      // 1. Speech Synthesis
      const historyText = result?.cultural_info?.history || "";
      const sentences = historyText.match(/[^.!?]+[.!?]+/g) || [historyText];
      const firstSentence = sentences[0] ? sentences[0].trim() : "";
      
      if (firstSentence && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(firstSentence);
        utterance.rate = 0.9;
        
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            // Pulse the top similar item
            setPulseIndex(0);
            setTimeout(() => setPulseIndex(-1), 150);
          }
        };

        utterance.onstart = () => {
          setSubtitle(firstSentence);
        };
        
        utterance.onend = () => {
          setTimeout(() => setSubtitle(""), 2000);
        };

        const setVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.includes('en-IN')) || 
                                 voices.find(v => v.lang.includes('en-GB')) ||
                                 voices.find(v => v.lang.includes('en-US')) ||
                                 voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
          window.speechSynthesis.speak(utterance);
        };

        timeoutId = setTimeout(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
          } else {
            window.speechSynthesis.onvoiceschanged = setVoice;
          }
        }, 1000);
      }

      // 2. Audio Background Fade-in
      const audioEl = document.getElementById('cultural-ambient-loop');
      let fadeInterval;
      if (audioEl) {
        audioEl.volume = 0;
        audioEl.play().catch(e => console.log("Audio autoplay blocked by browser:", e));
        
        let vol = 0;
        fadeInterval = setInterval(() => {
          if (vol < 0.2) {
            vol += 0.05;
            audioEl.volume = Math.min(vol, 0.2);
          } else {
            clearInterval(fadeInterval);
          }
        }, 500);
      }

      // Cleanup when unmounting or when result clears
      return () => {
        clearTimeout(timeoutId);
        setSubtitle("");
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        if (audioEl) {
          clearInterval(fadeInterval);
          audioEl.pause();
          audioEl.currentTime = 0;
        }
      };
    }
  }, [result]);

  const handleAttemptForgery = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    setForging(true);
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const blurPx = (blurLevel / 100) * 10;
    const satPct = 100 + (saturationLevel / 100) * 200;
    ctx.filter = `blur(${blurPx}px) saturate(${satPct}%)`;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    if (noiseLevel > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noiseIntensity = (noiseLevel / 100) * 100;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseIntensity;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    }
    
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "forgery.jpg");
      
      try {
        const response = await axios.post("http://127.0.0.1:8000/analyze-authenticity-only", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAdversarialScore(response.data.authenticity);
      } catch (err) {
        console.error("Error attempting forgery:", err);
      } finally {
        setForging(false);
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setAdversarialScore(null);
      setNoiseLevel(0);
      setBlurLevel(0);
      setSaturationLevel(0);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        setResult(response.data);
      } else {
        throw new Error("Received an empty response from the server.");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err?.response?.data?.detail || "Something went wrong analyzing the image. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    // Reset state to initial upload form
    setResult(null);
    setPreviewUrl(null);
    setSelectedImage(null);
    setError(null);
    setAdversarialScore(null);
    setNoiseLevel(0);
    setBlurLevel(0);
    setSaturationLevel(0);
    
    // Stop audio & TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const audioEl = document.getElementById('cultural-ambient-loop');
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("INDIAN FOLK ART INTELLIGENCE SYSTEM", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Official Analysis Report & Certificate", 105, 30, { align: "center" });
    
    // Image
    const img = imgRef.current;
    if (img) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL('image/jpeg');
      
      // Calculate aspect ratio to fit in PDF
      const pdfWidth = 100;
      const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
      doc.addImage(imgData, 'JPEG', 55, 40, pdfWidth, pdfHeight);
      
      let yOffset = 40 + pdfHeight + 20;
      
      // Section 1
      doc.setFontSize(16);
      doc.text("Analysis Results", 20, yOffset);
      doc.setFontSize(12);
      yOffset += 10;
      doc.text(`Predicted Style: ${result?.predicted_style?.toUpperCase() || "UNKNOWN"}`, 20, yOffset);
      yOffset += 7;
      doc.text(`Confidence: ${((result?.style_confidence || 0) * 100).toFixed(1)}%`, 20, yOffset);
      
      // Section 2
      yOffset += 15;
      doc.setFontSize(16);
      doc.text("Authenticity Check", 20, yOffset);
      doc.setFontSize(12);
      yOffset += 10;
      const isGenuine = result?.authenticity?.prediction === "genuine";
      doc.text(`Status: ${isGenuine ? 'GENUINE' : 'REPLICA'}`, 20, yOffset);
      yOffset += 7;
      doc.text(`Confidence: ${((result?.authenticity?.confidence || 0) * 100).toFixed(1)}%`, 20, yOffset);
      
      // Section 3
      if (result?.cultural_info) {
        yOffset += 15;
        doc.setFontSize(16);
        doc.text("Cultural Heritage", 20, yOffset);
        doc.setFontSize(12);
        yOffset += 10;
        doc.text(`Origin: ${result?.cultural_info?.region || "Unknown"}, ${result?.cultural_info?.state || "Unknown"}`, 20, yOffset);
        yOffset += 7;
        const splitHistory = doc.splitTextToSize(`History: ${result?.cultural_info?.history || ""}`, 170);
        doc.text(splitHistory, 20, yOffset);
        yOffset += splitHistory.length * 7;
      }
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 290, { align: "center" });
      
      doc.save("Folk_Art_Analysis_Report.pdf");
    }
  };

  return (
    <>
      {loading && (
        <div className="analysis-loading-portal">
          <div className="mandala-spinner">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeDasharray="10 5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-terracotta)" strokeWidth="2" strokeDasharray="5 5" />
              <path d="M50 15 L55 35 L75 35 L60 48 L65 68 L50 55 L35 68 L40 48 L25 35 L45 35 Z" fill="none" stroke="var(--accent-gold)" strokeWidth="2" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="var(--accent-terracotta)" strokeWidth="2" />
            </svg>
          </div>
          <div className="loading-text" key={loadingTextIndex}>
            {loadingTexts[loadingTextIndex]}
          </div>
        </div>
      )}

      <section className="hero-section">
        
        <div className="hero-content">
          <h1>Analysis Workspace</h1>
          <p>Upload a folk art painting to identify its style, check authenticity, and explore its cultural roots through the lens of machine learning.</p>
          
          <div className="upload-controls">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            
            {previewUrl && (
              <div className="preview-container">
                <img src={previewUrl} alt="preview" className="preview-img" />
                <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Painting"}
                </button>
              </div>
            )}
            
            {error && (
              <div className="error-message" style={{ textAlign: "center", marginTop: "20px" }}>
                <p style={{ color: "#ff6b6b", marginBottom: "15px" }}>{error}</p>
                <button className="analyze-btn" style={{ background: "transparent", border: "1px solid var(--accent-terracotta)" }} onClick={handleAnalyze}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {result && (
        <>
          <div className="portal-actions">
            <button className="download-report-btn" onClick={generatePDF}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Report
            </button>
            <button className="exit-portal-btn" onClick={handleExit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Exit Portal
            </button>
          </div>
          
          <main className="results-section" style={{ position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div className="results-header">
              <div className="style-title-group">
                <StyleIcon styleName={result?.predicted_style || "unknown"} />
                <h2>{result?.predicted_style?.toUpperCase()} | {((result?.style_confidence || 0) * 100).toFixed(1)}% Confidence</h2>
              </div>
            </div>

            <div className="results-grid">
              
              {/* Left Column */}
              <div className="left-col">
                <div className="result-card card-authenticity">
                  <h3>Authenticity</h3>
                  <div className={`auth-badge ${result?.authenticity?.prediction || "unknown"}`}>
                    {result?.authenticity?.prediction === "genuine" ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Likely Genuine
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Possible Replica
                      </>
                    )}
                    <span>({((result?.authenticity?.confidence || 0) * 100).toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="result-card card-similar">
                  <h3>Similar Works</h3>
                  <div className="similar-list-vertical">
                    {result.similar_paintings?.map((item, idx) => (
                      <div key={idx} className={`similar-item-vertical ${pulseIndex === idx ? 'rhythmic-pulse' : ''}`}>
                        <div className="similar-info">
                          <h4>{item?.style?.toUpperCase()}</h4>
                          <span className="match-score">{((item?.similarity || 0) * 100).toFixed(0)}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="right-col">
                <div className="result-card card-heatmap">
                  <h3>Attention Map</h3>
                  <img src={`data:image/jpeg;base64,${result?.gradcam_heatmap_base64 || ""}`} alt="Grad-CAM heatmap" />
                  <p className="hint">Highlighted areas show structural patterns the model focused on.</p>
                </div>

                {result?.cultural_info && (
                  <div className="result-card card-cultural">
                    <h3>Cultural Heritage</h3>
                    <div className="cultural-details">
                      <p><strong>Origin:</strong> {result?.cultural_info?.region}, {result?.cultural_info?.state}</p>
                      <p><strong>History:</strong> {result?.cultural_info?.history}</p>
                      <p><strong>Symbolism:</strong> {result?.cultural_info?.symbolism}</p>
                    </div>

                    <div className="map-container">
                      <MapView
                        lat={result?.cultural_info?.coordinates?.lat || 0}
                        lon={result?.cultural_info?.coordinates?.lon || 0}
                        styleName={result?.cultural_info?.style || result?.predicted_style || ""}
                        region={result?.cultural_info?.region || ""}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Adversarial Playground Card */}
              <div className="result-card card-playground" style={{ gridColumn: "1 / -1" }}>
                <h3>Adversarial Playground: Beat the AI</h3>
                <p>Apply digital artifacts to see if you can trick our Random Forest authenticity classifier into thinking this is a printed replica.</p>
                
                <div className="playground-content">
                  <div className="playground-image-container">
                    <img 
                      ref={imgRef}
                      src={previewUrl} 
                      alt="Playground preview" 
                      style={{
                        filter: `blur(${(blurLevel/100)*10}px) saturate(${100 + (saturationLevel/100)*200}%)`,
                      }}
                    />
                    {noiseLevel > 0 && (
                      <div 
                        className="noise-overlay" 
                        style={{ opacity: noiseLevel / 100 }}
                      ></div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                  </div>
                  
                  <div className="playground-controls">
                    <div className="control-group">
                      <label>Add Synthetic Noise</label>
                      <input type="range" min="0" max="100" value={noiseLevel} onChange={e => setNoiseLevel(Number(e.target.value))} />
                    </div>
                    <div className="control-group">
                      <label>Simulate Print Blur</label>
                      <input type="range" min="0" max="100" value={blurLevel} onChange={e => setBlurLevel(Number(e.target.value))} />
                    </div>
                    <div className="control-group">
                      <label>Boost Ink Saturation</label>
                      <input type="range" min="0" max="100" value={saturationLevel} onChange={e => setSaturationLevel(Number(e.target.value))} />
                    </div>
                    
                    <button className="forge-btn" onClick={handleAttemptForgery} disabled={forging}>
                      {forging ? "Analyzing..." : "Attempt Forgery"}
                    </button>
                    
                    {forging && (
                      <div className="live-score loading" style={{ textAlign: 'center', padding: '1rem' }}>
                        <div className="spinner-border" role="status" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid var(--accent-terracotta)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span style={{ marginLeft: '10px' }}>Analyzing Forgery...</span>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}

                    {!forging && adversarialScore && (
                      <div className={`live-score ${adversarialScore.prediction}`}>
                        <h4>Live Authenticity Score</h4>
                        <div className="live-score-details">
                          {adversarialScore.prediction === "genuine" ? (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              Likely Genuine
                            </>
                          ) : (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                              Possible Replica
                            </>
                          )}
                          <span>({(adversarialScore.confidence * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </main>
        </>
      )}
      <audio id="cultural-ambient-loop" loop src="https://actions.google.com/sounds/v1/ambiences/meditation_bell.ogg" style={{ display: 'none' }} />
    </>
  );
}

export default AnalyzeWorkspace;
