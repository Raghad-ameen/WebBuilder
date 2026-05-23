import React, { useRef ,useState,useEffect} from "react";
import axios from "axios"; 
import { Trash2 ,Image as ImageIcon} from "lucide-react";
import Moveable from "react-moveable";
import SectionWrapper from "./SectionWrapper";
import CanvasElement from "./CanvasElement";
import Selecto from "react-selecto";
import "./SectionRenderer.css"; 
const HoverWrapper = ({ item, children, isPreviewMode }) => {
const [isHovered, setIsHovered] = useState(false);

const finalStyle = {
  ...item.styles,

  background: isHovered
    ? item.styles?.hoverBg || item.styles?.backgroundColor
    : item.styles?.backgroundColor,

  color: isHovered
    ? item.styles?.hoverColor || item.styles?.color
    : item.styles?.color,

  transform: isHovered && item.styles?.hoverScale !== "none"
    ? `scale(${item.styles.hoverScale})`
    : "scale(1)",

  transition: `all ${item.styles?.transitionSpeed || 0.2}s ease`
};
  const stylesObj = item?.styles || {};
  const hoverBg = stylesObj.hoverBg;
  const hoverColor = stylesObj.hoverColor;
  const hoverScale = stylesObj.hoverScale;
  const transitionSpeed = stylesObj.transitionSpeed || 0.2;

if (!isPreviewMode) {
  const fallbackHoverStyles = {
    ...stylesObj,
    hoverBg: hoverBg && hoverBg !== 'transparent' ? hoverBg : "#ffffff",
    hoverColor: hoverColor && hoverColor !== 'inherit' ? hoverColor : stylesObj.color || "#000000",
    hoverScale: hoverScale || "none",
    transitionSpeed: transitionSpeed
  };
  return children({ computedStyle: stylesObj, hoverStyles: fallbackHoverStyles });
}

  const baseStyles = { ...stylesObj };
  const hasScale = hoverScale && hoverScale !== "none";

  if (isHovered) {
    if (hoverBg && hoverBg !== 'transparent') {
      delete baseStyles.background;
      delete baseStyles.backgroundColor;
      
      if (hoverBg.includes('gradient')) {
        baseStyles.background = hoverBg;
      } else {
        baseStyles.backgroundColor = hoverBg;
      }
    }
    
    if (hoverColor && hoverColor !== 'inherit') {
      baseStyles.color = hoverColor;
    }
  } else {
    if (baseStyles.background && baseStyles.backgroundColor) {
      delete baseStyles.backgroundColor;
    }
  }

  const computedStyle = {
    ...baseStyles,
    transform: isHovered && hasScale ? `scale(${hoverScale})` : "scale(1)",
    transition: `all ${transitionSpeed}s ease-in-out`
  };

  const activeHoverStyles = {
    ...stylesObj,
    hoverBg: hoverBg || "#ffffff",
    hoverColor: hoverColor || stylesObj.color || "#000000",
    hoverScale: hoverScale || "none",
    transitionSpeed: transitionSpeed
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'contents' }}
    >
      {children({ computedStyle, hoverStyles: activeHoverStyles })}
    </div>
  );
};

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store, canvasScale = 1 }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem,moveSectionUp, moveSectionDown } = store;
  const activePageId = state.activePageId; 
  const allSections = state.pages.find(p => p.id === activePageId)?.sections || [];
  const itemRefs = useRef({});
  const BASE_WIDTH = 1200;
  const isSelected = state.selectedSectionId === section.id;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isActive = state.activeSectionId === section.id;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [targets, setTargets] = useState([]); 
  const validTargets = targets.filter(Boolean);
//nbn
  const [interactionMode, setInteractionMode] = useState("select"); 

  const activePage = state.pages.find(p => p.id === activePageId);
  const sectionIndex = activePage?.sections?.findIndex(s => s.id === section.id) ?? 0;
const blurFilter = section.styles?.blur ? `blur(${section.styles.blur}px)` : "";
const brightnessFilter = section.styles?.brightness ? `brightness(${section.styles.brightness}%)` : "";
const contrastFilter = section.styles?.contrast ? `contrast(${section.styles.contrast}%)` : "";
const saturateFilter = section.styles?.saturate ? `saturate(${section.styles.saturate}%)` : "";
const grayscaleFilter = section.styles?.grayscale ? `grayscale(${section.styles.grayscale}%)` : "";
const sepiaFilter = section.styles?.sepia ? `sepia(${section.styles.sepia}%)` : "";
const hueRotateFilter = section.styles?.hueRotate ? `hue-rotate(${section.styles.hueRotate}deg)` : "";
const invertFilter = section.styles?.invert ? `invert(${section.styles.invert}%)` : "";

