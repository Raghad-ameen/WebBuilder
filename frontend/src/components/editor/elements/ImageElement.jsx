import React from "react";
import HoverWrapper from "../../HoverWrapper";

export default function ImageElement({
  item,
  state,
  isSelected,
  cleanFilter,
  updateItem,
  activePageId,
  section
}) {
  return (
    <HoverWrapper
      item={item}
      isPreviewMode={state.isPreviewMode}
    >
      {({ computedStyle }) => {
        const { transform, ...otherHoverStyles } = computedStyle || {};

        return (
          <div
            style={{
              ...item.styles,

              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              backgroundColor: item.src
                ? "transparent"
                : item.styles?.backgroundColor || "#f8fafc",

              border: item.src
                ? item.styles?.border || "none"
                : "1px dashed #cbd5e1",

              borderRadius: item.styles?.borderRadius || "8px",
              zIndex: isSelected ? 2000 : 100,
              filter: cleanFilter,
              boxShadow: item.styles?.boxShadow || "none",

              transition: `all ${item.styles?.transitionSpeed || 0.2}s ease`,
              
              ...otherHoverStyles,
              transform: transform || item.styles?.transform || "none"
            }}
          >
            {item.src ? (
              <img
                src={item.src}
                alt="Uploaded"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: item.styles?.objectFit || "cover",
                  pointerEvents: "none",
                  display: "block",
                  
                  transition: `inherit` 
                }}
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();

                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";

                  input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        updateItem(activePageId, section.id, item.id, {
                          src: e.target.result
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };

                  input.click();
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: "8px",
                  color: item.styles?.color || "#64748b",
                  transition: "inherit" 
                }}
              >
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>+</span>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>add image</span>
              </div>
            )}
          </div>
        );
      }}
    </HoverWrapper>
  );
}