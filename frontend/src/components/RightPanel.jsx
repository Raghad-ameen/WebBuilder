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
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUpDown,
  Palette,
  Layers
} from "lucide-react"; 

const FIELD_ICONS = {
  opacity: <Eye size={16} />,
  zIndex: <Layers size={16} />,
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
    { section: "Layout", label: "Z-Index (Layers)", field: "zIndex", type: "number", placeholder: "0" },
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
    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["100", "300", "400", "500", "700", "900", "normal", "bold"] },
    { section: "Typography", label: "Text Color", field: "color", type: "advanced-color" },
    { section: "Typography", label: "Align", field: "textAlign", type: "alignment-toggle" },
    { section: "Typography", label: "Letter Spacing", field: "letterSpacing", type: "number", unit: "px" },
    { section: "Typography", label: "Line Height", field: "lineHeight", type: "number", step: 0.1 },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["none", "underline", "line-through", "overline", "underline wavy", "underline dotted", "underline dashed"] },
    { section: "Typography", label: "Transform", field: "textTransform", type: "select", options: ["none", "uppercase", "lowercase", "capitalize"] },
  ],
  image: [
    { section: "Image Settings", label: "Image URL", field: "src", type: "text" },
    { section: "Image Settings", label: "Object Fit", field: "objectFit", type: "select", options: ["cover", "contain", "fill"] },
  ],
  shape: [
    { section: "Style", label: "Background Color", field: "backgroundColor", type: "advanced-color" },
  ],
  link: [
    { section: "Action", label: "Link URL", field: "linkUrl", type: "text", placeholder: "https://google.com" },
    { section: "Typography", label: "Link Text", field: "text", type: "text" },
    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },
    { section: "Typography", label: "Color", field: "color", type: "advanced-color" },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["underline", "none"] },
  ],
  section: [
    { field: 'backgroundColor', label: 'Background Color', type: 'advanced-color', section: 'Appearance' },
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

// مكون منتقي الألوان المتطور (يدعم التدرجات والـ Advanced Solid)
const AdvancedColorPicker = ({ value, config, onPropertyChange }) => {
  const [colorType, setColorType] = useState(String(value).includes("gradient") ? "gradient" : "solid");
  const [solidColor, setSolidColor] = useState(colorType === "solid" ? value || "#000000" : "#4f46e5");
  const [gradColor1, setGradColor1] = useState("#4f46e5");
  const [gradColor2, setGradColor2] = useState("#06b6d4");
  const [gradAngle, setGradAngle] = useState("135");

  useEffect(() => {
    if (String(value).includes("gradient")) {
      setColorType("gradient");
      const matches = String(value).match(/#[a-fA-F0-9]{6}/g);
      if (matches && matches.length >= 2) {
        setGradColor1(matches[0]);
        setGradColor2(matches[1]);
      }
      const angleMatch = String(value).match(/\d+deg/);
      if (angleMatch) setGradAngle(angleMatch[0].replace("deg", ""));
    } else {
      setColorType("solid");
      if (value) setSolidColor(value);
    }
  }, [value]);

  const updateSolid = (color) => {
    setSolidColor(color);
    onPropertyChange(config, color);
  };

  const updateGradient = (c1, c2, angle) => {
    const gradStr = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    onPropertyChange(config, gradStr);
  };

  return (
    <div style={styles.advColorContainer}>
      <div style={styles.tabHeader}>
        <button 
          style={{ ...styles.tabBtn, backgroundColor: colorType === 'solid' ? '#f1f5f9' : 'transparent', fontWeight: colorType === 'solid' ? '700' : '400' }}
          onClick={() => { setColorType('solid'); onPropertyChange(config, solidColor); }}
        >
          Solid
        </button>
        <button 
          style={{ ...styles.tabBtn, backgroundColor: colorType === 'gradient' ? '#f1f5f9' : 'transparent', fontWeight: colorType === 'gradient' ? '700' : '400' }}
          onClick={() => { setColorType('gradient'); updateGradient(gradColor1, gradColor2, gradAngle); }}
        >
          Gradient
        </button>
      </div>

      {colorType === "solid" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="color" value={solidColor} onChange={(e) => updateSolid(e.target.value)} style={styles.colorPicker} />
          <input type="text" value={solidColor} onChange={(e) => updateSolid(e.target.value)} style={{ ...styles.input, width: "80px" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="color" value={gradColor1} onChange={(e) => { setGradColor1(e.target.value); updateGradient(e.target.value, gradColor2, gradAngle); }} style={styles.colorPicker} />
            <input type="color" value={gradColor2} onChange={(e) => { setGradColor2(e.target.value); updateGradient(gradColor1, e.target.value, gradAngle); }} style={styles.colorPicker} />
            <select value={gradAngle} onChange={(e) => { setGradAngle(e.target.value); updateGradient(gradColor1, gradColor2, e.target.value); }} style={{ ...styles.input, padding: "2px", width: "70px" }}>
              <option value="0">0°</option>
              <option value="45">45°</option>
              <option value="90">90°</option>
              <option value="135">135°</option>
              <option value="180">180°</option>
            </select>
          </div>
          {/* تدرجات جاهزة سريعة للاختيار المباشر الاحترافي */}
          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            {/* بنفسجي سحري */}
            <div onClick={() => { setGradColor1("#4f46e5"); setGradColor2("#06b6d4"); updateGradient("#4f46e5", "#06b6d4", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }} />
            {/* غروب الشمس */}
            <div onClick={() => { setGradColor1("#f59e0b"); setGradColor2("#ef4444"); updateGradient("#f59e0b", "#ef4444", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #f59e0b, #ef4444)" }} />
            {/* غابة ليلية */}
            <div onClick={() => { setGradColor1("#10b981"); setGradColor2("#059669"); updateGradient("#10b981", "#059669", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #10b981, #059669)" }} />
          </div>
        </div>
      )}
    </div>
  );
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
    if (!selectedId || !selectedItem || allControls.length === 0) return;

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
    return () => debouncedUpdate.cancel();
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

    // 1. تحديث القيم المحلية فوراً في الـ Input
    setLocalValues(prev => ({ ...prev, [config.field]: incomingValue }));
    
    const isStyle = !['text', 'src', 'linkUrl'].includes(config.field);
    let updatePayload = {};

    if (config.field === 'linkUrl') {
      updatePayload = { action: { ...selectedItem.action, url: incomingValue } };
    } else if (isStyle) {
      // نأخذ نسخة من الستايلات الحالية للعنصر
      const currentStyles = { ...selectedItem.styles };

      // إرسال القيمة الأصلية النيئة لتظل محفوظة في حقل الإدخال بالبانل
      currentStyles[config.field] = incomingValue;

      // [تطوير] معالجة التدرجات والخلفيات المتقدمة
      if (config.field === 'backgroundColor') {
        if (String(incomingValue).includes('gradient')) {
          currentStyles['background'] = incomingValue;
          currentStyles['backgroundColor'] = 'transparent'; // تصفير الخلفية العادية ليظهر التدرج
        } else {
          currentStyles['backgroundColor'] = incomingValue;
          currentStyles['background'] = 'none';
        }
      }

      // [تطوير] معالجة الـ Z-Index ليفهمها المتصفح كـ Number
      if (config.field === 'zIndex') {
        currentStyles['zIndex'] = parseInt(incomingValue) || 0;
      }

      // [تطوير] معالجة المحاذاة للتأكد من حقنها بالاسم الصحيح للـ CSS
      if (config.field === 'textAlign') {
        currentStyles['textAlign'] = incomingValue;
      }

      // [تطوير] بناء وتجميع فلاتر الـ CSS بشكل مدمج ليقرأها المتصفح دفعة واحدة
      const blurVal = config.field === 'filterBlur' ? incomingValue : (parseFloat(currentStyles['filterBlur']) || 0);
      const brightVal = config.field === 'filterBrightness' ? incomingValue : (parseFloat(currentStyles['filterBrightness']) !== undefined ? parseFloat(currentStyles['filterBrightness']) : 100);
      const contrastVal = config.field === 'filterContrast' ? incomingValue : (parseFloat(currentStyles['filterContrast']) !== undefined ? parseFloat(currentStyles['filterContrast']) : 100);
      const grayVal = config.field === 'filterGrayscale' ? incomingValue : (parseFloat(currentStyles['filterGrayscale']) || 0);

      // حقن الفلتر المدمج القياسي للـ CSS
      currentStyles['filter'] = `blur(${blurVal}px) brightness(${brightVal}%) contrast(${contrastVal}%) grayscale(${grayVal}%)`;

      // [تطوير] بناء خاصية الـ Shadow بالكامل عند تغيير اللون
      const shadowColor = config.field === 'shadowColor' ? incomingValue : (currentStyles['shadowColor'] || 'transparent');
      if (shadowColor && shadowColor !== 'transparent') {
        currentStyles['boxShadow'] = `0px 4px 12px ${shadowColor}`;
      } else {
        currentStyles['boxShadow'] = 'none';
      }

      // إضافة الـ Units القياسية لباقي الخصائص العادية (مثل fontSize: "16px")
      if (config.unit && !['filterBlur', 'filterBrightness', 'filterContrast', 'filterGrayscale'].includes(config.field)) {
        currentStyles[config.field] = `${incomingValue}${config.unit}`;
      }

      updatePayload = { styles: currentStyles };
    } else {
      updatePayload = { [config.field]: incomingValue };
    }

    // 2. ترحيل التحديثات للـ Canvas والـ Store
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
      case "advanced-color":
        return (
          <AdvancedColorPicker 
            value={value} 
            config={config} 
            onPropertyChange={handlePropertyChange} 
          />
        );
      case "alignment-toggle":
        return (
          <div style={styles.alignToggleGroup}>
            {/* زر محاذاة لليسار */}
            <button style={{ ...styles.alignBtn, backgroundColor: value === 'left' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'left')}><AlignLeft size={14} /></button>
            {/* زر محاذاة للوسط */}
            <button style={{ ...styles.alignBtn, backgroundColor: value === 'center' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'center')}><AlignCenter size={14} /></button>
            {/* زر محاذاة لليمين */}
            <button style={{ ...styles.alignBtn, backgroundColor: value === 'right' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'right')}><AlignRight size={14} /></button>
            {/* زر توزيع النص عادل */}
            <button style={{ ...styles.alignBtn, backgroundColor: value === 'justify' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'justify')}><AlignJustify size={14} /></button>
          </div>
        );
      case "select":
        return (
          <select value={value} onChange={(e) => handlePropertyChange(config, e.target.value)} style={{ ...styles.input, padding: "2px 6px", height: "32px", minWidth: "110px" }}>
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
      {/* حقن عائلة الخطوط الأساسية المتكاملة لضمان عمل أوزان النصوص 100, 200 بشكل فوري على الشاشة */}
      <style>{`
        body, input, select { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important; }
      `}</style>

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
            // تم إضافة حل السكرول (maxHeight مع overflowY) لحل مشكلة اختفاء القائمة الطويلة
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
              <option value="submit_form">Submit Form</option>
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

const styles = {
  // الستايلات السابقة مع التحسينات المضافة لحلول المشاكل
  floatingToolbar: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.04)", border: "1px solid #cbd5e1", width: "fit-content", maxWidth: "95vw", overflow: "visible", pointerEvents: "auto", zIndex: 999, position: "relative", height: "46px" },
  itemBadge: { background: "#e2e8f0", color: "#334155", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", whiteSpace: "nowrap" },
  controlButtonTrigger: { display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", background: "transparent", border: "none", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", color: "#475569", position: "relative", transition: "all 0.15s ease" },
  inlinePopover: { position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 1002, whiteSpace: "nowrap" },
  popoverHeader: { fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "2px", textAlign: "center" },
  input: { padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", height: "32px", background: "#ffffff" },
  colorPicker: { width: "36px", height: "32px", padding: "2px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer", background: "transparent" },
  divider: { width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" },
  closeBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", borderRadius: "50%" },
  moreBtn: { background: "transparent", border: "1px solid #cbd5e1", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", height: "32px", width: "32px", borderRadius: "6px" },
  
  // حل مشكلة السكرول للقائمة الطويلة واختفائها أسفل الشاشة
  dropdownMenu: { position: "absolute", top: "calc(100% + 10px)", right: "0px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)", padding: "14px", display: "flex", flexDirection: "column", gap: "12px", minWidth: "310px", maxHeight: "320px", overflowY: "auto", zIndex: 1000 },
  dropdownItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" },
  subLabel: { fontSize: "12px", color: "#334155", fontWeight: "500", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px" },
  controlWrapper: { display: "flex", alignItems: "center", gap: "6px" },
  
  // أنماط مجموعة أزرار المحاذاة الجديدة والمطورة
  alignToggleGroup: { display: "flex", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden", height: "32px" },
  alignBtn: { border: "none", background: "transparent", width: "30px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all 0.1s" },
  
  // أنماط منتقي الألوان المتطور والتدرجات الجاهزة
  advColorContainer: { display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" },
  tabHeader: { display: "flex", gap: "2px", background: "#f8fafc", padding: "2px", borderRadius: "6px", border: "1px solid #e2e8f0" },
  tabBtn: { flex: 1, border: "none", fontSize: "11px", padding: "4px 0", cursor: "pointer", borderRadius: "4px", color: "#334155", transition: "all 0.1s" },
  gradPreset: { width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", border: "1px solid #cbd5e1", transition: "transform 0.1s" }
};