const cleanFilter = [
  blurFilter, brightnessFilter, contrastFilter, saturateFilter, 
  grayscaleFilter, sepiaFilter, hueRotateFilter, invertFilter
].filter(Boolean).join(" ") || "none";

  React.useEffect(() => {
    const lastItem = section.data.items?.[section.data.items.length - 1];
    const isAnythingSelected = selectedElementIds.length > 0;
  }, [section.data.items, selectedElementIds, onSelect]);


  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const range = document.createRange();
    range.selectNodeContents(e.target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

const handleSubmitForm = async (sectionId, action) => {
    if (!state.isPreviewMode) return;

    const formFields = section.data.items.filter(item => item.type === 'input');
    const formData = {};
    
    formFields.forEach(field => {
      const inputEl = document.getElementById(`input-${field.id}`);
      if (inputEl) {
        const fieldKey = field.name || `field_${field.id}`;
        formData[fieldKey] = inputEl.value;
      }
    });

    if (Object.keys(formData).length === 0) {
      alert("لا توجد حقول لإرسالها!");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/forms/submit/', {
        section_id: sectionId,
        submission_data: formData
      });

      if (response.status === 201) {
        alert('تم إرسال رسالتك بنجاح وسُجلت في السيرفر! 🎉');
        
        formFields.forEach(field => {
          const inputEl = document.getElementById(`input-${field.id}`);
          if (inputEl) inputEl.value = "";
        });
      }
    } catch (error) {
      console.error("حدث خطأ أثناء إرسال الفورم:", error);
      alert("فشل إرسال الرسالة، تأكد من تشغيل سيرفر الـ Django والـ API.");
    }
  };
  const handleItemAction = (item) => {
    if (!state.isPreviewMode) return;
    const { action } = item;
    if (!action || !action.type) return;

    if (action?.type === 'submit_form') {
      setIsFormVisible(true);
      return; 
    }

    switch (action.type) {
      case 'page':
        if (action.payload) {
          store.setState(prev => ({
            ...prev,
            activePageId: action.payload,
            selectedElementIds: [],
            selectionGroupMode: false,
          }));
        }
        break;
      case 'url':
        if (action.payload) {
          window.open(action.payload, action.target || '_blank');
        }
        break;
      case 'scroll':
        if (action.payload) {
          const targetSection = document.getElementById(action.payload);
          targetSection?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'popup': 
         store.setState(prev => ({ ...prev, activePopupId: action.payload }));
        break;
      case 'email': 
        if (action.payload) {
          window.location.href = `mailto:${action.payload}`;
        }
        break;
      case 'submit_form': 
        handleSubmitForm(section.id, item.action);
        break;
      default:
        console.log("Unknown action type:", action.type);
    }
  };

  const isSectionSelected = state.selectedSectionId === section.id;
  const hasSelectedChild = section.data.items.some(it => selectedElementIds.includes(it.id));
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

useEffect(() => {
  if (selectedElementIds && selectedElementIds.length > 0) {
    setTargets(selectedElementIds.map(id => document.getElementById(id)).filter(Boolean));
  } else if (state.selectedSectionId === section.id) {
    setTargets([sectionRef.current].filter(Boolean));
  } else {
    setTargets([]);
  }
}, [selectedElementIds, state.selectedSectionId, section.id]);

  const { border, borderBottom, ...safeStyles } = section.styles || {};

  return (
    <div
      ref={sectionRef}
      id={section.id}
  className={`section-container section-${section.id} ${isSectionSelected ? 'selected-section' : ''}`}
  
  
  
  onMouseDown={(e) => {
  if (section.isGhost || state.isPreviewMode) return;

  if (
    e.target.closest('.canvas-element') || 
    e.target.closest('.trash-button-class') || 
    e.target.closest('.section-toolbar') ||
    e.target.closest('.moveable-control-box')
  ) {
    return;
  }

  if (e.target.classList.contains('selecto-area') || e.target.closest('.selecto-area')) {
    return; 
  }

  if (e.button !== 0) return; 

  store.setState(prev => ({
    ...prev,
    selectedSectionId: section.id,
    selectedElementIds: prev.selectionGroupMode ? prev.selectedElementIds : [],
    selectionGroupMode: prev.selectionGroupMode
  }));
}}     

onMouseUp={(e) => {
        if (!state.isDraggingNow || !state.draggingType) return;

        const sectionTypes = ['hero', 'navbar', 'footer', 'feature-grid'];

        if (sectionTypes.includes(state.draggingType)) {
          let initialItems = [];
          
          if (state.draggingType === 'feature-grid') {
            initialItems = [
              { id: `feat-title-${Date.now()}`, type: 'text', text: 'Our Features', x: 500, y: 30, width: 200, height: 40, styles: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' } },
              { id: `feat-desc-${Date.now()}`, type: 'text', text: 'Feature description text goes here.', x: 450, y: 80, width: 300, height: 60, styles: { fontSize: '14px', textAlign: 'center', color: '#64748b' } }
            ];
          } else if (state.draggingType === 'footer') {
            initialItems = [
              { id: `foot-copy-${Date.now()}`, type: 'text', text: '© 2026 Store Name. All rights reserved.', x: 450, y: 40, width: 300, height: 30, styles: { fontSize: '14px', textAlign: 'center', color: '#94a3b8' } }
            ];
          }

          if (store.addSection) {
            store.addSection(state.draggingType, initialItems);
          }

          store.setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
          return;
        }
        e.stopPropagation();

        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvasScale;
        const y = (e.clientY - rect.top) / canvasScale;

        const defaultWidth = 150;
        const defaultHeight = 150;

        let shapeStyles = {};
        let detectedShapeType = "square";

     if (state.draggingType === "shape") {

          shapeStyles = {
            backgroundColor: state.draggingShapeData?.styles?.backgroundColor || "#4f46e5",
            background: state.draggingShapeData?.styles?.background || "none",
            clipPath: state.draggingShapeData?.styles?.clipPath || "none",
            borderRadius: state.draggingShapeData?.styles?.borderRadius || "0px",
            borderWidth: state.draggingShapeData?.styles?.borderWidth || "0px",
            borderColor: state.draggingShapeData?.styles?.borderColor || "transparent"
          };
          
          if (state.draggingShapeData?.shapeType) {
            detectedShapeType = state.draggingShapeData.shapeType;
          } else if (shapeStyles.clipPath && shapeStyles.clipPath !== "none") {
            const cleanClip = shapeStyles.clipPath.replace(/\s+/g, '').toLowerCase();
            if (cleanClip.includes("polygon(50%0%") || cleanClip.includes("50%0")) detectedShapeType = "triangle";
            else if (cleanClip.includes("50%100%")) detectedShapeType = "rhombus";
            else detectedShapeType = "custom-shape";
          } else if (shapeStyles.borderRadius === "50%") {
            detectedShapeType = "circle";
          }
        }

       

        store.addItemAtPosition(
          state.draggingType,
          x,
          y,
          section.id,
          {
            width: defaultWidth,
            height: defaultHeight,
            shapeType: detectedShapeType,
            styles: shapeStyles
          }
        );
        store.setState(prev => ({
          ...prev,
          isDraggingNow: false,
          draggingType: null,
          draggingShapeData: null
        }));
      }}

      style={{
        position: section.styles?.position ?? "relative",
          pointerEvents: section.isGhost ? "none" : "auto",
        left: section.styles?.left || 0,
        top: section.styles?.top || 0,
        width: section.styles?.width || "100%",
        height: section.isGhost
          ? "0px"
          : section.height
            ? `${section.height}px`
            : (
                section.type === 'footer'
                  ? "120px"
                  : section.type === 'feature-grid'
                    ? "400px"
                    : "auto"
              ),

        minHeight: section.isGhost
          ? "0px"
          : (
              section.type === 'footer'
                ? "80px"
                : "100px"
            ),

    zIndex: section.isGhost
  ? 0
  : allSections.length - sectionIndex,
        overflow: section.isGhost
          ? "hidden"
          : (isSectionSelected ? "visible" : "hidden"),

        background: section.styles?.background || "transparent",
        backgroundColor: section.styles?.backgroundColor || "transparent",

        ...section.styles,

        boxShadow: section.styles?.boxShadow,
        filter: section.styles?.filter,
      }}
    > 
        
    {isSectionSelected && !state.isPreviewMode && !section.isGhost && (
        <div style={styles.sectionToolbar}>
        <button 
          onPointerDown={(e) => { 
            e.stopPropagation(); 
            deleteSection(section.id); 
          }} 
          style={{...styles.toolBtn, color: '#ef4444'}}
        >
          <Trash2 size={16} />
        </button>
      </div>
    )}
    {(section.data?.items || []).map((item, index) => {
      const isSelected = state.selectedElementIds.includes(item.id) && state.selectionGroupMode ? true : state.selectedElementIds.includes(item.id);
      const leftPercent = (item.x / BASE_WIDTH) * 100;
      const widthPercent = (item.width / BASE_WIDTH) * 100;
      const isMobileOrTablet = typeof window !== "undefined" && window.innerWidth < 1024;
      
      const { clipPath, background, backgroundColor, filter, boxShadow, zIndex, textAlign, ...otherStyles } = item.styles || {};
      const isPartOfForm = ['input', 'shape'].includes(item.type) || (item.type === 'text' && index > 0) || (item.type === 'button' && item.text === "Send Message");

      const resolvedZIndex = isSelected ? 100000 : (item.styles?.zIndex !== undefined ? parseInt(item.styles.zIndex) : (2000 + index));

      const getCleanFilter = () => {
        if (!item.styles?.filter || item.styles.filter === "none") return "none";
        return item.styles.filter.replace(/NaN%/g, "100%");
      };
      const cleanFilter = getCleanFilter();

      return (
        <React.Fragment key={item.id}>
          <div
            ref={(el) => (itemRefs.current[item.id] = el)}
            id={item.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}

            onMouseDown={(e) => {
              setInteractionMode("move");
              const isCtrl = e.ctrlKey || e.metaKey;
              if (item.isEditing) return;

              if (isCtrl) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const currentSelected = Array.isArray(state.selectedElementIds) ? state.selectedElementIds.map(String) : [];
                  const targetId = String(item.id);
                  let newSelection;

                  if (currentSelected.includes(targetId)) {
                      newSelection = currentSelected.filter(id => id !== targetId);
                  } else {
                      newSelection = [...currentSelected, targetId];
                  }

                  store.selectItems(newSelection);
                  store.setState(prev => ({ ...prev, selectionGroupMode: newSelection.length > 1 }));
                  return;
              }

              if (!e.ctrlKey && !e.metaKey) {
                e.stopPropagation();
              }

              store.setState(prev => ({ ...prev, selectedSectionId: null }));
              store.selectItems([String(item.id)]);
            }}

            onMouseUp={() => {
                setInteractionMode("select");
            }}

style={{
  position: "absolute", 
  left: `${item.x}px`,     
  top: `${item.y}px`,
  width: `${item.width}px`, 
  height: `${item.height}px`,
  
  zIndex: resolvedZIndex,
  
  margin: isMobileOrTablet ? "15px auto" : "0", 
  
  display: state.isPreviewMode 
    ? (item.type === 'button' && item.text !== "Send Message" 
        ? "inline-block"
        : (isPartOfForm ? (isFormVisible ? "block" : "none") : "block"))
    : "block",

  textAlign: item.type === 'button' ? 'center' : undefined,
  lineHeight: item.type === 'button' ? `${item.height}px` : undefined,

  cursor: item.isEditing ? "text" : "move",
  overflow: "visible",
  pointerEvents: "auto",
  willChange: "left, top, width, height",
  backfaceVisibility: 'hidden',
  perspective: 1000,
  WebkitFontSmoothing: 'antialiased',
  boxShadow: "none",

  ...(item.styles || {}), 
}}
>

            {isSelected && !item.isEditing && !state.isPreviewMode && (
              <div
                className="trash-button-class"
                onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onClick={(e) => { e.stopPropagation(); deleteElement(item.id); }}
                style={{
                  position: "absolute",
                  top: "-40px", 
                  right: "0px",
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2147483647, 
                  pointerEvents: "auto",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  border: "2px solid white",
                }}
              >
                <Trash2 size={14} color="white" strokeWidth={3} />
              </div>
            )}

{item.type === 'text' && (() => {
  const isColorGradient = item.styles?.color && item.styles.color.includes('gradient');
  const shadowBlur = item.styles?.blur !== undefined ? `${item.styles.blur}px` : "2px";
  const shadowColor = item.styles?.shadowColor || "rgba(0, 0, 0, 0.5)";
  const hasTextShadow = item.styles?.shadowColor || parseInt(item.styles?.blur) > 0;

  return (
<HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
  {({ computedStyle, hoverStyles }) => (
        <div 
      className="text-element-wrapper"
      style={{ 
        position: 'relative', 
        width: "100%", 
        height: "100%", 
        top: isMobile ? `${index * 40}px` : `0px`, 
        display: "flex",
        alignItems: "center",
        justifyContent: item.styles?.textAlign === 'right' ? 'flex-end' : 
                        item.styles?.textAlign === 'center' ? 'center' : 'flex-start',
        background: item.styles?.background || item.styles?.backgroundImage || "none",
        boxShadow: "none",
         ...computedStyle,
        filter: cleanFilter,
        
      
      }}
    >
      {!item.isEditing && (
        <div 
          style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'move' }} 
          onDoubleClick={(e) => { 
            e.stopPropagation(); 
            store.updateItem(state.activePageId, section.id, item.id, { isEditing: true }); 
          }} 
        />
      )}
      <div
        id={`text-input-${item.id}`}
        contentEditable={item.isEditing}
        suppressContentEditableWarning
        onBlur={(e) => { 
          store.updateItem(state.activePageId, section.id, item.id, { text: e.target.innerText, isEditing: false }); 
        }}
        style={{
          ...item.styles, 
          width: "auto",
          minWidth: "50px",
          outline: "none",
          zIndex: 5,
          fontSize: isMobile ? `clamp(12px, 4vw, 18px)` : (item.styles?.fontSize || "16px"),
          textAlign: item.styles?.textAlign || "left",
          lineHeight: "1.2", 
          wordBreak: "break-word", 
          overflowWrap: "anywhere",
          whiteSpace: "normal", 
          boxShadow: "none",
          filter: "none", 
          textShadow: hasTextShadow ? `2px 2px ${shadowBlur} ${shadowColor}` : "none",
          
          color: hoverStyles.color || item.styles?.color || "inherit",

          ...(isColorGradient ? {
            backgroundImage: item.styles.color,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            MozBackgroundClip: 'text',
            MozTextFillColor: 'transparent',
            display: 'inline-block'
          } : {})
        }}
      >
        {item.text || "Type your text..."}
      </div>
    </div>
  )}
</HoverWrapper>  );
})()}

{item.type === 'image' && (
  <HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
   {({ computedStyle, hoverStyles }) => (
      <div 
        style={{ 
          ...item.styles, 
          width: "100%", 
          height: "100%", 
          overflow: "hidden", 
          position: "relative", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          backgroundColor: item.src ? "transparent" : (item.styles?.backgroundColor || "#f8fafc"), 
          border: item.src ? "none" : "1px dashed #cbd5e1", 
          borderRadius: item.styles?.borderRadius || "8px", 
          zIndex: isSelected ? 2000 : 100, 
          filter: cleanFilter, 
           ...computedStyle,
          boxShadow: item.styles?.boxShadow || "none",
        
        }}
      >
        {item.src ? (
          <img 
            src={item.src} 
            alt="Uploaded content" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: (item.styles?.objectFit || "cover").toLowerCase(),
              maxWidth: "100%",
              pointerEvents: "none",
              display: "block"
            }} 
          />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation(); 
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*'; 
              input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => { updateItem(activePageId, section.id, item.id, { src: e.target.result }); };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "8px", color: "#64748b", transition: "all 0.2s ease" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <div><span style={{ fontSize: "20px", fontWeight: "bold", lineHeight: 1 }}>+</span></div>
            <span style={{ fontSize: "12px", fontWeight: "500" }}>add image</span>
          </div>
        )}
      </div>
    )}
  </HoverWrapper>
)}


{item.type === 'shape' && (() => {
  const hasGradient = item.styles?.background && item.styles.background.includes('gradient');
  const borderWidth = parseInt(item.styles?.borderWidth) || 0;
  const borderColor = item.styles?.borderColor || "transparent";
  const borderFilter = borderWidth > 0 ? `drop-shadow(0px 0px ${borderWidth}px ${borderColor})` : "";
  const combinedFilter = [cleanFilter, borderFilter].filter(Boolean).join(" ");
  const targetClipPath = item.styles?.clipPath || "none";

  return (
    <HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
    {({ computedStyle, hoverStyles }) => (
        <div 
          key={item.id} 
          style={{ 
            width: "100%", 
            height: "100%", 
            overflow: "visible", 
            clipPath: targetClipPath, 
            WebkitClipPath: targetClipPath, 
            borderRadius: item.styles?.borderRadius || "0px",
            filter: combinedFilter, 
            boxShadow: item.styles?.boxShadow || "none", 
            ...computedStyle,
            background: hasGradient ? item.styles.background : "none",
            backgroundColor: hasGradient ? "transparent" : (hoverStyles.backgroundColor || item.styles?.backgroundColor || "#4f46e5"),
          
          }}
        />
      )}
    </HoverWrapper>
  );
})()}

{item.type === 'button' && (
  <HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
      {({ computedStyle, hoverStyles }) => (
      <div
        className="button-container-wrapper"
style={{ 
  ...computedStyle,

  width: "100%", 
  height: "100%", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: item.styles?.textAlign === 'right'
    ? 'flex-end'
    : item.styles?.textAlign === 'left'
    ? 'flex-start'
    : 'center',

  filter: cleanFilter, 
  boxShadow: item.styles?.boxShadow || "none", 
  
  background: item.styles?.background || "none",

  backgroundColor: item.styles?.background
    ? "transparent"
    : (
        hoverStyles.backgroundColor ||
        item.styles?.backgroundColor ||
        "#4f46e5"
      ),

  borderWidth: item.styles?.borderWidth !== undefined
    ? `${parseFloat(item.styles.borderWidth)}px`
    : '0px',

  borderColor: item.styles?.borderColor || "transparent",

  borderStyle:
    item.styles?.borderStyle &&
    item.styles.borderStyle !== 'none'
      ? item.styles.borderStyle
      : (parseFloat(item.styles?.borderWidth) > 0
          ? 'solid'
          : 'none'),

  borderRadius: item.styles?.borderRadius !== undefined
    ? `${parseFloat(item.styles.borderRadius)}px`
    : "6px",

  opacity: item.styles?.opacity !== undefined
    ? parseFloat(item.styles.opacity)
    : 1,

  padding: item.styles?.padding || "0px",

  cursor: state.isPreviewMode
    ? (item.action?.payload ? "pointer" : "default")
    : (isSelected ? "move" : "pointer"),

  pointerEvents: "auto",
  position: "relative"
}}        onClick={(e) => {
          e.stopPropagation();
          if (state.isPreviewMode) {
            if (item.action?.type === 'submit_form') {
              if (!isFormVisible) setIsFormVisible(true);
              else handleSubmitForm(section.id, item.action);
            } else {
              handleItemAction(item);
            }
          }
        }}
      >
        {!item.isEditing && !state.isPreviewMode && (
          <div 
            style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'move' }} 
            onDoubleClick={(e) => { 
              e.stopPropagation(); 
              store.updateItem(state.activePageId, section.id, item.id, { isEditing: true }); 
            }} 
          />
        )}

        <span 
          id={`button-text-${item.id}`}
          contentEditable={item.isEditing}
          suppressContentEditableWarning
          onBlur={(e) => { 
            store.updateItem(state.activePageId, section.id, item.id, { text: e.target.innerText, isEditing: false }); 
          }}
          style={{ 
            color: hoverStyles.color || item.textStyles?.color || item.styles?.color || "#ffffff", 
            fontSize: item.textStyles?.fontSize || item.styles?.fontSize || "16px", 
            fontFamily: item.textStyles?.fontFamily || "inherit", 
            fontWeight: item.textStyles?.fontWeight || "normal",
            fontStyle: item.textStyles?.fontStyle || "normal",
            textDecoration: item.textStyles?.textDecoration || "none",
            letterSpacing: item.textStyles?.letterSpacing || "normal",
            textAlign: item.textStyles?.textAlign || "center",
            pointerEvents: item.isEditing ? "auto" : "none", 
            userSelect: "text", 
            lineHeight: "1.2", 
            outline: "none",
            width: "100%",
            zIndex: 2, 
            display: "inline-block",
            wordBreak: "break-word",
            ...(item.textStyles?.color && item.textStyles.color.includes('gradient') ? {
              backgroundImage: item.textStyles.color,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              MozBackgroundClip: 'text',
              MozTextFillColor: 'transparent',
            } : {})
          }}
        >
          {item.text || "Button"}
        </span>
      </div>
    )}
  </HoverWrapper>
)}

