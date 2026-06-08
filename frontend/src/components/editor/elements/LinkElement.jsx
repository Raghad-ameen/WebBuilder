import React from "react";

export default function LinkElement({
  item,
  state,
  store, 
  isSelected,
  cleanFilter,
  updateItem,
  activePageId,
  section,
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
      contentEditable={isSelected && !state.isPreviewMode}
      suppressContentEditableWarning

      onDoubleClick={handleDoubleClick}

      onBlur={(e) => {
        updateItem(activePageId, section.id, item.id, {
          text: e.target.innerText
        });
      }}

      onClick={(e) => {
        // إذا كنا في وضع التصميم (Editor)، نمنع اللينك تماماً من أي حركة أو نقل
        if (!state.isPreviewMode) {
          if (!e.ctrlKey) e.preventDefault();
          return;
        }

        // 🌟 منع اللينك من إضافة '#' للرابط وعمل Scroll لأعلى الصفحة
        e.preventDefault(); 
        e.stopPropagation();

        console.log("🎯 Link clicked! Action Type:", item.action?.type);

        // 1. دعم أكشن الـ Submit (سواء فورم البوب أب أو الإرسال الصامت الجديد)
        if (item.action?.type === "submit_form" || item.action?.type === "submit") {
          if (typeof handleSubmitForm === "function") {
            // نمرر الـ item.id كمعامل رابع لمعرفة مكان الضغطة
            handleSubmitForm(section.id, item.action, false, item.id);
          }
        } 
        // 2. دعم بقية الأكوام (مثل الانتقال، السكرول، الروابط الخارجية، أو الـ link_element التوجيهي)
        else if (item.action?.type && item.action?.type !== "none") {
          if (typeof handleItemAction === "function") {
            handleItemAction(item);
          }
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
        textDecoration: itemDecoration || "none", // دعم خط اللينك السفلي إن وجد

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