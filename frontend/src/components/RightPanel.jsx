import React, { useMemo, useEffect } from "react";
import { debounce } from "lodash";

export default function RightPanel({ store }) {
  const { state, updateItem, previewUpdateItem, updateSection } = store;

  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const selectedId = state.selectedElementIds?.[0] || state.activeElementId;
  
let selectedItem = null;
  if (selectedId && activePage) {
    activePage.sections.forEach((section) => {
      const item = section.data.items?.find((it) => it.id === selectedId);
      if (item) {
        selectedItem = { ...item, sectionId: section.id };
      }
    });
  }

const selectedSection = useMemo(() => {
    if (!selectedId || !activePage || selectedItem) return null;
    return activePage.sections.find(s => s.id === selectedId);
  }, [selectedId, activePage, selectedItem]);

  

  const debouncedSave = useMemo(
    () =>
      debounce((pageId, sectionId, itemId, data) => {
        updateItem(pageId, sectionId, itemId, data);
      }, 500),
    [updateItem]
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  const handleStylePreview = (key, value) => {
    if (!selectedItem) return;
    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      styles: { ...selectedItem.styles, [key]: value },
    });
  };

  const handleTextPreview = (value) => {
    if (!selectedItem) return;
    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      text: value,
    });
  };

  const handleStyleCommit = (key, value) => {
    if (!selectedItem) return;
    const newStyles = { ...selectedItem.styles, [key]: value };
    if (key === "clipPath" && value !== "none") {
      newStyles.borderRadius = "0px";
    }
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      styles: newStyles
    });
  };

return (
    <div className="properties-panel" style={styles.panel}>
      <h3 style={styles.title}>Properties</h3>

      {selectedItem ? (
        <div style={styles.controls}>
          {/* 1. قسم المحتوى */}
          <div style={styles.group}>
            <label style={styles.label}>Content</label>
            <input
              type="text"
              value={selectedItem.text || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleTextPreview(val);
                debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { text: val });
              }}
              style={styles.input}
            />
          </div>

          <hr style={styles.divider} />

          {/* 2. قسم الحجم */}
          <div style={styles.group}>
            <label style={styles.label}>Dimensions</label>
            <div style={styles.row}>
              <div style={styles.col}>
                <span style={styles.unit}>W</span>
                <input
                  type="number"
                  value={Math.round(selectedItem.width) || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, { width: val, styles: { ...selectedItem.styles, width: val } });
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { width: val, styles: { ...selectedItem.styles, width: val } });
                  }}
                  style={styles.smallInput}
                />
              </div>
              <div style={styles.col}>
                <span style={styles.unit}>H</span>
                <input
                  type="number"
                  value={Math.round(selectedItem.height) || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, { height: val, styles: { ...selectedItem.styles, height: val } });
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { height: val, styles: { ...selectedItem.styles, height: val } });
                  }}
                  style={styles.smallInput}
                />
              </div>
            </div>
          </div>

          {/* 3. Typography */}
          {(selectedItem.type === "text" || selectedItem.type === "button") && (
            <div style={styles.group}>
              <label style={styles.label}>Typography</label>
              <div style={styles.field}>
                <span style={styles.subLabel}>Family</span>
                <select
                  value={selectedItem.styles?.fontFamily || "Inter"}
                  onChange={(e) => handleStyleCommit("fontFamily", e.target.value)}
                  style={styles.input}
                >
                  <option value="'Plus Jakarta Sans', sans-serif">Jakarta</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="'Cairo', sans-serif">Cairo (Arabic)</option>
                  <option value="'Inter', sans-serif">Inter</option>
                </select>
              </div>
              
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 2 }}>
                  <span style={styles.subLabel}>Size</span>
                  <input
                    type="number"
                    value={parseInt(selectedItem.styles?.fontSize) || 16}
                    onChange={(e) => {
                      const val = `${e.target.value}px`;
                      handleStylePreview("fontSize", val);
                      debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { 
                        styles: { ...selectedItem.styles, fontSize: val } 
                      });
                    }}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Image/Button/Shape Specific Styles */}
          {selectedItem.type === "image" && (
            <div style={styles.group}>
              <label style={styles.label}>Image Style</label>
              <div style={styles.field}>
                <span style={styles.subLabel}>Corners</span>
                <input
                  type="range" min="0" max="100"
                  value={parseInt(selectedItem.styles?.borderRadius) || 0}
                  onChange={(e) => {
                    const val = `${e.target.value}px`;
                    handleStylePreview("borderRadius", val);
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, borderRadius: val } });
                  }}
                />
              </div>
            </div>
          )}

          {(selectedItem.type === "button" || selectedItem.type === "shape") && (
            <div style={styles.group}>
              <label style={styles.label}>{selectedItem.type === "button" ? "Button Color" : "Shape Color"}</label>
              <input
                type="color"
                value={selectedItem.styles?.backgroundColor || "#4f46e5"}
                onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
                onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
                style={styles.fullColorPicker}
              />
            </div>
          )}

          {/* 5. Decoration & Appearance */}
          <div style={styles.group}>
            <label style={styles.label}>Decoration</label>
            <div style={styles.row}>
              {[
                { key: "fontWeight", val: "700", label: "B", normal: "400" },
                { key: "fontStyle", val: "italic", label: "I", normal: "normal" },
                { key: "textDecoration", val: "underline", label: "U", normal: "none" },
              ].map((btn) => {
                const isActive = selectedItem.styles?.[btn.key] === btn.val;
                return (
                  <button
                    key={btn.key}
                    onClick={() => handleStyleCommit(btn.key, isActive ? btn.normal : btn.val)}
                    style={{
                      ...styles.formatBtn,
                      backgroundColor: isActive ? "#e2e8f0" : "white",
                      border: isActive ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                    }}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <span style={styles.tinyLabel}>Text Color</span>
                <input
                  type="color"
                  value={selectedItem.styles?.color || "#000000"}
                  onChange={(e) => handleStylePreview("color", e.target.value)}
                  onBlur={(e) => handleStyleCommit("color", e.target.value)}
                  style={styles.fullColorPicker}
                />
              </div>
            </div>

            {/* تم نقل Opacity هنا ليكون جزءاً من مظهر العنصر */}
            <hr style={styles.divider} />
            <label style={styles.subLabel}>Opacity ({Math.round((selectedItem.styles?.opacity || 1) * 100)}%)</label>
            <input
              type="range" min="0" max="1" step="0.01"
              style={{ width: "100%" }}
              value={selectedItem.styles?.opacity || 1}
              onChange={(e) => handleStylePreview("opacity", parseFloat(e.target.value))}
              onBlur={(e) => handleStyleCommit("opacity", parseFloat(e.target.value))}
            />
          </div>
        </div>
      ) : selectedSection ? (
        <div style={styles.controls}>
          <div style={styles.group}>
            <label style={styles.label}>Section Layout</label>

            <div style={styles.field}>
              <span style={styles.subLabel}>Background Color</span>
              <input
                type="color"
                value={selectedSection.styles?.backgroundColor || "#ffffff"}
                onChange={(e) => {
                  updateSection(state.activePageId, selectedSection.id, {
                    styles: { ...selectedSection.styles, backgroundColor: e.target.value }
                  });
                }}
                style={styles.fullColorPicker}
              />
            </div>

            <div style={styles.field}>
              <span style={styles.subLabel}>Section Height (px)</span>
              <input
                type="number"
                value={selectedSection.height || 400} 
                onChange={(e) => {
                  updateSection(state.activePageId, selectedSection.id, {
                    height: parseInt(e.target.value) || 0 
                  });
                }}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <span style={styles.subLabel}>Background Image</span>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateSection(state.activePageId, selectedSection.id, {
                        styles: { ...selectedSection.styles, backgroundImage: `url(${event.target.result})` }
                      });
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  width: "100%"
                }}
              >
                Upload Image
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>Select a section or element to edit</div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    width: "280px",
    background: "#ffffff",
    borderLeft: "1px solid #e2e8f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.02)",
    overflowY: "auto"
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "24px"
  },
  emptyState: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "40px",
    fontSize: "0.9rem",
    fontStyle: "italic"
  },