{item.type === 'link' && (() => {
  const isColorGradient = item.styles?.color && item.styles.color.includes('gradient');
  const shadowBlur = item.styles?.blur !== undefined ? `${item.styles.blur}px` : "2px";
  const shadowColor = item.styles?.shadowColor || "rgba(0, 0, 0, 0.5)";
  const hasTextShadow = item.styles?.shadowColor || parseInt(item.styles?.blur) > 0;

  const { 
    color: itemColor, 
    fontSize: itemFontSize, 
    textDecoration: itemDecoration, 
    fontFamily, fontWeight, fontStyle, letterSpacing, textAlign,
    ...containerStyles 
  } = item.styles || {};

  return (
    <HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
     {({ computedStyle, hoverStyles }) => (
        <a
          href={item.action?.url || "#"} 
          target="_blank" 
          rel="noopener noreferrer" 
          contentEditable={isSelected && !state.isPreviewMode} 
          suppressContentEditableWarning 
          onDoubleClick={handleDoubleClick}
          onBlur={(e) => { updateItem(activePageId, section.id, item.id, { text: e.target.innerText }); }}
          onClick={(e) => { if (!state.isPreviewMode && !e.ctrlKey) e.preventDefault(); }}
          
          style={{ 
            width: "100%", 
            height: "100%", 
            cursor: state.isPreviewMode ? "pointer" : "text", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            outline: "none", 
            userSelect: state.isPreviewMode ? "none" : "text", 
            pointerEvents: "auto", 
            filter: cleanFilter, 
            
            background: item.styles?.background || "none",
            backgroundColor: item.styles?.background ? "transparent" : (hoverStyles.backgroundColor || item.styles?.backgroundColor || "transparent"),
            opacity: item.styles?.opacity !== undefined ? parseFloat(item.styles.opacity) : 1,

            borderWidth: item.styles?.borderWidth !== undefined ? `${parseFloat(item.styles.borderWidth)}px` : '0px',
            borderColor: item.styles?.borderColor || "transparent",
            borderStyle: item.styles?.borderStyle && item.styles.borderStyle !== 'none'
              ? item.styles.borderStyle
              : (parseFloat(item.styles?.borderWidth) > 0 ? 'solid' : 'none'),
            borderRadius: item.styles?.borderRadius !== undefined ? `${parseFloat(item.styles.borderRadius)}px` : "0px", 
 ...computedStyle,
            ...containerStyles, 
          
            boxShadow: "none",
          }}
        >
          <span
            style={{
              width: "auto",
              display: "inline-block",
              lineHeight: "1.2",
              wordBreak: "break-word",

              fontSize: itemFontSize ? itemFontSize : "16px",
              fontFamily: fontFamily || "inherit",
              fontWeight: fontWeight || "normal",
              fontStyle: fontStyle || "normal",
              textDecoration: itemDecoration ? itemDecoration : "underline", 
              letterSpacing: letterSpacing || "normal",
              textAlign: textAlign || "center",
              
              color: hoverStyles.color || (isColorGradient ? "transparent" : (itemColor || "inherit")),

              textShadow: hasTextShadow ? `2px 2px ${shadowBlur} ${shadowColor}` : "none",

              ...(isColorGradient ? {
                backgroundImage: itemColor,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                MozBackgroundClip: 'text',
                MozTextFillColor: 'transparent',
              } : {})
            }}
          >
            {item.text || "Link Text"}
          </span>
        </a>
      )}
    </HoverWrapper>
  );
})()}

