import React from 'react';

const StyleIcon = ({ styleName }) => {
  return (
    <svg className="style-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {styleName?.toLowerCase().includes('warli') && (
        <>
          <circle cx="12" cy="5" r="2" />
          <polygon points="12 7 8 13 16 13 12 7" />
          <polygon points="12 19 8 13 16 13 12 19" />
        </>
      )}
      {styleName?.toLowerCase().includes('madhubani') && (
        <>
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2 v2 M12 20 v2 M2 12 h2 M20 12 h2" />
        </>
      )}
      {styleName?.toLowerCase().includes('gond') && (
        <>
          <path d="M4 18 C4 8 20 8 20 18" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="8" cy="15" r="1" />
          <circle cx="16" cy="15" r="1" />
        </>
      )}
      {(!styleName?.toLowerCase().includes('warli') && !styleName?.toLowerCase().includes('madhubani') && !styleName?.toLowerCase().includes('gond')) && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="12" r="4" />
          <path d="M4 4 L20 20 M20 4 L4 20" strokeWidth="1" />
        </>
      )}
    </svg>
  );
};

export default StyleIcon;
