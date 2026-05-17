import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { debounce } from "lodash";
import { 
  X, 
  MoreHorizontal, 
  Type, 
  Paintbrush, 
  Eye, 
  Link, 
  Maximize2,
  Sliders,
  ChevronDown,
  CornerUpLeft, 
  Sparkles,
  Sun,
  Focus,
  Bold,
  AlignLeft,
  ArrowUpDown,
  Palette
} from "lucide-react"; 

const FIELD_ICONS = {
  opacity: <Eye size={16} />,
  zIndex: <span style={{ fontWeight: 'bold', fontSize: '11px', border: '1px solid #64748b', padding: '1px 3px', borderRadius: '4px' }}>Z</span>,
  borderWidth: <span style={{ fontWeight: 'bold', fontSize: '11px' }}>B⇆</span>,
  borderRadius: <CornerUpLeft size={16} style={{ transform: 'rotate(-90deg)' }} />,
  borderColor: <Palette size={15} style={{ opacity: 0.8 }} />,
  borderStyle: <span style={{ letterSpacing: '1px', fontWeight: 'bold' }}></span>,
  shadowColor: <span style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))', display: 'inline-block' }}><Paintbrush size={14} /></span>,
  filterBlur: <Focus size={16} />,
  filterBrightness: <Sun size={16} />,
  filterContrast: <Sparkles size={16} />,
  filterGrayscale: <span style={{ filter: 'grayscale(100%)', display: 'inline-block' }}><Paintbrush size={14} /></span>,
  text: <Type size={16} />,
  fontSize: <span style={{ fontWeight: 'bold', fontSize: '13px' }}>A+</span>,
  fontWeight: <Bold size={15} />,
  color: <span style={{ borderBottom: '3px solid #2563eb', fontWeight: 'bold', fontSize: '13px', paddingBottom: '1px' }}>A</span>,
  textAlign: <AlignLeft size={16} />,
  letterSpacing: <span style={{ letterSpacing: '2px', fontWeight: 'bold', fontSize: '11px' }}>A B</span>,
  lineHeight: <ArrowUpDown size={15} />,
  textDecoration: <span style={{ textDecoration: 'underline', fontSize: '12px', fontWeight: 'bold' }}>U</span>,
  textTransform: <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>Aa</span>,
  src: <Link size={16} />,
  objectFit: <Maximize2 size={15} />,
  backgroundColor: <Paintbrush size={16} />,
  minHeight: <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}><Maximize2 size={16} /></span>,
  linkUrl: <Link size={16} style={{ color: '#2563eb' }} />
};

const getFallbackIcon = (fieldName) => {
  const cleanName = fieldName.replace(/[^a-zA-Z]/g, '');
  if (cleanName.length >= 2) {
    return <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#475569' }}>{cleanName.substring(0, 2)}</span>;
  }
  return <Sliders size={15} />;
};

export const PROPERTY_CONTROLS = {
  common: [
    { section: "Layout", label: "Opacity", field: "opacity", type: "range", min: 0, max: 1, step: 0.1 },
    { section: "Layout", label: "Z-Index", field: "zIndex", type: "number" },
    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },
    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },
    { section: "Border", label: "Border Color", field: "borderColor", type: "color" },
    { section: "Border", label: "Style", field: "borderStyle", type: "select", options: ["none", "solid", "dashed", "dotted", "double"] },
    { section: "Shadow", label: "Shadow Color", field: "shadowColor", type: "color" },
    { section: "Filters", label: "Blur", field: "filterBlur", type: "range", min: 0, max: 20 },
    { section: "Filters", label: "Brightness", field: "filterBrightness", type: "range", min: 0, max: 200 },
    { section: "Filters", label: "Contrast", field: "filterContrast", type: "range", min: 0, max: 200 },
    { section: "Filters", label: "Grayscale", field: "filterGrayscale", type: "range", min: 0, max: 100 },
  ],
  text: [
    { section: "Typography", label: "Text Content", field: "text", type: "text" },
    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },
    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["normal", "bold", "100", "200", "300", "500", "800"] },
    { section: "Typography", label: "Color", field: "color", type: "color" },
    { section: "Typography", label: "Align", field: "textAlign", type: "select", options: ["left", "center", "right", "justify"] },
    { section: "Typography", label: "Letter Spacing", field: "letterSpacing", type: "number", unit: "px" },
    { section: "Typography", label: "Line Height", field: "lineHeight", type: "number" },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["none", "underline", "line-through"] },
    { section: "Typography", label: "Transform", field: "textTransform", type: "select", options: ["none", "uppercase", "lowercase", "capitalize"] },
  ],
  image: [
    { section: "Image Settings", label: "Image URL", field: "src", type: "text" },
    { section: "Image Settings", label: "Object Fit", field: "objectFit", type: "select", options: ["cover", "contain", "fill"] },
  ],
  shape: [
    { section: "Style", label: "Background Color", field: "backgroundColor", type: "color" },
  ],
  link: [
    { section: "Action", label: "Link URL", field: "linkUrl", type: "text", placeholder: "https://google.com" },
    { section: "Typography", label: "Link Text", field: "text", type: "text" },
    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },
    { section: "Typography", label: "Color", field: "color", type: "color" },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["underline", "none"] },
  ],
  section: [
    { field: 'backgroundColor', label: 'Background Color', type: 'color', section: 'Appearance' },
    { field: 'minHeight', label: 'Min Height', type: 'number', unit: 'px', section: 'Layout' },
  ],
};

