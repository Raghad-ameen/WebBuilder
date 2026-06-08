import React from "react";

export default function LinkElement({
  item,
  state,
   store, 
  isSelected,
  cleanFilter,
  hoverStyles,
  updateItem,
  activePageId,
  section,
  setIsFormVisible,
  handleSubmitForm,
  handleItemAction,
  handleDoubleClick
}) {

  const isColorGradient =
    item.styles?.color &&
    item.styles.color.includes("gradient");

  const {
    color: itemColor,
    fontSize: itemFontSize,
    textDecoration: itemDecoration,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    textAlign,
    ...containerStyles
  } = item.styles || {};

  return (
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"

      contentEditable={isSelected && !state.isPreviewMode}
      suppressContentEditableWarning

      onDoubleClick={handleDoubleClick}

      onBlur={(e) => {
        updateItem(activePageId, section.id, item.id, {
          text: e.target.innerText
        });
      }}

onClick={(e) => {
  if (!state.isPreviewMode) {
    if (!e.ctrlKey) e.preventDefault();
    return;
  }

if (item.action?.type === "submit_form") {
  e.preventDefault();

  store.setState(prev => ({
    ...prev,
    activeFormSectionId: section.id
  }));

  return;
}


if (item.action?.type && item.action?.type !== "url") {
    e.preventDefault();
    handleItemAction(item);
  }
}}

style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        cursor: state.isPreviewMode ? "pointer" : "text",
        userSelect: state.isPreviewMode ? "none" : "text",

        pointerEvents: "auto",
        outline: "none",

        filter: cleanFilter,

        background: item.styles?.background || "none",
        backgroundColor:
          item.styles?.background
            ? "transparent"
            : (item.styles?.backgroundColor || "transparent"),

        fontSize: itemFontSize || "16px",
        fontFamily: fontFamily || "inherit",
        fontWeight: fontWeight || "normal",
        fontStyle: fontStyle || "normal",
        letterSpacing: letterSpacing || "normal",
        textAlign: textAlign || "center",

        color: isColorGradient
          ? "transparent"
          : (itemColor || "inherit"),

        ...(isColorGradient && {
          backgroundImage: itemColor,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }),

        ...containerStyles
      }}
    >
      {item.text || "Link Text"}
    </a>
  );
}