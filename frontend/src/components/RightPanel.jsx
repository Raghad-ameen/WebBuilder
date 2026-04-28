import React, { useMemo, useEffect } from "react";
import { debounce } from "lodash"; 
export default function RightPanel({ store }) {
  const { state, updateItem, previewUpdateItem } = store;

  // جلب الصفحة النشطة
  const activePage = state.pages.find((p) => p.id === state.activePageId);
  
  // العثور على العنصر المختار حالياً
  const selectedId = state.selected?.[0];
  let selectedItem = null;

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
      }, 500), // انتظر 500 ملي ثانية بعد توقف الحركة للحفظ
    [updateItem]
  );

  // تنظيف التايمر عند إغلاق المكون لمنع تسريب الذاكرة
  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  // --- 1. دوال المعاينة (Preview): تُحدث الواجهة فوراً دون حفظ في التاريخ ---
  
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

  // --- 2. دوال الحفظ (Commit): تُسجل الخطوة في تاريخ التراجع (Undo) ---

  const handleStyleCommit = (key, value) => {
    if (!selectedItem) return;
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      styles: { ...selectedItem.styles, [key]: value },
    });
  };

  const handleTextCommit = (value) => {
    if (!selectedItem) return;
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      text: value,
    });
  };

 // ... نفس الكود العلوي (الدوال والتعريفات) ...

  return (
    <div className="properties-panel" style={styles.panel}>      
      <h3 style={styles.title}>Properties</h3>

      {!selectedItem ? (
        <div style={styles.emptyState}>Select an element to edit</div>
      ) : (
        <div style={styles.controls}>
          {/* 1. قسم المحتوى - النص */}
          <div style={styles.group}>
            <label style={styles.label}>Content</label>
            <input
              type="text"
              value={selectedItem.text || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleTextPreview(val); // تحديث فوري للشكل
                debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { text: val }); // حفظ ذكي
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
                  value={Math.round(selectedItem.width)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleStylePreview("width", val);
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, width: val } });
                  }}
                  style={styles.smallInput}
                />
              </div>
              <div style={styles.col}>
                <span style={styles.unit}>H</span>
                <input
                  type="number"
                  value={Math.round(selectedItem.height)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleStylePreview("height", val);
                    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, height: val } });
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
                <span style={styles.subLabel}>Font Size</span>
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

              <div style={styles.field}>
                <span style={styles.subLabel}>Color</span>
                <input
                  type="color"
                  value={selectedItem.styles?.color || "#000000"}
                  onChange={(e) => handleStylePreview("color", e.target.value)}
                  // الألوان يفضل حفظها عند انتهاء الاختيار (onBlur) لكي لا يمتلئ التاريخ
                  onBlur={(e) => handleStyleCommit("color", e.target.value)}
                  style={styles.colorPicker}
                />
              </div>

              <div style={styles.field}>
                <span style={styles.subLabel}>Weight</span>
                <select 
                  value={selectedItem.styles?.fontWeight || "400"}
                  onChange={(e) => handleStyleCommit("fontWeight", e.target.value)}
                  style={styles.input}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
          )}
        </div>
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
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "10px"
  },
  subLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    width: "80px"
  },
  field: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px"
  },
  input: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
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
    gap: "10px"
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
  }
};