const ControlledNumberInput = ({ initialValue, config, onPropertyChange }) => {
  const [localVal, setLocalVal] = useState(initialValue);

  useEffect(() => {
    setLocalVal(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    const valStr = e.target.value;
    setLocalVal(valStr);
    if (valStr !== "") {
      onPropertyChange(config, Number(valStr));
    }
  };

  return (
    <input
      type="number"
      value={localVal}
      onChange={handleChange}
      style={{ ...styles.input, width: "75px" }}
      onFocus={(e) => e.target.select()}
    />
  );
};

const ControlledRangeInput = ({ initialValue, config, onPropertyChange, isDense }) => {
  const [localVal, setLocalVal] = useState(initialValue);

  useEffect(() => {
    setLocalVal(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalVal(val);
    onPropertyChange(config, val);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step || 1}
        value={localVal}
        onChange={handleChange}
        style={{ width: isDense ? "95px" : "125px", cursor: "pointer", accentColor: "#2563eb" }}
      />
      <span style={{ fontSize: "11px", color: "#0f172a", fontWeight: "700", minWidth: "26px", textAlign: "center" }}>
        {localVal}
      </span>
    </div>
  );
};

const styles = {
  floatingToolbar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    padding: "6px 12px",
    borderRadius: "30px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.04)",
    border: "1px solid #cbd5e1",
    width: "fit-content",
    maxWidth: "95vw",
    overflow: "visible",
    pointerEvents: "auto",
    zIndex: 999,
    position: "relative",
    height: "46px"
  },
  itemBadge: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    whiteSpace: "nowrap"
  },
  controlButtonTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    background: "transparent",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#475569",
    position: "relative",
    transition: "all 0.15s ease"
  },
  inlinePopover: {
    position: "absolute",
    top: "calc(100% + 8px)", 
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    zIndex: 1002,
    whiteSpace: "nowrap"
  },
  popoverHeader: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "2px",
    textAlign: "center"
  },
  input: {
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    outline: "none",
    height: "32px",
    background: "#ffffff"
  },
  colorPicker: {
    width: "36px",
    height: "32px",
    padding: "2px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
    background: "transparent"
  },
  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#cbd5e1",
    margin: "0 4px"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "50%"
  },
  moreBtn: {
    background: "transparent",
    border: "1px solid #cbd5e1",
    color: "#475569",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "32px",
    width: "32px",
    borderRadius: "6px"
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 10px)", 
    right: "0px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: "290px",
    zIndex: 1000
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px"
  },
  subLabel: {
    fontSize: "12px",
    color: "#334155",
    fontWeight: "500",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  controlWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  }
};

