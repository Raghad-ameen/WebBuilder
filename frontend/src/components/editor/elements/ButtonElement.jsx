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

              if (item.action?.type === "submit_form" || item.action?.type === "submit") {
                if (typeof handleSubmitForm === "function") {
                  handleSubmitForm(section.id, item.action, false, item.id);
                }
              } 
              else if (item.action?.type && item.action.type !== "none") {
                if (typeof handleItemAction === "function") {
                  handleItemAction(item);
                }
              }
            }
          }}>


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