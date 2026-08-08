import { useState, useEffect } from "react";
import axios from "axios";
import StyleIcon from "../components/StyleIcon";
import MapView from "../MapView";

const getBgImage = (key) => {
  const images = {
    warli: "/bg-samples/warli64.jpg",
    kalighat: "/bg-samples/kalighat10.jpg",
    gond: "/bg-samples/gond23.jpg",
    kerala_mural: "/bg-samples/kerala32.jpg",
    kangra: "/bg-samples/kangra43.jpeg",
    madhubani: "/bg-samples/madhubani64.jpg",
    mandana_art: "/bg-samples/mandana23.jpg",
    pichwai: "/bg-samples/pichwai23.jpg",
  };
  return images[key] || null;
};

function Gallery() {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStyle, setExpandedStyle] = useState(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/styles");
        setStyles(response.data.styles);
      } catch (err) {
        console.error(err);
        setError("Failed to load gallery data. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchStyles();
  }, []);

  if (loading) return <div className="gallery-loading">Loading Exhibition...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Museum Gallery</h1>
        <p>Explore the rich cultural heritage and symbolism of Indian Folk Art.</p>
      </div>

      <div className="gallery-grid">
        {styles.map((style) => {
          const isExpanded = expandedStyle === style.original_key;
          const bgImg = getBgImage(style.original_key);
          
          return (
            <div 
              key={style.original_key} 
              className={`gallery-card result-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedStyle(isExpanded ? null : style.original_key)}
            >
              {bgImg && !isExpanded && (
                <div 
                  className="gallery-card-bg"
                  style={{ backgroundImage: `url(${bgImg})` }}
                />
              )}
              <div className="gallery-card-overlay"></div>
              
              <div className="gallery-card-content">
                <div className="style-title-group">
                  <StyleIcon styleName={style.original_key} />
                  <h2>{style.style}</h2>
                </div>
                
                <p className="gallery-region">
                  {style.region}, {style.state}
                </p>

                {!isExpanded ? (
                  <p className="gallery-excerpt">
                    {style.history.length > 120 
                      ? style.history.substring(0, 120) + "..." 
                      : style.history}
                  </p>
                ) : (
                  <div className="gallery-expanded-content fade-in">
                    {bgImg && (
                      <img 
                        src={bgImg} 
                        alt={`${style.style} artwork`} 
                        className="gallery-expanded-image"
                      />
                    )}
                    <div className="cultural-details">
                      <p><strong>History:</strong> {style.history}</p>
                      <p><strong>Symbolism:</strong> {style.symbolism}</p>
                    </div>
                    <div className="map-container" onClick={(e) => e.stopPropagation()}>
                      <MapView
                        lat={style.coordinates.lat}
                        lon={style.coordinates.lon}
                        styleName={style.style}
                      />
                    </div>
                    {style.youtube_id && (
                      <div className="gallery-video-container" onClick={(e) => e.stopPropagation()}>
                        <h3>Learn More (Documentary)</h3>
                        <iframe 
                          src={`https://www.youtube.com/embed/${style.youtube_id}`}
                          title={`${style.style} Documentary`}
                          className="gallery-youtube-iframe"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="gallery-card-hint">
                  {isExpanded ? "Click to collapse" : "Click to explore"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Gallery;