{item.type === 'input' && (() => {
  return (
    <HoverWrapper item={item} isPreviewMode={state.isPreviewMode}>
     {({ computedStyle, hoverStyles }) => (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>
          
          <div style={{ 
            position: 'absolute', 
            top: '-20px', 
            left: '4px', 
            fontSize: item.styles?.labelFontSize ? item.styles.labelFontSize : "12px", 
            color: item.styles?.labelColor && !item.styles.labelColor.includes('gradient') ? item.styles.labelColor : "#4f46e5", 
            fontWeight: "600",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10
          }}>
            {item.name ? item.name : "Field Label"}
          </div>

          <input 
            id={`input-${item.id}`} 
            type={item.inputType || "text"} 
            placeholder={item.placeholder ? item.placeholder : "Enter text..."} 
            disabled={!state.isPreviewMode} 
            style={{ 
              width: "100%", 
              height: "100%", 
              boxSizing: "border-box", 
              margin: 0,
              padding: "0 10px", 
              border: item.styles?.border || "1px solid #cbd5e1", 
              borderRadius: item.styles?.borderRadius || "6px",
              outline: "none",
              fontSize: item.styles?.fontSize || "14px",
              pointerEvents: state.isPreviewMode ? "auto" : "none",
               ...computedStyle,
              background: item.styles?.background || "transparent",
              backgroundColor: hoverStyles.backgroundColor || item.styles?.backgroundColor || "#ffffff",
              color: hoverStyles.color || item.styles?.color || "#1e293b",
            
            }} 
          />
        </div>
      )}
    </HoverWrapper>
  );
})()}

 </div>
        </React.Fragment>
      );
    })}

