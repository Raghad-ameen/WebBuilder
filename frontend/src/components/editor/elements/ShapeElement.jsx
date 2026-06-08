import React from "react";
import HoverWrapper from "../../HoverWrapper";

export default function ShapeElement({
  item,
  state,
  cleanFilter
}) {
  const hasGradient =
    item.styles?.background &&
    item.styles.background.includes(
      "gradient"
    );

  const borderWidth =
    parseInt(item.styles?.borderWidth) || 0;

  const borderColor =
    item.styles?.borderColor || "transparent";

  const borderFilter =
    borderWidth > 0
      ? `drop-shadow(0px 0px ${borderWidth}px ${borderColor})`
      : "";

  const combinedFilter = [
    cleanFilter,
    borderFilter
  ]
    .filter(Boolean)
    .join(" ");

  const targetClipPath =
    item.styles?.clipPath || "none";

  return (
    <HoverWrapper
      item={item}
      isPreviewMode={state.isPreviewMode}
    >
      {({ computedStyle, hoverStyles }) => (
        <div
          style={{
            width: "100%",
            height: "100%",

            overflow: "visible",

            clipPath: targetClipPath,

            WebkitClipPath:
              targetClipPath,

            borderRadius:
              item.styles?.borderRadius ||
              "0px",

            filter: combinedFilter,

            boxShadow:
              item.styles?.boxShadow ||
              "none",

            background: hasGradient
              ? item.styles.background
              : "none",

            backgroundColor: hasGradient
              ? "transparent"
              : hoverStyles.backgroundColor ||
                item.styles?.backgroundColor ||
                "#4f46e5",

            ...computedStyle
          }}
        />
      )}
    </HoverWrapper>
  );
}