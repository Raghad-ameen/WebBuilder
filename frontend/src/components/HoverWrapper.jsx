import React, { useState, useMemo } from "react";

export default function HoverWrapper({
  item,
  isPreviewMode,
  children
}) {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyles = useMemo(() => {
    // 1. في وضع المعاينة الفعلي (Live Preview): نعتمد على حركة الماوس
    if (isPreviewMode) {
      return isHovered ? (item.hoverStyles || {}) : {};
    }

    // 2. داخل الـ Editor: إذا قام المصمم بفتح الـ Hover Tab وكان العنصر هو النشط حالياً
    // نبحث في خصائص الـ item للتأكد هل نمرر ستايل الهوفر فوراً أم لا
    if (item.isEditingHoverMode) {
      return item.hoverStyles || {};
    }

    return {};
  }, [isHovered, isPreviewMode, item.hoverStyles, item.isEditingHoverMode]);

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
      onMouseEnter={() => {
        if (isPreviewMode) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (isPreviewMode) setIsHovered(false);
      }}
    >
      {children({
        isHovered,
        hoverStyles,
        computedStyle
      })}
    </div>
  );
}