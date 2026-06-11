import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

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

  Layers,

  FrameIcon,

  RotateCcw

} from "lucide-react";


import { normalizeStyleValue } from "../utils/styleNormalizer";



const buildFilter = (styles) => {

  const b = parseFloat(styles?.filterBlur) || 0;

  const br = parseFloat(styles?.filterBrightness) || 100;

  const c = parseFloat(styles?.filterContrast) || 100;

  const g = parseFloat(styles?.filterGrayscale) || 0;

  return `blur(${b}px) brightness(${br}%) contrast(${c}%) grayscale(${g}%)`;

};


const buildBoxShadow = (shadowColor) => {

  if (!shadowColor || shadowColor === 'transparent' || shadowColor === 'none') return 'none';

  return `0px 4px 12px ${shadowColor}`;

};



const DEFAULT_VALUES = {

  opacity: 1,

  zIndex: 0,

  backgroundColor: "#ffffff",

  minHeight: 100,

  borderWidth: 0,

  borderRadius: 0,

  borderColor: "#cbd5e1",

  borderStyle: "solid",

  shadowColor: "#000000",

  shadowMode: "none",

  shadowBlur: 0,

  glitchStyle: "none",

  filterBlur: 0,

  filterBrightness: 100,

  filterContrast: 100,

  filterGrayscale: 0,

  text: "Type something...",

  fontSize: 16,

  fontWeight: "normal",

  color: "#000000",

  textAlign: "left",

  letterSpacing: 0,

  lineHeight: 1.2,

  textDecoration: "none",

  textTransform: "none",

  linkUrl: "",

  src: "",

  objectFit: "cover",

  inputType: "text",

  name: "",

  placeholder: "Enter your text...",

  labelFontSize: 12,

  labelColor: "#4f46e5",

  hoverBg: "transparent",

  hoverColor: "#ffffff",

  hoverScale: "none",

  transitionSpeed: 0.2,

  entryAnimation: "none",

  panDirection: "up",

  animationDuration: 0.5,

  animationDelay: 0,

  canvasAlignment: "left",
  dataType: "Any",

};


const FIELD_ICONS = {

  opacity: <Eye size={16} />,

  zIndex: <Layers size={16} />,

  borderWidth: <span style={{ fontWeight: 'bold', fontSize: '11px' }}>B⇆</span>,

  borderRadius: <CornerUpLeft size={16} style={{ transform: 'rotate(-90deg)' }} />,

  borderColor: <Palette size={15} style={{ opacity: 0.8 }} />,

  borderStyle: <span style={{ letterSpacing: '1px', fontWeight: 'bold' }}><FrameIcon size={14}/></span>,

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

  linkUrl: <Link size={16} style={{ color: '#2563eb' }} />,

  name: <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#16a34a' }}>[ID]</span>,

  inputType: <Type size={15} style={{ color: '#2563eb' }} />,

  placeholder: <span style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b' }}>"Abc"</span>,

  constraints: <Sliders size={15} style={{ color: '#ea580c' }} />,

  labelFontSize: <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#4f46e5' }}>L-Aa</span>,

  labelColor: <Palette size={15} style={{ color: '#4f46e5' }} />,
  dataType: <Sliders size={15} style={{ color: '#ea580c' }} />,

};