{validTargets.length > 0 && !state.isPreviewMode && !isSelecting && (
    <Moveable
    target={validTargets.length === 1 ? validTargets[0] : validTargets}
    draggable={true}
    resizable={true}
    origin={false}
    zoom={1 / canvasScale}
    throttleDrag={0}
    throttleResize={0}
    renderDirections={validTargets.length > 1 ? ["nw", "ne", "sw", "se"] : ["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
    keepRatio={false}
    useResizeObserver={true}
    useMutationObserver={true}
    snappable={true}
    snapThreshold={5}
    snapGap={true}
    snapElement={true}
    snapVertical={true}
    snapHorizontal={true}
    snapCenter={true}
    verticalGuidelines={[(document.querySelector(".section-container")?.offsetWidth || 0) / 2]}
    horizontalGuidelines={[(document.querySelector(".section-container")?.offsetHeight || 0) / 2]}
    snapContainer={document.querySelector("#main-canvas")}
    elementGuidelines={[
        document.querySelector("#main-canvas"),
        ...Array.from(document.querySelectorAll(".canvas-element")) 
    ].filter(Boolean)}    
    portalContainer={sectionRef.current}
    isDisplaySnapDigit={false} 
    isDisplayInnerSnapDigit={false}

    onDrag={({ target, left, top }) => {
      if (target.classList.contains('section-container')) {
        target.style.top = `${top}px`;
      } else {
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
      }
    }}
    onDragEnd={({ target, lastEvent }) => {
      if (!lastEvent) return;
      if (target.classList.contains('section-container')) {
        updateSection(target.id, { styles: { ...section.styles, top: lastEvent.top } });
      } else {
        updateItem(activePageId, section.id, target.id, { x: lastEvent.left, y: lastEvent.top });
      }
    }}

    onResize={({ target, width, height, drag }) => {
      if (target.classList.contains('section-container')) {
        target.style.height = `${height}px`;
      } else {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.left = `${drag.left}px`;
        target.style.top = `${drag.top}px`;
      }
    }}
    onResizeEnd={({ target, lastEvent }) => {
      if (!lastEvent) return;
      if (target.classList.contains('section-container')) {
        if (store.updateSectionHeight) {
          store.updateSectionHeight(target.id, lastEvent.height);
        } else {
          updateSection(target.id, { height: lastEvent.height });
        }
      } else {
        updateItem(activePageId, section.id, target.id, {
          width: lastEvent.width,
          height: lastEvent.height,
          x: lastEvent.drag.left,
          y: lastEvent.drag.top
        });
      }
    }}

    onDragGroup={({ events }) => {
        events.forEach(({ target, left, top }) => {
            target.style.left = `${left}px`;
            target.style.top = `${top}px`;
        });
    }}
    onDragGroupEnd={({ events }) => {
        events.forEach(({ target }) => {
            store.updateItem(activePageId, section.id, target.id, { 
                x: parseFloat(target.style.left) || 0, 
                y: parseFloat(target.style.top) || 0
            });
        });
    }}

    onResizeGroup={({ events }) => {
        events.forEach(({ target, width, height, drag }) => {
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.left = `${drag.left}px`;
            target.style.top = `${drag.top}px`;
        });
    }}
    onResizeGroupEnd={({ events }) => {
        events.forEach(({ target }) => {
            store.updateItem(activePageId, section.id, target.id, {
                width: parseFloat(target.style.width) || 100,
                height: parseFloat(target.style.height) || 100,
                x: parseFloat(target.style.left) || 0,
                y: parseFloat(target.style.top) || 0
            });
        });
    }}
  />
)}  

<Selecto
  container={document.querySelector("#main-canvas")}
  dragContainer={document.querySelector("#main-canvas")}
  rootContainer={document.querySelector("#main-canvas")}
  portalContainer={document.querySelector("#main-canvas")}

  selectableTargets={[".canvas-element"]}

  hitRate={0}
  selectByClick={false}
  selectFromInside={false}
  preventDragFromInside={true}
  checkInput={false}

  toggleContinueSelect={["shift"]}

  onDragStart={(e) => {
    const t = e.inputEvent.target;

    if (
      t.closest(".moveable-control-box") ||
      t.closest(".section-toolbar")
    ) {
      e.stop();
      return;
    }

    if (t.closest(".canvas-element")) {
      // مهم: لا توقف دائمًا هنا
      // خلّي اللاسو يشتغل حتى لو ضغط داخل عنصر
      return;
    }

    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;

    e.datas.offset = [
      rect.left + window.scrollX,
      rect.top + window.scrollY
    ];
  }}

  onSelect={(e) => {
    const ids = e.selected.map(el => el.id);

    store.selectItems(ids);

    store.setState(prev => ({
      ...prev,
      selectionGroupMode: ids.length > 1
    }));
  }}
/>
</div>
  );
}

const styles = {
  sectionToolbar: {
    position: 'absolute',
    top: '-35px',
    left: '10px',
    display: 'flex',
    gap: '5px',
    background: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    zIndex: 1000
  },
  toolBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};