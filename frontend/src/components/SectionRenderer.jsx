import React, { useRef ,useState,useEffect} from "react";
import { Trash2 ,Image as ImageIcon} from "lucide-react";
import Moveable from "react-moveable";
import SectionWrapper from "./SectionWrapper";
import CanvasElement from "./CanvasElement";
import Selecto from "react-selecto";
import "./SectionRenderer.css"; 

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
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [targets, setTargets] = useState([]); 
  const validTargets = targets.filter(Boolean);

  const [interactionMode, setInteractionMode] = useState("select"); 

  const getShapePath = (shapeType) => {
    const paths = {
      'triangle': "M50 0 L100 100 L0 100 Z",
      'circle': "M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0",
      'square': "M0 0 H100 V100 H0 Z",
      'rect': "M0 0 H100 V100 H0 Z",
      'rhombus': "M50 0 L100 50 L50 100 L0 50 Z"
    };
    return paths[shapeType] || paths['square'];
  };
  const activePage = state.pages.find(p => p.id === activePageId);

  const sectionIndex = activePage?.sections?.findIndex(s => s.id === section.id) ?? 0;

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

  const handleSubmitForm = (sectionId, action) => {
    if (!state.isPreviewMode) return;

    const formFields = section.data.items.filter(item => item.type === 'input');
    const formData = {};
    formFields.forEach(field => {
      const inputEl = document.getElementById(`input-${field.id}`);
      if (inputEl) {
        const label = field.placeholder || field.name || field.id;
        formData[label] = inputEl.value;
      }
    });

    if (Object.keys(formData).length === 0) {
      alert("No fields to submit!");
      return;
    }

    console.log("Submit to:", action.payload); 
    console.log("Data:", formData);
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
        if (section.isGhost) return;
        if (state.isPreviewMode) return;

        if (
          e.target.closest('.canvas-element') || 
          e.target.closest('.trash-button-class') || 
          e.target.closest('.section-toolbar') ||
          e.target.closest('.moveable-control-box')
        ) {
          return;
        }

        e.stopPropagation();

        if (!section.isGhost) {
          store.setState(prev => ({
            ...prev,
            selectedSectionId: section.id,
            selectedElementIds: [],
            selectionGroupMode: false
          }));
        }
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
        let detectedShapeType = state.draggingType;

        if (state.draggingType === "shape") {
          shapeStyles = {
            backgroundColor: state.draggingShapeData?.styles?.backgroundColor || "#4f46e5",
            clipPath: state.draggingShapeData?.styles?.clipPath || "none",
            borderRadius: state.draggingShapeData?.styles?.borderRadius || "0px"
          };
          
          if (state.draggingShapeData?.shapeType) {
            detectedShapeType = state.draggingShapeData.shapeType;
          } else {
            const cleanClip = shapeStyles.clipPath.replace(/\s+/g, '').toLowerCase();
            if (cleanClip.includes("polygon(50%0%") || cleanClip.includes("50%0")) detectedShapeType = "triangle";
            else if (shapeStyles.borderRadius === "50%") detectedShapeType = "circle";
            else if (cleanClip.includes("50%100%")) detectedShapeType = "rhombus";
            else detectedShapeType = "square";
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
          draggingType: null
        }));
      }}

      style={{
        position: section.styles?.position ?? "relative",
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

        zIndex: allSections.length - sectionIndex,

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
      ? "flex" 
      : (isPartOfForm ? (isFormVisible ? "flex" : "none") : (isMobileOrTablet ? "block" : "block")))
  : "block", 
              cursor: item.isEditing ? "text" : "move",
              overflow: "visible",
              pointerEvents: "auto",
              willChange: "left, top, width, height",
              backfaceVisibility: 'hidden',
              perspective: 1000,
              WebkitFontSmoothing: 'antialiased',

              boxShadow: "none",
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
  );
})()}


