import React, { useState, useMemo } from "react";

export default function HoverWrapper({
  item,
  isPreviewMode,
  children
}) {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyles = useMemo(() => {
    if (!isPreviewMode || !isHovered) return {};

    return item.hoverStyles || {};
  }, [isHovered, isPreviewMode, item]);

  const computedStyle = {
    transition: "all 0.2s ease",
    ...hoverStyles
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children({
        isHovered,
        hoverStyles,
        computedStyle
      })}
    </div>
  );
}