const getFallbackIcon = (fieldName) => {

  const cleanName = fieldName.replace(/[^a-zA-Z]/g, '');

  if (cleanName.length >= 2) {

    return <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#475569' }}>{cleanName.substring(0, 2)}</span>;

  }

  return <Sliders size={15} />;

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



const AdvancedColorPicker = ({ value, config, onPropertyChange }) => {

  const [colorType, setColorType] = useState(String(value || "").includes("gradient") ? "gradient" : "solid");

  const [solidColor, setSolidColor] = useState(colorType === "solid" ? (value || "#000000") : "#4f46e5");

  const [gradColor1, setGradColor1] = useState("#4f46e5");

  const [gradColor2, setGradColor2] = useState("#06b6d4");

  const [gradAngle, setGradAngle] = useState("135");


  useEffect(() => {

    if (String(value || "").includes("gradient")) {

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

          <button

            onClick={() => { setSolidColor("transparent"); onPropertyChange(config, "transparent"); }}

            style={{ padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", background: "#fff", fontSize: "12px" }}

          >

            Transparent

          </button>

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

          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>

            <div onClick={() => { setGradColor1("#4f46e5"); setGradColor2("#06b6d4"); updateGradient("#4f46e5", "#06b6d4", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }} />

            <div onClick={() => { setGradColor1("#f59e0b"); setGradColor2("#ef4444"); updateGradient("#f59e0b", "#ef4444", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #f59e0b, #ef4444)" }} />

            <div onClick={() => { setGradColor1("#10b981"); setGradColor2("#059669"); updateGradient("#10b981", "#059669", gradAngle); }} style={{ ...styles.gradPreset, background: "linear-gradient(135deg, #10b981, #059669)" }} />

          </div>

        </div>

      )}

    </div>

  );

};



export default function RightPanel({ store }) {

  const { state, updateItem, previewUpdateItem, updateSection, injectFormTemplate, setState } = store;

const [activeSection, setActiveSection] = useState("normal");
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


  const rawType = selectedItem?.type?.toLowerCase() || "";

  const itemType = rawType.includes("input") ? "input" : rawType;


  const allControls = useMemo(() => {

    if (!itemType) return [];

    return [...(PROPERTY_CONTROLS[itemType] || []), ...PROPERTY_CONTROLS.common];

  }, [itemType]);


useEffect(() => {
    if (!selectedId || !selectedItem || allControls.length === 0) return;

    const initialLocals = {};
    allControls.forEach(ctrl => {
      let rawValue;
      if (ctrl.field === 'linkUrl') {
        rawValue = selectedItem.action?.url;
      } else if (ctrl.isTextStyle) {
        rawValue = selectedItem.textStyles?.[ctrl.field];
      } else {
        rawValue = selectedItem.styles?.[ctrl.field];
      }

      if (rawValue === undefined) {
        rawValue = selectedItem[ctrl.field] !== undefined ? selectedItem[ctrl.field] : DEFAULT_VALUES[ctrl.field];
      }

      if (ctrl.field === 'labelFontSize' && typeof rawValue === 'string') {
        rawValue = parseFloat(rawValue.replace('px', '')) || DEFAULT_VALUES.labelFontSize;
      }

      initialLocals[ctrl.field] = rawValue;
    });

    setLocalValues(initialLocals);
    setShowMore(false);
    setOpenPropertyField(null);

    setActiveSection("normal");

  }, [selectedItem?.id]);

  

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

    const activePageId = state.activePageId || "";

if (type === 'submit_form') {
      const activePageId = state.activePageId || "";
      const currentSectionId = selectedItem.sectionId;

      updateItem(activePageId, currentSectionId, selectedId, { 
        action: { 
          type: 'submit_form', 
          payload: payload || "", 
          isPopupForm: true
        } 
      });

      store.setState(prev => ({
        ...prev,
        isFormOpen: true,
        activeFormSectionId: currentSectionId
      }));

      const currentSection = state.pages
        .find(p => p.id === activePageId)?.sections
        .find(s => s.id === currentSectionId);
        
      const hasPopupItems = currentSection?.data?.items?.some(item => item.belongsToPopup);

      if (!hasPopupItems && typeof store.injectFormTemplate === "function") {
        store.injectFormTemplate(currentSectionId);
      }
      return;
    }   
    updateItem(activePageId, selectedItem.sectionId, selectedId, { 
      action: { type, payload } 
    });
  };


  const handlePropertyChange = useCallback((config, incomingValue) => {


    if (config.field === 'zIndex' && typeof incomingValue === 'string') {

      const selectedId = state.selectedElementIds?.[0];

      if (!selectedId) return;

      const sectionId = (selectedItem || {}).sectionId;

      switch (incomingValue) {

        case 'To Front':

          store.moveItemToFront(selectedId);

          return;

        case 'Bring Forward':

          store.moveItemUp(selectedId);

          return;

        case 'Send Backward':

          store.moveItemDown(selectedId);

          return;

        case 'To Back':

          store.moveItemToBack(selectedId);

          return;

        default: {


          const num = parseInt(incomingValue);

          if (!isNaN(num)) incomingValue = num;

        }

      }

    }


    const normalized = normalizeStyleValue(config.field, incomingValue);

    const value = config.field === 'transitionSpeed'

      ? (parseFloat(normalized) || 0.2)

      : normalized;


    if (!selectedItem) return;


    setLocalValues(prev => ({ ...prev, [config.field]: value }));


    let updatePayload = {};


    if (config.field === 'linkUrl') {

      updatePayload = { action: { ...selectedItem.action, url: value } };


    } else if (config.field === 'labelFontSize') {

      const currentStyles = { ...selectedItem.styles };

      currentStyles['labelFontSize'] = config.unit ? `${value}${config.unit}` : `${value}px`;

      updatePayload = { styles: currentStyles };


    } else if (config.field === 'labelColor') {

      const currentStyles = { ...selectedItem.styles };

      currentStyles['labelColor'] = value;

      updatePayload = { styles: currentStyles };


    } else if (config.isTextStyle) {

      const currentTextStyles = { ...selectedItem.textStyles };

      currentTextStyles[config.field] = config.unit ? `${value}${config.unit}` : value;

      updatePayload = { textStyles: currentTextStyles };


    } 
    else if (!['text', 'src', 'name', 'placeholder', 'inputType', 'dataType', 'labelFontSize', 'labelColor'].includes(config.field)) {
      const currentStyles = { ...selectedItem.styles };

      currentStyles[config.field] = value;



      if (config.field === 'backgroundColor') {

        if (String(value).includes('gradient')) {

          currentStyles['backgroundImage'] = value;

          currentStyles['backgroundColor'] = '#ffffff';

        } else {

          currentStyles['backgroundColor'] = value;

          currentStyles['backgroundImage'] = undefined;

        }

      }


      if (config.field === 'zIndex') {

        currentStyles['zIndex'] = parseInt(value) || 0;

      }



      if (

        config.unit &&

        typeof value === "number" &&

        !['filterBlur', 'filterBrightness', 'filterContrast', 'filterGrayscale'].includes(config.field)

      ) {

        currentStyles[config.field] = `${value}${config.unit}`;

      }



      currentStyles['filter'] = buildFilter(currentStyles);

      currentStyles['boxShadow'] = buildBoxShadow(currentStyles['shadowColor']);


      updatePayload = { styles: currentStyles };

    } else {

      updatePayload = { [config.field]: value };

    }


    if (isSectionSelection) {

      updateSection(state.activePageId, selectedId, updatePayload);

    } else {

      previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, updatePayload);

      debouncedUpdate(state.activePageId, selectedItem.sectionId, selectedId, updatePayload);

    }

  }, [selectedItem, isSectionSelection, state.activePageId, selectedId]);


  const handleResetProperty = (config, e) => {

    e.stopPropagation();

    const fallbackVal = DEFAULT_VALUES[config.field] !== undefined ? DEFAULT_VALUES[config.field] : "";

    handlePropertyChange(config, fallbackVal);

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

            initialValue={value}

            config={config}

            onPropertyChange={handlePropertyChange}

          />

        );


      case "range":

        return (

          <ControlledRangeInput

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


      case "advanced-color":

        let safeAdvancedColor = value;

        if (!value) safeAdvancedColor = "#ffffff";

        else if (typeof value === "string" && !value.includes("gradient") && !value.startsWith("#")) {

          safeAdvancedColor = "#ffffff";

        }

        return (

          <AdvancedColorPicker

            value={safeAdvancedColor}

            config={config}

            onPropertyChange={handlePropertyChange}

          />

        );


      case "color": {

        const safeColor = (typeof value === "string" && value.startsWith("#")) ? value : "#000000";

        return (

          <input

            key={`${selectedId}-${config.field}-${safeColor}`}

            type="color"

            value={safeColor}

            onChange={(e) => handlePropertyChange(config, e.target.value)}

            style={styles.colorPicker}

          />

        );

      }


      case "alignment-toggle":

        return (

          <div style={styles.alignToggleGroup}>

            <button style={{ ...styles.alignBtn, backgroundColor: value === 'left' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'left')}><AlignLeft size={14} /></button>

            <button style={{ ...styles.alignBtn, backgroundColor: value === 'center' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'center')}><AlignCenter size={14} /></button>

            <button style={{ ...styles.alignBtn, backgroundColor: value === 'right' ? '#e2e8f0' : 'transparent' }} onClick={() => handlePropertyChange(config, 'right')}><AlignRight size={14} /></button>

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


  const visibleControls = useMemo(() => allControls.slice(0, 6), [allControls]);

  const hiddenControls = useMemo(() => allControls.slice(6), [allControls]);


if (!selectedItem) return null;

  const currentPage = state.pages?.find(p => p.id === state.activePageId);
  const currentSectionData = currentPage?.sections?.find(s => s.id === selectedItem.sectionId);
  
  const selectableElementsOptions = currentSectionData?.data?.items
    ? currentSectionData.data.items
        .filter(item => item.id !== selectedId && item.type === 'input')
        .map(item => ({
          id: item.id,
          name: item.label || item.placeholder || item.name || `Field (${item.id.slice(-4)})`
        }))
    : [];
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

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>

                  <div style={styles.popoverHeader}>{ctrl.label}</div>

                  <button

                    onClick={(e) => handleResetProperty(ctrl, e)}

                    style={styles.resetBtn}

                    title="Reset to default"

                  >

                    <RotateCcw size={10} />

                  </button>

                </div>

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

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

                    {renderControl(ctrl, true)}

                    <button

                      onClick={(e) => handleResetProperty(ctrl, e)}

                      style={styles.resetBtnInline}

                      title="Reset Property"

                    >

                      <RotateCcw size={12} />

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </>

      )}


      {itemType === 'section' && (

        <>

          <div style={styles.divider} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>Section Name:</span>

            <input

              type="text"

              style={{ ...styles.input, width: "120px" }}

              placeholder="e.g., Hero, Services..."

              value={selectedItem.name || ""}

              onChange={(e) => {

                updateSection(state.activePageId, selectedId, { name: e.target.value });

              }}

            />

          </div>

        </>

      )}


      {['button', 'link'].includes(itemType) && (

        <>

          <div style={styles.divider} />

          <div style={styles.controlWrapper}>

         <select
  style={{ ...styles.input, width: "105px", padding: "2px 4px", fontWeight: "500" }}
  value={selectedItem.action?.type || "none"}
  onChange={(e) => handleActionChange(e.target.value, selectedItem.action?.payload || "")}
>
  <option value="none">None</option>
  <option value="page">Navigate to page</option>
  <option value="url">URL</option>
  <option value="scroll">Move to section</option>
  <option value="email">Email</option>
  <option value="submit_form">Form</option>
  <option value="submit">Submit Data</option>
  <option value="link_element">Link to an element</option>
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

              <select style={{ ...styles.input, width: "110px" }} value={selectedItem.action?.payload || ""} onChange={(e) => handleActionChange('scroll', e.target.value)}>

                <option value="">Section..</option>

                {currentSections

                  .filter(sec => sec.type !== 'ghost-section')

                  .map((sec, idx) => {

                    const sectionDisplayName = sec.name ? sec.name : `Section ${idx + 1} (${sec.type})`;

                    return (

                      <option key={sec.id} value={sec.id}>

                        {idx + 1}. {sectionDisplayName}

                      </option>

                    );

                  })}

              </select>

            )}


            {selectedItem.action?.type === 'email' && (

              <input

                type="email"

                style={{ ...styles.input, width: "130px" }}

                placeholder="mail@example.com"

                value={selectedItem.action?.payload || ""}

                onChange={(e) => handleActionChange('email', e.target.value)}

              />

            )}

{selectedItem.action?.type === 'link_element' && (
  <div className="mt-4 p-3 bg-slate-50 border rounded-lg">
    <label className="block text-xs font-semibold text-slate-600 mb-2">
      Select Target Elements to Trigger:
    </label>
    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
      {state.pages
        .find(p => p.id === state.activePageId)?.sections
        .find(s => s.id === selectedItem.sectionId)?.data?.items
        ?.filter(item => item.id !== selectedItem.id) 
        ?.map(item => {
          const targetIds = Array.isArray(selectedItem.action?.payload) ? selectedItem.action.payload : [];
          const isChecked = targetIds.includes(item.id);

          return (
            <label key={item.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  let updatedPayload = [...targetIds];
                  if (e.target.checked) {
                    updatedPayload.push(item.id);
                  } else {
                    updatedPayload = updatedPayload.filter(id => id !== item.id);
                  }
                  handleActionChange('link_element', updatedPayload);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="capitalize font-medium">[{item.type}]</span>
              <span className="text-slate-400 truncate max-w-30">
                {item.text || item.label || item.id.substring(0, 8)}
              </span>
            </label>
          );
        })}
    </div>
  </div>
)}


{selectedItem?.type === 'button' && 
 (selectedItem.action?.type === 'submit_form' || selectedItem.action?.type === 'submit') && (
  <div className="mt-2 text-left relative w-full">
    
    <details className="group relative w-full list-none">
      <summary className="flex items-center justify-between w-full p-1.5 px-2 bg-white border border-slate-200 rounded-md cursor-pointer list-none select-none hover:bg-slate-50 text-[11px] text-slate-600 transition-colors shadow-sm focus:outline-none">
        <div className="flex items-center gap-1.5 truncate">
 
          <span className="font-medium truncate">
            {Array.isArray(selectedItem.action?.payload) && selectedItem.action.payload.length > 0
              ? `${selectedItem.action.payload.length} fields selected`
              : "Link fields..."}
          </span>
        </div>
        <span className="transition-transform duration-150 group-open:rotate-180 text-slate-400">
          <svg fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="12">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </span>
      </summary>

      <div className="absolute top-full left-0 w-full mt-1 p-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-44 overflow-y-auto space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
        {(() => {
          const activePage = state.pages?.find(p => p.id === state.activePageId);
          const currentSection = activePage?.sections?.find(s => 
            s.data?.items?.some(i => i.id === selectedItem.id)
          );
          const itemsList = currentSection?.data?.items || [];
          const inputFields = itemsList.filter(item => item.type === 'input' || item.type === 'textarea');

          if (inputFields.length === 0) {
            return <p className="text-[10px] text-slate-400 text-center py-2">No inputs found in section.</p>;
          }

          return inputFields.map((field, index) => {
            const boundFieldIds = Array.isArray(selectedItem.action?.payload) ? selectedItem.action.payload : [];
            const isChecked = boundFieldIds.includes(field.id);

            const fieldTypeName = field.inputType === 'email' ? 'Email' : 
                                  field.inputType === 'number' ? 'Number' : 
                                  field.type === 'textarea' ? 'Message' : 'Text';
            
            const fieldDisplayName = field.placeholder || field.fieldName || `${fieldTypeName} Field ${index + 1}`;

            return (
              <label 
                key={field.id} 
                className={`flex items-center gap-2 p-1.5 rounded transition-colors cursor-pointer select-none text-left w-full
                  ${isChecked 
                    ? 'bg-indigo-50/60 text-indigo-900 hover:bg-indigo-50' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    let updatedPayload = [...boundFieldIds];
                    if (e.target.checked) {
                      updatedPayload.push(field.id);
                    } else {
                      updatedPayload = updatedPayload.filter(id => id !== field.id);
                    }
                    handleActionChange(selectedItem.action?.type, updatedPayload);
                  }}
                  className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex flex-col min-w-0 truncate">
                  <span className="text-[11px] font-medium truncate">
                    {fieldDisplayName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal scale-95 origin-left">
                    {fieldTypeName}
                  </span>
                </div>
              </label>
            );
          });
        })()}
      </div>
    </details>
  </div>
)}

 </div>

        </>

      )}

    </div>

  );

}



const styles = {

  floatingToolbar: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.04)", border: "1px solid #cbd5e1", width: "fit-content", maxWidth: "95vw", overflow: "visible", pointerEvents: "auto", zIndex: 999, position: "relative", height: "46px" },

  itemBadge: { background: "#e2e8f0", color: "#334155", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", whiteSpace: "nowrap" },

  controlButtonTrigger: { display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", background: "transparent", border: "none", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", color: "#475569", position: "relative", transition: "all 0.15s ease" },

  inlinePopover: { position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 1002, whiteSpace: "nowrap" },

  popoverHeader: { fontSize: "11px", fontWeight: "600", color: "#64748b", textAlign: "left" },

  input: { padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", height: "32px", background: "#ffffff" },

  colorPicker: { width: "36px", height: "32px", padding: "2px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer", background: "transparent" },

  divider: { width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" },

  closeBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" },

  moreBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", color: "#475569", transition: "all 0.15s ease" },

  dropdownMenu: { position: "absolute", top: "calc(100% + 8px)", right: "0px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 1001, minWidth: "260px", maxHeight: "380px", overflowY: "auto", scrollbarWidth: "thin" },

  dropdownItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "2px 0" },

  subLabel: { fontSize: "12px", fontWeight: "500", color: "#475569", display: "flex", alignItems: "center", gap: "6px" },

  resetBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" },

  resetBtnInline: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" },

  controlWrapper: { display: "flex", alignItems: "center", gap: "6px" },

  alignToggleGroup: { display: "flex", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" },

  alignBtn: { border: "none", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" },

  advColorContainer: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "180px" },

  tabHeader: { display: "flex", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" },

  tabBtn: { border: "none", padding: "4px 8px", fontSize: "11px", cursor: "pointer", borderRadius: "4px", color: "#334155" },

  gradPreset: { width: "20px", height: "20px", borderRadius: "4px", cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" }

};



export const PROPERTY_CONTROLS = {

  common: [

    { section: "Layout", label: "Opacity", field: "opacity", type: "range", min: 0, max: 1, step: 0.1 },

    { section: "Layout", label: "Z-Index (Layers)", field: "zIndex", type: "number", placeholder: "0" },

    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },

    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },

    { section: "Border", label: "Border Color", field: "borderColor", type: "color" },

    { section: "Border", label: "Border Style", field: "borderStyle", type: "select", options: ["none", "solid", "dashed", "dotted", "double"] },

    { section: "Shadow", label: "Shadow Color", field: "shadowColor", type: "color" },

    { section: "Filters", label: "Blur", field: "filterBlur", type: "range", min: 0, max: 20 },

    { section: "Filters", label: "Brightness", field: "filterBrightness", type: "range", min: 0, max: 200 },

    { section: "Filters", label: "Contrast", field: "filterContrast", type: "range", min: 0, max: 200 },

    { section: "Filters", label: "Grayscale", field: "filterGrayscale", type: "range", min: 0, max: 100 },

    { section: "Hover Styles", label: "Hover Background", field: "hoverBg", type: "color" },

    { section: "Hover Styles", label: "Hover Text Color", field: "hoverColor", type: "color" },

    { section: "Hover Styles", label: "Hover Scale Effect", field: "hoverScale", type: "select", options: ["none", "1.02", "1.05", "1.1"] },

    { section: "Hover Styles", label: "Transition Speed", field: "transitionSpeed", type: "number", unit: "s", placeholder: "e.g., 0.2" },

    { section: "Effects", label: "Shadow Mode", field: "shadowMode", type: "select", options: ["none", "Drop", "Glow", "Echo", "Glitch"] },

    { section: "Effects", label: "Shadow Blur", field: "shadowBlur", type: "range", min: 0, max: 20 },

    { section: "Effects", label: "Glitch Effect", field: "glitchStyle", type: "select", options: ["none", "RGB Split", "Cyberpunk", "Vintage"] },

  ],

input: [
    { 
      section: "Field Base", 
      label: "Field Type", 
      field: "inputType", 
      type: "select", 
      options: ["text", "email", "password", "number", "tel", "date", "time", "color"] 
    },
    { 
      section: "Field Base", 
      label: "Field Key (Name)", 
      field: "name", 
      type: "text", 
      placeholder: "e.g., username, email" 
    },
    { 
      section: "Field Base", 
      label: "Placeholder text", 
      field: "placeholder", 
      type: "text", 
      placeholder: "e.g., Enter your email..." 
    },
    { 
      section: "Validation",
      label: "Expected Data", 
      field: "dataType", 
      type: "select", 
      options: ["Any", "Email", "Phone", "Number", "URL", "Date", "Username", "Full Name", "Password"] 
    },
    { 
      section: "Label Typography", 
      label: "Label Size", 
      field: "labelFontSize", 
      type: "number", 
      unit: "px" 
    },
    { 
      section: "Label Typography", 
      label: "Label Color", 
      field: "labelColor", 
      type: "color" 
    },
    { 
      section: "Field Typography", 
      label: "Font Size", 
      field: "fontSize", 
      type: "number", 
      unit: "px" 
    },
    { 
      section: "Field Typography", 
      label: "Font Color", 
      field: "color", 
      type: "color" 
    },
  ],
  text: [

    { section: "Typography", label: "Text Content", field: "text", type: "text" },

    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },

    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["100", "300", "400", "500", "700", "900", "normal", "bold"] },

    { section: "Typography", label: "Text Color", field: "color", type: "color" },

    { section: "Typography", label: "Align", field: "textAlign", type: "alignment-toggle" },

    { section: "Typography", label: "Letter Spacing", field: "letterSpacing", type: "number", unit: "px" },

    { section: "Typography", label: "Line Height", field: "lineHeight", type: "number", step: 0.1 },

    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["none", "underline", "line-through", "overline", "underline wavy", "underline dotted", "underline dashed"] },

    { section: "Typography", label: "Transform", field: "textTransform", type: "select", options: ["none", "uppercase", "lowercase", "capitalize"] },

  ],

  button: [

    { section: "Typography", label: "Button Text", field: "text", type: "text" },

    { section: "Style", label: "Background Color", field: "backgroundColor", type: "advanced-color" },

    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },

    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },

    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px", isTextStyle: true },

    { section: "Typography", label: "Font Color", field: "color", type: "color", isTextStyle: true },

    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["normal", "bold", "500", "700"], isTextStyle: true },

    { section: "Typography", label: "Align", field: "textAlign", type: "alignment-toggle", isTextStyle: true },

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

    { section: "Typography", label: "Color", field: "color", type: "color" },

    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["underline", "none", "line-through"] },

  ],

  section: [

    { field: 'backgroundColor', label: 'Background Color', type: 'color', section: 'Appearance' },

    { field: 'minHeight', label: 'Min Height', type: 'number', unit: 'px', section: 'Layout' },

  ],

  animations: [

    { section: "Animation", label: "Entry Animation", field: "entryAnimation", type: "select", options: ["none", "Rise", "Pan", "Fade", "Zoom In"] },

    { section: "Animation", label: "Direction", field: "panDirection", type: "alignment-toggle", options: ["up", "down", "left", "right"] },

    { section: "Animation", label: "Duration", field: "animationDuration", type: "number", unit: "s", placeholder: "e.g., 0.5" },

    { section: "Animation", label: "Delay", field: "animationDelay", type: "number", unit: "s", placeholder: "0" },

  ],

  positioning: [

    { section: "Position", label: "Arrange (Layering)", field: "zIndex", type: "select", options: ["To Front", "Bring Forward", "Send Backward", "To Back"] },

    { section: "Position", label: "Align to Canvas", field: "canvasAlignment", type: "canvas-align-toggle" },

  ],

};
