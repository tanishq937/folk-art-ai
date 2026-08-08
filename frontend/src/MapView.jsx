import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const INDIA_TOPO_JSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/topojson/india.json";

function MapView({ lat, lon, styleName, region }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82, 22], scale: 1000 }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={INDIA_TOPO_JSON}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1a1d24"
                stroke="#3a3f4a"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>

        <Marker 
          coordinates={[lon, lat]} 
          onMouseEnter={() => setIsHovered(true)} 
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: "pointer" }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle r={14} fill="none" stroke="#c9973f" strokeWidth={1.5} className="pulse-ring" />
          <circle r={9} fill="none" stroke="#c9973f" strokeWidth={1.5} className="pulse-ring pulse-ring-delay" />
          <circle 
            r={6} 
            fill="#b8632a" 
            stroke="#fff" 
            strokeWidth={1.5} 
            filter={isHovered ? "url(#glow)" : ""} 
            style={{ transition: "all 0.3s ease" }}
          />
          <text
            textAnchor="middle"
            y={-16}
            style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fill: "#f4ede0", fontWeight: 700, transition: "opacity 0.3s ease", opacity: isHovered ? 0 : 1 }}
          >
            {styleName}
          </text>
          
          {isHovered && region && (
            <g style={{ transition: "opacity 0.3s ease", opacity: 1, animation: "fadeIn 0.3s ease-out" }}>
              <rect x={-75} y={-45} width={150} height={24} fill="#b8632a" rx={4} ry={4} stroke="#c9973f" strokeWidth={1} />
              <text textAnchor="middle" y={-29} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fill: "#f4ede0", fontWeight: 500 }}>
                {region}
              </text>
              <polygon points="-6,-21 6,-21 0,-15" fill="#b8632a" />
            </g>
          )}
        </Marker>
      </ComposableMap>
    </div>
  );
}

export default MapView;