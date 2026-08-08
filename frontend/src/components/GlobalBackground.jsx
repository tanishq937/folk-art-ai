import React, { useState, useEffect } from "react";
import "./GlobalBackground.css";

const bgImages = [
  "/bg-samples/gond23.jpg",
  "/bg-samples/gond24.webp",
  "/bg-samples/kalighat10.jpg",
  "/bg-samples/kalighat11.jpg",
  "/bg-samples/kerala32.jpg",
  "/bg-samples/kerala33.jpg",
  "/bg-samples/warli64.jpg",
  "/bg-samples/warli65.jpg",
];

const GlobalBackground = () => {
  const [activeBgIndex, setActiveBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000); // 6s to allow smooth crossfade and ken burns
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="global-bg-container">
      <div className="global-bg-slider">
        {bgImages.map((src, index) => (
          <div
            key={src}
            className={`global-slide ${index === activeBgIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="global-overlay"></div>
    </div>
  );
};

export default GlobalBackground;
