import { useState } from "react";
import axios from "axios";
import StyleIcon from "../components/StyleIcon";

function Compare() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [previewUrl1, setPreviewUrl1] = useState(null);
  const [previewUrl2, setPreviewUrl2] = useState(null);
  
  const [result1, setResult1] = useState(null);
  const [result2, setResult2] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, setImg, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setPreview(URL.createObjectURL(file));
      // Clear results when a new image is selected
      setResult1(null);
      setResult2(null);
      setError(null);
    }
  };

  const handleCompare = async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    setError(null);

    const formData1 = new FormData();
    formData1.append("file", image1);

    const formData2 = new FormData();
    formData2.append("file", image2);

    try {
      // Run both API requests in parallel
      const [res1, res2] = await Promise.all([
        axios.post("http://127.0.0.1:8000/analyze", formData1, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post("http://127.0.0.1:8000/analyze", formData2, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ]);

      setResult1(res1.data);
      setResult2(res2.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong analyzing the images. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Compute a simple similarity score based on style predictions
  const getSimilarityVerdict = () => {
    if (!result1 || !result2) return null;
    
    const isMatch = result1.predicted_style === result2.predicted_style;
    const avgConfidence = (result1.style_confidence + result2.style_confidence) / 2;
    
    // Simple heuristic for demo purposes
    const score = isMatch ? (70 + (avgConfidence * 30)) : (avgConfidence * 20);
    
    return {
      isMatch,
      score: score.toFixed(1),
      title: isMatch 
        ? `Match! Both are ${result1.predicted_style}` 
        : `Different Styles: ${result1.predicted_style} vs ${result2.predicted_style}`
    };
  };

  const verdict = getSimilarityVerdict();

  const renderResultColumn = (result, title) => {
    if (!result) return null;
    return (
      <div className="compare-side-card">
        <h3 className="side-title">{title}</h3>
        
        <div className="style-title-group">
          <StyleIcon styleName={result.predicted_style} />
          <h2>{result.predicted_style}</h2>
        </div>
        
        <div className="confidence-metrics">
          <div className="confidence-label">
            <span>Style Confidence</span>
            <span>{(result.style_confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="confidence-bar-track">
            <div
              className="confidence-bar-fill"
              style={{ width: `${result.style_confidence * 100}%` }}
            ></div>
          </div>
        </div>

        <div className={`auth-badge ${result.authenticity.prediction}`}>
          {result.authenticity.prediction === "genuine" ? (
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
          <span>({(result.authenticity.confidence * 100).toFixed(1)}%)</span>
        </div>

        <div className="compare-heatmap">
          <h4>Attention Map</h4>
          <img
            src={`data:image/jpeg;base64,${result.gradcam_heatmap_base64}`}
            alt="Grad-CAM heatmap"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>Compare Paintings</h1>
        <p>Upload two paintings side by side to compare their styles, authenticity, and visual features.</p>
      </div>

      <div className="upload-controls compare-upload-controls">
        <div className="upload-slots">
          <div className="upload-slot">
            <label>Image 1</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, setImage1, setPreviewUrl1)} 
            />
            {previewUrl1 && <img src={previewUrl1} alt="preview 1" className="preview-img" />}
          </div>
          
          <div className="upload-slot">
            <label>Image 2</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, setImage2, setPreviewUrl2)} 
            />
            {previewUrl2 && <img src={previewUrl2} alt="preview 2" className="preview-img" />}
          </div>
        </div>

        <button 
          className="analyze-btn" 
          onClick={handleCompare} 
          disabled={loading || !image1 || !image2}
        >
          {loading ? "Comparing..." : "Compare Paintings"}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {result1 && result2 && verdict && (
        <div className="compare-results">
          <div className="compare-grid">
            {renderResultColumn(result1, "Image 1 Results")}
            {renderResultColumn(result2, "Image 2 Results")}
          </div>

          <div className="result-card verdict-card">
            <h2>Similarity Verdict</h2>
            <div className={`verdict-badge ${verdict.isMatch ? 'match' : 'no-match'}`}>
              {verdict.title}
            </div>
            
            <div className="confidence-metrics verdict-metrics">
              <div className="confidence-label">
                <span>Computed Similarity Score</span>
                <span>{verdict.score}%</span>
              </div>
              <div className="confidence-bar-track">
                <div
                  className="confidence-bar-fill"
                  style={{ width: `${verdict.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;
