import React from "react";
import HoverWrapper from "../../HoverWrapper";

export default function InputElement({
  item,
  state,
  cleanFilter
}) {

  const getInputValue = () => {
    if (item.inputType === "color") {
      return item.styles?.backgroundColor && item.styles.backgroundColor !== "transparent"
        ? item.styles.backgroundColor
        : "#ffffff";
    }
    return undefined;
  };

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
            position: "relative",
            background: "transparent"
          }}
        >

          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "4px",

              fontSize:
                item.styles?.labelFontSize ||
                "12px",

              color:
                item.styles?.labelColor &&
                !item.styles.labelColor.includes("gradient")
                  ? item.styles.labelColor
                  : "#4f46e5",

              fontWeight: "600",

              whiteSpace: "nowrap",

              pointerEvents: "none",

              zIndex: 10
            }}
          >
            {item.name || "Field Label"}
          </div>

          <input
            id={`input-${item.id}`}

            type={item.inputType || "text"}
             required={item.required || false}
  pattern={item.pattern}
  min={item.min}
  max={item.max}


          defaultValue=""

            placeholder={
              item.placeholder ||
              "Enter text..."
            }

            disabled={!state.isPreviewMode}

            style={{
              width: "100%",
              height: "100%",

              boxSizing: "border-box",

              margin: 0,

              padding: "0 10px",

              border:
                item.styles?.border ||
                "1px solid #cbd5e1",

              borderRadius:
                item.styles?.borderRadius ||
                "6px",

              outline: "none",

              fontSize:
                item.styles?.fontSize ||
                "14px",

              pointerEvents:
                state.isPreviewMode
                  ? "auto"
                  : "none",

              ...computedStyle,

              filter: cleanFilter,

              backgroundImage: item.styles?.background && item.styles.background.includes("gradient")
                ? item.styles.background
                : "none",

              backgroundColor:
                hoverStyles.backgroundColor ||
                item.styles?.backgroundColor ||
                "#ffffff",

              color:
                hoverStyles.color ||
                item.styles?.color ||
                "#1e293b"
            }}
          />

        </div>
      )}

    </HoverWrapper>
  );
}