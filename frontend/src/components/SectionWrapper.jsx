import React from "react";

export default function SectionWrapper({ section, isSelected, onSelect, children }) {
  
  const handleSectionClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onSelect(section.id);
    }
  };

  return (
    <div
      onClick={handleSectionClick}
      className={`section-wrapper ${isSelected ? 'is-selected' : ''}`}
      style={{
        position: "relative",
        width: "100%",
        height: section.styles?.height || "auto",
        minHeight: "100px",
        backgroundColor: section.styles?.backgroundColor || "transparent",
        backgroundImage: section.styles?.backgroundImage || "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: section.styles?.padding || "0px",
        boxShadow: section.styles?.shadow || "none",
        overflow: "visible", 
        zIndex: isSelected ? 10 : 1,
        borderTop: "1px dashed #e2e8f0",
        transition: "background-color 0.2s ease"
      }}
    >
      {children}

      {isSelected && (
        <div style={{
          position: "absolute",
          inset: 0,
          border: "2px solid #4f46e5",
          pointerEvents: "none", 
          zIndex: 9999
        }} />
      )}
    </div>
  );
}