group: {
  marginBottom: "16px",
  padding: "16px",
  backgroundColor: "#f8fafc", 
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
},
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "10px"
  },
 subLabel: {
  fontSize: "0.7rem",
  color: "#64748b",
  fontWeight: "bold",
  textTransform: "uppercase"
},
 field: {
  display: "flex",
  flexDirection: "column", 
  alignItems: "flex-start",
  gap: "6px",
  marginBottom: "8px"
},
input: {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "0.85rem",
  outline: "none"
},
  smallInput: {
    width: "60px",
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem"
  },
  colorPicker: {
    flex: 1,
    height: "30px",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    cursor: "pointer"
  },
row: {
  display: "flex",
  gap: "12px",
  width: "100%"
},
  col: {
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  unit: {
    fontSize: "0.7rem",
    color: "#94a3b8",
    fontWeight: "bold"
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f1f5f9",
    margin: "15px 0"
  },
  colorPickerSmall: {
    width: "100%",
    height: "32px",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    cursor: "pointer"
  },
  alignGroup: {
    display: "flex",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    overflow: "hidden",
    flex: 1,
    marginLeft: "10px"
  },
  alignButton: {
    flex: 1,
    border: "none",
    borderRight: "1px solid #cbd5e1",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white"
  },
  tinyLabel: {
    fontSize: "0.6rem",
    color: "#94a3b8",
    textTransform: "uppercase"
  },
  tagButton: {
    padding: "2px 8px",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "0.75rem",
    cursor: "pointer",
    background: "white",
    marginRight: "5px",
    fontWeight: "bold"
  },
formatBtn: {
  flex: 1,
  height: "35px",
  cursor: "pointer",
  fontSize: "1rem",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
},
fullColorPicker: {
  width: "100%",
  height: "35px",
  padding: "2px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "4px"
},
};