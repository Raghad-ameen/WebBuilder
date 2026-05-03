import React, { useMemo, useEffect } from "react";
import { debounce } from "lodash";
import { PROPERTY_CONTROLS } from "./PropertyConfigs"; 

const styles = {
  panel: { padding: "15px", backgroundColor: "#fff", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" },
  title: { fontSize: "16px", fontWeight: "bold", marginBottom: "20px", color: "#1e293b" },
  controls: { display: "flex", flexDirection: "column" },
  group: { marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" },
  label: { display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: "#475569", textTransform: "uppercase" },
  field: { marginBottom: "12px" },
  subLabel: { display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" },
  input: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" },
  fullColorPicker: { width: "100%", height: "35px", padding: "2px", borderRadius: "4px", border: "1px solid #cbd5e1", cursor: "pointer" },
  itemBadge: { background: "#4f46e5", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold", alignSelf: "flex-start", marginBottom: "15px" },
  emptyState: { color: "#94a3b8", fontSize: "14px", textAlign: "center", marginTop: "50px" }
};

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

  const debouncedUpdate = useMemo(
    () => debounce((data) => {
      updateItem(state.activePageId, selectedItem.sectionId, selectedId, data);
    }, 400),
    [state.activePageId, selectedItem?.sectionId, selectedId]
  );

 const handlePropertyChange = (config, value) => {
    if (!selectedItem) return;

    // 1. تحديد نوع الحقل: هل هو ستايل (CSS) أم بيانات نصية؟
    const isStyle = !['text', 'src', 'linkUrl'].includes(config.field);
    
    let updatePayload = {};

    if (config.field === 'linkUrl') {
      // 2. إذا كان الحقل هو رابط اللينك، نقوم بتحديثه داخل كائن action
      updatePayload = { 
        action: { 
          ...selectedItem.action, 
          url: value 
        } 
      };
    } else if (isStyle) {
      // 3. إذا كان ستايل (لون، حجم خط.. إلخ)
      const formattedValue = config.unit ? `${value}${config.unit}` : value;
      updatePayload = { 
        styles: { 
          ...selectedItem.styles, 
          [config.field]: formattedValue 
        } 
      };
    } else {
      // 4. إذا كان نصاً عادياً أو مصدر صورة
      updatePayload = { [config.field]: value };
    }

    // إرسال التحديثات للمتجر (Store)
    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, updatePayload);
    debouncedUpdate(updatePayload);
  };

const renderControl = (config) => {
    // تحديد القيمة التي ستظهر داخل الـ Input
    let rawValue;
    
    if (config.field === 'linkUrl') {
      // إذا كان الحقل للرابط، نسحب القيمة من المسار الصحيح
      rawValue = selectedItem.action?.url;
    } else {
      // للمجالات الأخرى (نصوص أو ستايلات)
      rawValue = !['text', 'src'].includes(config.field) 
        ? selectedItem.styles?.[config.field] 
        : selectedItem[config.field];
    }
    
    // معالجة القيمة لتناسب نوع الحقل (رقم أو نص)
    const value = config.type === 'number' && typeof rawValue === 'string' 
      ? parseInt(rawValue) 
      : rawValue || (config.type === 'number' ? 0 : "");

    // جزء الـ switch يبقى كما هو دون تغيير
    switch (config.type) {
      case "number":
      case "text":
        return (
          <input
            type={config.type}
            value={value}
            onChange={(e) => handlePropertyChange(config, config.type === 'number' ? Number(e.target.value) : e.target.value)}
            style={styles.input}
            placeholder={config.field === 'linkUrl' ? "https://example.com" : config.placeholder}
          />
        );
      case "color":
        return (
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => handlePropertyChange(config, e.target.value)}
            style={styles.fullColorPicker}
          />
        );
      case "select":
        return (
          <select value={value} onChange={(e) => handlePropertyChange(config, e.target.value)} style={styles.input}>
            {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case "range":
        return (
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step || 1}
            value={value}
            onChange={(e) => handlePropertyChange(config, parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        );
      default:
        return null;
    }
  };

  const groupedControls = useMemo(() => {
    if (!selectedItem) return {};
    const controls = [...(PROPERTY_CONTROLS[selectedItem.type] || []), ...PROPERTY_CONTROLS.common];
    return controls.reduce((acc, ctrl) => {
      if (!acc[ctrl.section]) acc[ctrl.section] = [];
      acc[ctrl.section].push(ctrl);
      return acc;
    }, {});
  }, [selectedItem]);

  return (
    <div className="properties-panel" style={styles.panel}>
      <h3 style={styles.title}>Visual Editor</h3>

      {selectedItem ? (
        <div style={styles.controls}>
          <div style={styles.itemBadge}>{selectedItem.type.toUpperCase()}</div>
          
          {Object.entries(groupedControls).map(([sectionName, controls]) => (
            <div key={sectionName} style={styles.group}>
              <label style={styles.label}>{sectionName}</label>
              {controls.map((ctrl) => (
                <div key={ctrl.field} style={styles.field}>
                  <span style={styles.subLabel}>{ctrl.label}</span>
                  {renderControl(ctrl)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>Select an element to edit properties</div>
      )}
    </div>
  );
}

const extendedStyles = {
  ...styles, 
  itemBadge: {
    background: "#4f46e5",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.65rem",
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: "15px"
  }
};

