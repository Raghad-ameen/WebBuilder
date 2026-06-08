import React from "react";
import HoverWrapper from "../../HoverWrapper";

export default function TextElement({
  item,
  state,
  store,
  section,
  isMobile,
  cleanFilter
}) {

  const isColorGradient =
    item.styles?.color &&
    item.styles.color.includes("gradient");

  const shadowBlur =
    item.styles?.blur !== undefined
      ? `${item.styles.blur}px`
      : "2px";

  const shadowColor =
    item.styles?.shadowColor ||
    "rgba(0,0,0,0.5)";

  const hasTextShadow =
    item.styles?.shadowColor ||
    parseInt(item.styles?.blur) > 0;

  return (
    <HoverWrapper
      item={item}
      isPreviewMode={state.isPreviewMode}
    >
      {({ computedStyle, hoverStyles }) => (
        <div
          className="text-element-wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent:
              item.styles?.textAlign === "right"
                ? "flex-end"
                : item.styles?.textAlign === "center"
                ? "center"
                : "flex-start",

            background:
              item.styles?.background ||
              item.styles?.backgroundImage ||
              "none",

            filter: cleanFilter,

            ...computedStyle
          }}
        >
          {!item.isEditing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                cursor: "move"
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();

                store.updateItem(
                  state.activePageId,
                  section.id,
                  item.id,
                  {
                    isEditing: true
                  }
                );
              }}
            />
          )}

          <div
            contentEditable={item.isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              store.updateItem(
                state.activePageId,
                section.id,
                item.id,
                {
                  text: e.target.innerText,
                  isEditing: false
                }
              );
            }}
            style={{
              ...item.styles,

              width: "auto",
              minWidth: "50px",

              outline: "none",

              fontSize: isMobile
                ? "clamp(12px,4vw,18px)"
                : item.styles?.fontSize || "16px",

              lineHeight: "1.2",

              wordBreak: "break-word",

              overflowWrap: "anywhere",

              whiteSpace: "normal",

              color:
                hoverStyles.color ||
                item.styles?.color ||
                "inherit",

              textShadow: hasTextShadow
                ? `2px 2px ${shadowBlur} ${shadowColor}`
                : "none",

              ...(isColorGradient
                ? {
                    backgroundImage: item.styles.color,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:
                      "transparent"
                  }
                : {})
            }}
          >
            {item.text || "Type your text..."}
          </div>
        </div>
      )}
    </HoverWrapper>
  );
}