import React, { useMemo, useEffect } from "react";
import { debounce } from "lodash"; 
export default function RightPanel({ store }) {
  const { state, updateItem, previewUpdateItem } = store;

  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const selectedSection = activePage?.sections.find((s) => s.id === state.selectedSectionId);
const selectedId = state.selectedElementIds?.[0] || state.activeElementId;  let selectedItem = null;

  if (selectedId && activePage) {
    activePage.sections.forEach((section) => {
      const item = section.data.items.find((it) => it.id === selectedId);
      if (item) selectedItem = { ...item, sectionId: section.id };
    });
  }


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
    styles: { 
      ...selectedItem.styles, 
      [key]: value 
    },
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
  
  const newStyles = { 
    ...selectedItem.styles, 
    [key]: value 
  };

  if (key === "clipPath" && value !== "none") {
    newStyles.borderRadius = "0px";
  }

  updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
    styles: newStyles
  });
};

  const handleTextCommit = (value) => {
    if (!selectedItem) return;
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      text: value,
    });
  };


 return (
  <div className="properties-panel" style={styles.panel}>
    <h3 style={styles.title}>Properties</h3>

    {/* الحالة الأولى: اختيار عنصر (ITEM) */}
    {selectedItem ? (
      <div style={styles.controls}>
        {/* 1. قسم المحتوى - النص */}
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

        {/* 2. قسم الحجم (Dimensions) */}
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
                  previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
                    width: val,
                    styles: { ...selectedItem.styles, width: val },
                  });
                  debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, {
                    width: val,
                    styles: { ...selectedItem.styles, width: val },
                  });
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
                  previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
                    height: val,
                    styles: { ...selectedItem.styles, height: val },
                  });
                  debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, {
                    height: val,
                    styles: { ...selectedItem.styles, height: val },
                  });
                }}
                style={styles.smallInput}
              />
            </div>
          </div>
        </div>

        {/* 3. قسم التنسيق (Typography) */}
        {selectedItem.type === "text" && (
          <div style={styles.group}>
            <label style={styles.label}>Typography</label>
            <div style={styles.field}>
              <span style={styles.subLabel}>Family</span>
              <select
                value={selectedItem.styles?.fontFamily || "Inter"}
                onChange={(e) => handleStyleCommit("fontFamily", e.target.value)}
                style={styles.input}
              >
                <option value="'Plus Jakarta Sans', sans-serif">Jakarta (Default)</option>
                <option value="'Righteous', cursive">Righteous (Retro)</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                <option value="'Inter', sans-serif">Inter (Clean)</option>
                <option value="'Bebas Neue', sans-serif">Bebas Neue (Bold)</option>
                <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Syne', sans-serif">Syne (Artistic)</option>
                <option value="'Cairo', sans-serif">Cairo (Arabic)</option>
                <option value="'Tajawal', sans-serif">Tajawal (Soft Arabic)</option>
                <option value="'Almarai', sans-serif">Almarai (Corporate)</option>
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
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, fontSize: val } });
                  }}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.row}>
              <select
                value={selectedItem.styles?.fontWeight || "400"}
                onChange={(e) => handleStyleCommit("fontWeight", e.target.value)}
                style={{ ...styles.input, width: "50%" }}
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
              <div style={styles.alignGroup}>
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleStyleCommit("textAlign", align)}
                    style={{
                      ...styles.alignButton,
                      background: selectedItem.styles?.textAlign === align ? "#e2e8f0" : "transparent",
                      borderBottom: selectedItem.styles?.textAlign === align ? "2px solid #4f46e5" : "none",
                    }}
                  >
                    {align === "left" ? "⊢" : align === "center" ? "≡" : "⊣"}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <span style={styles.subLabel}>Spacing</span>
              <div style={styles.row}>
                <div style={styles.col}>
                  <span style={styles.tinyLabel}>Letter</span>
                  <input
                    type="number"
                    step="0.1"
                    value={parseFloat(selectedItem.styles?.letterSpacing) || 0}
                    onChange={(e) => {
                      const valWithUnit = `${e.target.value}px`;
                      handleStylePreview("letterSpacing", valWithUnit);
                      debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, letterSpacing: valWithUnit } });
                    }}
                    style={styles.smallInput}
                  />
                </div>
                <div style={styles.col}>
                  <span style={styles.tinyLabel}>Line</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedItem.styles?.lineHeight || 1.2}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleStylePreview("lineHeight", val);
                      debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, lineHeight: val } });
                    }}
                    style={styles.smallInput}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. قسم الصور */}
        {selectedItem.type === "image" && (
          <div style={styles.group}>
            <label style={styles.label}>Image Style</label>
            <div style={styles.field}>
              <span style={styles.subLabel}>Corners (Roundness)</span>
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
            <div style={styles.row}>
              <div style={{ flex: 2 }}>
                <span style={styles.tinyLabel}>Border Width</span>
                <input
                  type="number"
                  value={parseInt(selectedItem.styles?.borderWidth) || 0}
                  onChange={(e) => handleStyleCommit("borderWidth", `${e.target.value}px`)}
                  style={styles.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={styles.tinyLabel}>Color</span>
                <input
                  type="color"
                  value={selectedItem.styles?.borderColor || "#000000"}
                  onChange={(e) => handleStyleCommit("borderColor", e.target.value)}
                  style={styles.fullColorPicker}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. قسم الأزرار */}
        {selectedItem.type === "button" && (
          <div style={styles.group}>
            <label style={styles.label}>Button Style</label>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <span style={styles.tinyLabel}>Color</span>
                <input
                  type="color"
                  value={selectedItem.styles?.backgroundColor || "#4f46e5"}
                  onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
                  onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
                  style={styles.fullColorPicker}
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. قسم الأشكال */}
        {selectedItem.type === "shape" && (
          <div style={styles.group}>
            <label style={styles.label}>Shape Properties</label>
            <div style={styles.field}>
              <span style={styles.subLabel}>Fill Color</span>
              <input
                type="color"
                value={selectedItem.styles?.backgroundColor || "#4f46e5"}
                onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
                onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
                style={styles.fullColorPicker}
              />
            </div>
          </div>
        )}

        {/* 7. قسم الديكور العام للأدوات */}
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
        </div>
      </div>
    ) : selectedSection ? (
      /* الحالة الثانية: اختيار سكشن (SECTION) */
      <div style={styles.controls}>
        <div style={styles.group}>
          <label style={styles.label}>Section Layout</label>

          <div style={styles.field}>
            <span style={styles.subLabel}>Background</span>
            <input
              type="color"
              value={selectedSection.styles?.backgroundColor || "#ffffff"}
              onChange={(e) =>
                updateSection(selectedSection.id, {
                  styles: { ...selectedSection.styles, backgroundColor: e.target.value },
                })
              }
              style={styles.fullColorPicker}
            />
          </div>

          <div style={styles.field}>
            <span style={styles.subLabel}>Vertical Spacing (Padding)</span>
            <input
              type="range"
              min="0"
              max="200"
              value={parseInt(selectedSection.styles?.paddingBlock) || 40}
              onChange={(e) =>
                updateSection(selectedSection.id, {
                  styles: { ...selectedSection.styles, paddingBlock: `${e.target.value}px` },
                })
              }
              style={{ width: "100%" }}
            />
          </div>

          <div style={styles.field}>
            <span style={styles.subLabel}>Minimum Height</span>
            <input
              type="number"
              value={parseInt(selectedSection.styles?.minHeight) || 300}
              onChange={(e) =>
                updateSection(selectedSection.id, {
                  styles: { ...selectedSection.styles, minHeight: `${e.target.value}px` },
                })
              }
              style={styles.input}
            />
          </div>
        </div>
      </div>
    ) : (
      /* الحالة الثالثة: لا يوجد اختيار */
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