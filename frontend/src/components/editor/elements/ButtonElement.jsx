import React from "react";
import HoverWrapper from "../../HoverWrapper";

export default function ButtonElement({
  item,
  state,
  store,
  section,
  isSelected,
  cleanFilter,
  handleItemAction,
  handleSubmitForm,
  isFormVisible,
  setIsFormVisible
}) {
  return (
    <HoverWrapper
      item={item}
      isPreviewMode={state.isPreviewMode}
    >
      {({ computedStyle, hoverStyles }) => (
        <div
          className="button-container-wrapper"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: cleanFilter,
            background: item.styles?.background || "none",
            backgroundColor:
              hoverStyles.backgroundColor ||
              item.styles?.backgroundColor ||
              "#4f46e5",
            borderRadius: item.styles?.borderRadius || "6px",
            cursor: state.isPreviewMode ? "pointer" : "move",
            position: "relative",
            ...computedStyle
          }}
onClick={(e) => {
  e.stopPropagation();

  if (state.isPreviewMode) {
    console.log("🎯 Button clicked! Action Type:", item.action?.type);

    // 1. التحقق من أكينات الفورم
    if (item.action?.type === "submit_form" || item.action?.type === "submit" || item.actionType === "SubmitData") {
      
      if (typeof handleSubmitForm === "function") {
        // 🌟 استدعاء الدالة بترتيبها الأصلي المتوقع:
        // البارامتر الأول: section.id
        // البارامتر الثاني: item.action (الذي يحتوي داخله على الـ payload والـ Checkboxes)
        // البارامتر الثالث: false (قيمة الـ isPopup الافتراضية)
        // البارامتر الرابع: item.id (المعرّف الفريد للزر المكبوس)
        handleSubmitForm(section.id, item.action, false, item.id);
      }
    } 
    // 2. التحقق من الأكينات الأخرى (مثل الانتقال لروابط أو صفحات)
    else if (item.action?.type && item.action.type !== "none") {
      if (typeof handleItemAction === "function") {
        handleItemAction(item);
      }
    }
  }
}}          
          >


          <span
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
              color:
                hoverStyles.color ||
                item.textStyles?.color ||
                "#fff",
              fontSize: item.textStyles?.fontSize || "16px",
              width: "100%",
              textAlign: "center",
              outline: "none"
            }}
          >
            {item.text || "Button"}
          </span>
        </div>
      )}
    </HoverWrapper>
  );
}