{item.type === 'image' && (
  <div 
    style={{ 
      ...item.styles, 
      width: "100%", 
      height: "100%", 
      overflow: "hidden", 
      position: "relative", 
      display: "flex", 
      alignItems: "center", 
      justify: "center", 
      backgroundColor: item.src ? "transparent" : (item.styles?.backgroundColor || "#f8fafc"), 
      border: item.src ? "none" : "1px dashed #cbd5e1", 
      borderRadius: item.styles?.borderRadius || "8px", 
      zIndex: isSelected ? 2000 : 100, 
      filter: cleanFilter, 
      boxShadow: item.styles?.boxShadow || "none" 
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
{item.type === 'shape' && (() => {
  const currentShape = item.shapeType || (item.styles?.clipPath?.includes("polygon") ? "triangle" : "square");
  
  const hasGradient = item.styles?.background && item.styles.background.includes('gradient');

  return (
    <div key={item.id} style={{ 
      width: "100%", 
      height: "100%", 
      overflow: "visible", 
      clipPath: item.styles?.clipPath || "none", 
      borderRadius: item.styles?.borderRadius || "0px",
      filter: cleanFilter, 
      boxShadow: item.styles?.boxShadow || "none", 
      background: hasGradient ? item.styles.background : "none",
      backgroundColor: hasGradient ? "transparent" : (item.styles?.backgroundColor || "#4f46e5")
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
        <path 
          d={getShapePath(currentShape)} 
          fill={hasGradient ? "transparent" : (item.styles?.backgroundColor || "#4f46e5")} 
          stroke={item.styles?.borderColor || "transparent"} 
          strokeWidth={item.styles?.borderWidth || 0} 
        />
      </svg>
    </div>
  );
})()}
{item.type === 'button' && (
  <div
    className="button-container-wrapper"
    style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: item.styles?.textAlign === 'right' ? 'flex-end' : 
                       item.styles?.textAlign === 'left' ? 'flex-start' : 'center', 
      filter: cleanFilter, 
      boxShadow: item.styles?.boxShadow || "none", 
      
      // 1. تمرير ستايلات الخلفية والألوان الأساسية
      background: item.styles?.background || "none",
      backgroundColor: item.styles?.background ? "transparent" : (item.styles?.backgroundColor || "#4f46e5"),
      
      // 2. معالجة وحقن لغز الحدود (Border Width & Style)
      borderWidth: item.styles?.borderWidth !== undefined ? `${parseFloat(item.styles.borderWidth)}px` : '0px',
      borderColor: item.styles?.borderColor || "transparent",
      borderStyle: item.styles?.borderStyle && item.styles.borderStyle !== 'none'
        ? item.styles.borderStyle
        : (parseFloat(item.styles?.borderWidth) > 0 ? 'solid' : 'none'),
        
      // 3. معالجة وتأمين الـ borderRadius والـ Opacity
      borderRadius: item.styles?.borderRadius !== undefined ? `${parseFloat(item.styles.borderRadius)}px` : "6px", 
      opacity: item.styles?.opacity !== undefined ? parseFloat(item.styles.opacity) : 1,
      
      // 4. دمج باقي الستايلات لضمان عدم سقوط أي قيمة أخرى
      ...item.styles,
      
      padding: item.styles?.padding || "0px", 
      transition: "background-color 0.2s, opacity 0.1s", 
      cursor: state.isPreviewMode ? (item.action?.payload ? "pointer" : "default") : (isSelected ? "move" : "pointer"), 
      pointerEvents: "auto",
      position: "relative"
    }}
    onMouseEnter={(e) => { 
      if (!isSelected && item.hoverStyles?.backgroundColor) e.currentTarget.style.backgroundColor = item.hoverStyles.backgroundColor; 
    }}
    onMouseLeave={(e) => { 
      e.currentTarget.style.backgroundColor = item.styles?.backgroundColor || "#4f46e5"; 
    }}
    onClick={(e) => {
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
        style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'move' }} 
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
        color: item.textStyles?.color || "white", 
        fontSize: item.textStyles?.fontSize || "16px", 
        fontFamily: item.textStyles?.fontFamily || "inherit", 
        fontWeight: item.textStyles?.fontWeight || "normal",
        fontStyle: item.textStyles?.fontStyle || "normal",
        textDecoration: item.textStyles?.textDecoration || "none",
        letterSpacing: item.textStyles?.letterSpacing || "normal",
        textAlign: item.textStyles?.textAlign || "center",
        
        pointerEvents: item.isEditing ? "auto" : "none", 
        userSelect: state.isPreviewMode ? "none" : "text", 
        lineHeight: "1.2", 
        outline: "none",
        width: "100%",
        zIndex: 5,
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
           
{item.type === 'link' && (() => {
  // 1. تجهيز منطق الجراديانت والظل للنص الداخلي للرابط
  const isColorGradient = item.styles?.color && item.styles.color.includes('gradient');
  const shadowBlur = item.styles?.blur !== undefined ? `${item.styles.blur}px` : "2px";
  const shadowColor = item.styles?.shadowColor || "rgba(0, 0, 0, 0.5)";
  const hasTextShadow = item.styles?.shadowColor || parseInt(item.styles?.blur) > 0;

  // 2. تفكيك كائن الـ styles وعزل خصائص النصوص لمنع التضارب
  const { 
    color: itemColor, 
    fontSize: itemFontSize, 
    textDecoration: itemDecoration, 
    fontFamily, fontWeight, fontStyle, letterSpacing, textAlign,
    ...containerStyles 
  } = item.styles || {};

  return (
    <a
      href={item.action?.url || "#"} 
      target="_blank" 
      rel="noopener noreferrer" 
      contentEditable={isSelected && !state.isPreviewMode} 
      suppressContentEditableWarning 
      onDoubleClick={handleDoubleClick}
      onBlur={(e) => { updateItem(activePageId, section.id, item.id, { text: e.target.innerText }); }}
      onClick={(e) => { if (!state.isPreviewMode && !e.ctrlKey) e.preventDefault(); }}
      
      // الحاوية الخارجية: مسؤولة عن التموضع، الأبعاد، الحدود، والشفافية
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
        backgroundColor: item.styles?.background ? "transparent" : (item.styles?.backgroundColor || "transparent"),
        opacity: item.styles?.opacity !== undefined ? parseFloat(item.styles.opacity) : 1,

        // التحكم الكامل بالحدود والدوران
        borderWidth: item.styles?.borderWidth !== undefined ? `${parseFloat(item.styles.borderWidth)}px` : '0px',
        borderColor: item.styles?.borderColor || "transparent",
        borderStyle: item.styles?.borderStyle && item.styles.borderStyle !== 'none'
          ? item.styles.borderStyle
          : (parseFloat(item.styles?.borderWidth) > 0 ? 'solid' : 'none'),
        borderRadius: item.styles?.borderRadius !== undefined ? `${parseFloat(item.styles.borderRadius)}px` : "0px", 

        // دمج باقي الستايلات الآمنة فقط (الأبعاد والمكان) بعد تصفيتها من الألوان
        ...containerStyles, 
        boxShadow: "none",
      }}
    >
      {/* الوسم الداخلي: إجبار المتصفح على تطبيق اللون والحجم باستخدام تمييز النص الصريح */}
      <span
        style={{
          width: "auto",
          display: "inline-block",
          lineHeight: "1.2",
          wordBreak: "break-word",

          // تطبيق خصائص الخط والـ Decoration واللون الأساسي (Solid) بدقة
          fontSize: itemFontSize ? itemFontSize : "16px",
          fontFamily: fontFamily || "inherit",
          fontWeight: fontWeight || "normal",
          fontStyle: fontStyle || "normal",
          textDecoration: itemDecoration ? itemDecoration : "underline", 
          letterSpacing: letterSpacing || "normal",
          textAlign: textAlign || "center",
          color: isColorGradient ? "transparent" : (itemColor || "inherit"),

          // حل مشكلة الظل على الحروف
          textShadow: hasTextShadow ? `2px 2px ${shadowBlur} ${shadowColor}` : "none",

          // حل مشكلة الجراديانت للحروف
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
  );
})()}


      {item.type === 'input' && (
              <div style={{ width: '100%', height: '100%', filter: cleanFilter }}>
                <input id={`input-${item.id}`} type="text" placeholder={item.placeholder || "Enter text..."} disabled={!state.isPreviewMode} style={{ ...item.styles, width: "100%", height: "100%", outline: isSelected ? "2px solid #4f46e5" : "none", pointerEvents: state.isPreviewMode ? "auto" : "none" }} />
                {!state.isPreviewMode && ( <div style={{position: 'absolute', top: '-18px', fontSize: '10px', color: '#64748b'}}>Input Field ({item.name || 'no-name'})</div> )}
              </div>
            )}
          </div>
        </React.Fragment>
      );
    })}

    {validTargets.length > 0 && !state.isPreviewMode && (
      <>
        <Moveable
          target={validTargets.length === 1 ? validTargets[0] : validTargets}
          draggable={true}
          resizable={true}
          origin={false}
          zoom={1 / canvasScale}
          throttleDrag={0}
          throttleResize={0}
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
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
              ...Array.from(document.querySelectorAll(".section-container, .text-element-wrapper, .button-container-wrapper"))
          ]}    
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
                      x: parseFloat(target.style.left), 
                      y: parseFloat(target.style.top) 
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
                      width: parseFloat(target.style.width),
                      height: parseFloat(target.style.height),
                      x: parseFloat(target.style.left),
                      y: parseFloat(target.style.top),
                  });
              });
          }}
        />
      </>
    )}

    <Selecto
      dragContainer={sectionRef.current}
      portalContainer={document.body}
      rootContainer={sectionRef.current}
      selectableTargets={ interactionMode === "select" && !state.isPreviewMode ? [`.section-${section.id} .canvas-element`] : [] }
      hitRate={20}
      selectByClick={true}
      selectFromInside={true}
      toggleContinueSelect={["shift"]}
      container={document.querySelector("#main-canvas") || undefined}  
      scrollOptions={{ container: sectionRef.current, threshold: 30, throttleTime: 30 }}
      onDragStart={e => {
        if (e.inputEvent.target.closest(".moveable-control-box") || e.inputEvent.target.closest(".section-toolbar") || e.inputEvent.target.closest(".trash-button-class")) { 
          e.stop();
          return;
        }
        if (e.inputEvent.target.closest(".canvas-element")) {
          e.stop(); 
          return;
        }
        const rect = sectionRef.current.getBoundingClientRect();
        e.datas.offset = [rect.left, rect.top];
      }}
      onSelect={e => {
        const ids = e.selected.map(el => String(el.id));
        if (ids.length === 0 && state.selectedElementIds?.[0] === section.id) return;
        store.selectItems(ids);
      }}
    />
    </div>
  );
}

const styles = {
  deleteSectionBtn: { position: "absolute", right: 10, top: 10, zIndex: 2000, background: "#fee2e2", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 },
  deleteElementBtn: { position: "absolute", top: "-34px", right: "-4px", width: "24px", height: "24px", backgroundColor: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", pointerEvents: "auto", cursor: "pointer", zIndex: 2147483647, border: "2px solid white" },
  sectionToolbar: { position: "absolute", top: "-42px", left: "12px", display: "flex", gap: "4px", padding: "4px", backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)", zIndex: 1000000 },
  toolBtn: { width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", backgroundColor: "transparent", borderRadius: "4px", cursor: "pointer", transition: "background 0.2s", color: "#4b5563" },
};