export default function RightPanel({ store }) {
  const { state, updateItem, previewUpdateItem, updateSection, injectFormTemplate, setState } = store;

  const toolbarRef = useRef(null); 
  const dropdownRef = useRef(null);
  const [showMore, setShowMore] = useState(false);
  const [openPropertyField, setOpenPropertyField] = useState(null); 
  const [localValues, setLocalValues] = useState({});

  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const currentSections = activePage?.sections || [];
  const selectedId = state.selectedElementIds?.[0] || state.activeElementId;

  let selectedItem = null;
  let isSectionSelection = false;

  if (selectedId && activePage) {
    const sectionAsItem = activePage.sections.find((s) => s.id === selectedId);
    if (sectionAsItem) {
      selectedItem = { ...sectionAsItem, type: 'section', sectionId: sectionAsItem.id };
      isSectionSelection = true;
    } else {
      activePage.sections.forEach((section) => {
        const item = section.data.items?.find((it) => it.id === selectedId);
        if (item) {
          selectedItem = { ...item, sectionId: section.id };
        }
      });
    }
  }

  const itemType = selectedItem?.type;
  const allControls = useMemo(() => {
    if (!itemType) return [];
    return [...(PROPERTY_CONTROLS[itemType] || []), ...PROPERTY_CONTROLS.common];
  }, [itemType]);

  useEffect(() => {
    if (!selectedId || !selectedItem || allControls.length === 0) {
      return;
    }

    const initialLocals = {};
    allControls.forEach(ctrl => {
      let rawValue = ctrl.field === 'linkUrl' ? selectedItem.action?.url : selectedItem.styles?.[ctrl.field];
      if (rawValue === undefined) rawValue = selectedItem[ctrl.field];
      initialLocals[ctrl.field] = rawValue;
    });

    setLocalValues(initialLocals);
    setShowMore(false);
    setOpenPropertyField(null);

  }, [selectedId]); 

  const handleCloseToolbar = useCallback(() => {
    setState((prev) => ({ ...prev, selectedElementIds: [], activeElementId: null }));
    setShowMore(false);
    setOpenPropertyField(null);
  }, [setState]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!selectedId) return;

      if (toolbarRef.current && toolbarRef.current.contains(event.target)) return;
      if (event.target.closest('.property-popover-container') || event.target.closest('[class*="popover"]')) return;
      if (event.target.closest('select') || event.target.closest('input[type="color"]')) return;

      if (
        event.target.classList.contains('canvas-container') || 
        event.target.classList.contains('designer-bg') || 
        event.target.id === 'canvas-wrapper'
      ) {
        handleCloseToolbar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedId, handleCloseToolbar]);

  const debouncedUpdate = useCallback(
    debounce((pageId, sectionId, itemId, payload) => {
      updateItem(pageId, sectionId, itemId, payload);
    }, 250),
    [updateItem]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleActionChange = (type, payload) => {
    if (!selectedItem) return;
    if (type === 'submit_form' && !selectedItem.action?.payload && !payload) {
      injectFormTemplate(selectedItem.sectionId);
    }
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, { action: { type, payload } });
  };

  const handlePropertyChange = (config, incomingValue) => {
    if (!selectedItem) return;

    setLocalValues(prev => ({ ...prev, [config.field]: incomingValue }));
    const isStyle = !['text', 'src', 'linkUrl'].includes(config.field);
    let updatePayload = {};

    if (config.field === 'linkUrl') {
      updatePayload = { action: { ...selectedItem.action, url: incomingValue } };
    } else if (isStyle) {
      const currentStyles = { ...selectedItem.styles };
      currentStyles[config.field] = config.unit ? `${incomingValue}${config.unit}` : incomingValue;
      updatePayload = { styles: currentStyles };
    } else {
      updatePayload = { [config.field]: incomingValue };
    }

    if (isSectionSelection) {
      updateSection(state.activePageId, selectedId, updatePayload);
    } else {
      previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, updatePayload);
      debouncedUpdate(state.activePageId, selectedItem.sectionId, selectedId, updatePayload);
    }
  };

  const renderControl = (config, isDense = false) => {
    const rawValue = localValues[config.field];
    let value;

    if (config.type === 'number' || config.type === 'range') {
      if (rawValue === undefined || rawValue === null) {
        if (config.field === 'filterBrightness' || config.field === 'filterContrast') value = 100;
        else if (config.field === 'opacity') value = 1;
        else value = 0;
      } else {
        value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(/px|%|rgba/g, ''));
        if (isNaN(value)) value = 0;
      }
    } else {
      value = rawValue || "";
    }

    switch (config.type) {
      case "number":
        return (
          <ControlledNumberInput 
            key={`${selectedId}-${config.field}`}
            initialValue={value} 
            config={config} 
            onPropertyChange={handlePropertyChange} 
          />
        );
      case "range":
        return (
          <ControlledRangeInput 
            key={`${selectedId}-${config.field}`}
            initialValue={value} 
            config={config} 
            isDense={isDense}
            onPropertyChange={handlePropertyChange} 
          />
        );
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(config, e.target.value)}
            style={{ ...styles.input, width: isDense ? "120px" : "145px" }}
            placeholder={config.placeholder || config.label}
          />
        );
      case "color":
        return (
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => handlePropertyChange(config, e.target.value)}
            style={styles.colorPicker}
          />
        );
      case "select":
        return (
          <select value={value} onChange={(e) => handlePropertyChange(config, e.target.value)} style={{ ...styles.input, padding: "2px 6px", height: "32px", minWidth: "90px" }}>
            {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return null;
    }
  };

  const visibleControls = useMemo(() => allControls.slice(0, 4), [allControls]);
  const hiddenControls = useMemo(() => allControls.slice(4), [allControls]);

  if (!selectedItem) return null;

  return (
    <div ref={toolbarRef} style={styles.floatingToolbar} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div style={styles.itemBadge}>{selectedItem.type}</div>
      
      <button onClick={(e) => { e.stopPropagation(); handleCloseToolbar(); }} style={styles.closeBtn} title="Close Panel">
        <X size={15} />
      </button>

      <div style={styles.divider} />

      {visibleControls.map((ctrl) => {
        const isPopoverOpen = openPropertyField === ctrl.field;
        return (
          <div key={ctrl.field} style={{ position: "relative" }} className="property-popover-container">
            <button
              style={{
                ...styles.controlButtonTrigger,
                backgroundColor: isPopoverOpen ? "#f1f5f9" : "transparent",
                color: isPopoverOpen ? "#2563eb" : "#475569"
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowMore(false);
                setOpenPropertyField(isPopoverOpen ? null : ctrl.field);
              }}
              title={ctrl.label} 
            >
              {FIELD_ICONS[ctrl.field] || getFallbackIcon(ctrl.field)}
              <ChevronDown size={8} style={{ opacity: 0.6, marginTop: "1px" }} />
            </button>

            {isPopoverOpen && (
              <div style={styles.inlinePopover} onClick={(e) => e.stopPropagation()}>
                <div style={styles.popoverHeader}>{ctrl.label}</div>
                {renderControl(ctrl, false)}
              </div>
            )}
          </div>
        );
      })}

      {hiddenControls.length > 0 && (
        <>
          <button 
            className="more-btn-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setOpenPropertyField(null);
              setShowMore(!showMore);
            }} 
            style={{ 
              ...styles.moreBtn, 
              backgroundColor: showMore ? "#f1f5f9" : "transparent",
              borderColor: showMore ? "#2563eb" : "#cbd5e1"
            }}
            title="More Properties"
          >
            <MoreHorizontal size={15} />
          </button>

          {showMore && (
            <div ref={dropdownRef} style={styles.dropdownMenu} className="property-popover-container">
              {hiddenControls.map((ctrl) => (
                <div key={ctrl.field} style={styles.dropdownItem}>
                  <span style={styles.subLabel}>
                    {FIELD_ICONS[ctrl.field] || getFallbackIcon(ctrl.field)}
                    {ctrl.label}
                  </span>
                  {renderControl(ctrl, true)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {['button', 'link', 'image', 'shape'].includes(selectedItem.type) && (
        <>
          <div style={styles.divider} />
          <div style={styles.controlWrapper}>
            <select 
              style={{ ...styles.input, width: "95px", padding: "2px 4px", fontWeight: "500" }}
              value={selectedItem.action?.type || "none"}
              onChange={(e) => handleActionChange(e.target.value, "")}
            >
              <option value="none">None</option>
              <option value="page">Navigate to page</option>
              <option value="url">URL</option>
              <option value="scroll">Move to section</option>
              <option value="email">Email</option>
              <option value="submit_form">Sumbit Form</option>
            </select>

            {selectedItem.action?.type === 'page' && (
              <select style={{ ...styles.input, width: "85px" }} value={selectedItem.action?.payload || ""} onChange={(e) => handleActionChange('page', e.target.value)}>
                <option value="">choose..</option>
                {state.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}

            {selectedItem.action?.type === 'url' && (
              <input type="text" style={{ ...styles.input, width: "100px" }} placeholder="https://..." value={selectedItem.action?.payload || ""} onChange={(e) => handleActionChange('url', e.target.value)} />
            )}

            {selectedItem.action?.type === 'scroll' && (
              <select style={{ ...styles.input, width: "85px" }} value={selectedItem.action?.payload || ""} onChange={(e) => handleActionChange('scroll', e.target.value)}>
                <option value="">Section..</option>
                {currentSections.map((sec, idx) => (
                  <option key={sec.id} value={sec.id}>{idx + 1}. {sec.type}</option>
                ))}
              </select>
            )}
          </div>
        </>
      )}
    </div>
  );
}