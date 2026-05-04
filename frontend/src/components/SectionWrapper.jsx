import { Rnd } from "react-rnd";

export default function SectionWrapper({ section, isSelected, onSelect, updateSection, children }) {
  
  const handleSectionClick = (e) => {
    e.stopPropagation();
    onSelect(section.id);
  };

  return (
    <Rnd
      size={{ 
        width: "100%", 
        height: section.styles?.height || "auto" 
      }}
      position={{ x: 0, y: section.y || 0 }}
      dragAxis="y" 
      disableDragging={false} 
      enableResizing={{ 
        bottom: true, 
        top: false, right: false, left: false, 
        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false 
      }}
      onDragStop={(e, d) => {
        updateSection(section.id, { y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateSection(section.id, {
          styles: { ...section.styles, height: ref.offsetHeight } 
        });
      }}
      onClick={handleSectionClick}
      style={{
        border: isSelected ? "2px solid #4f46e5" : "1px solid transparent",
        borderTop: isSelected ? "2px solid #4f46e5" : "1px dashed #e2e8f0",
        position: "relative",
        backgroundColor: section.styles?.backgroundColor || "transparent",
        backgroundImage: section.styles?.backgroundImage || "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: section.styles?.padding || "0px",
        boxShadow: section.styles?.shadow || "none",
        overflow: "visible",
        zIndex: isSelected ? 10 : 1
      }}
      className={`section-container ${isSelected ? 'is-selected' : ''}`}
    >
      {children}
      
      {isSelected && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 cursor-ns-resize" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-lg z-50">
             <span className="text-indigo-600 text-xs">↕</span>
          </div>
        </>
      )}
    </Rnd>
  );
}