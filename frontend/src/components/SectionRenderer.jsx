import React, { useRef ,useState,useEffect} from "react";
import { Trash2 ,Image as ImageIcon} from "lucide-react";
import Moveable from "react-moveable";
import SectionWrapper from "./SectionWrapper";
import CanvasElement from "./CanvasElement";
import Selecto from "react-selecto";

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store, canvasScale = 1 }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem,moveSectionUp, moveSectionDown } = store;
  const activePageId = state.activePageId; 
  const allSections = state.pages.find(p => p.id === activePageId)?.sections || [];
  const itemRefs = useRef({});
  const BASE_WIDTH = 1200;
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
const [targets, setTargets] = useState([]); 
const [interactionMode, setInteractionMode] = useState("select"); 

  const getShapePath = (shapeType) => {
  const paths = {
    'triangle': "M50 0 L100 100 L0 100 Z",
    'circle': "M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0",
    'square': "M0 0 H100 V100 H0 Z",
    'rhombus': "M50 0 L100 50 L50 100 L0 50 Z"
  };
  return paths[shapeType] || paths['square'];
};
 const activePage = state.pages.find(p => p.id === activePageId);

const sectionIndex =
  activePage?.sections?.findIndex(s => s.id === section.id) ?? 0;

React.useEffect(() => {
  const lastItem = section.data.items?.[section.data.items.length - 1];
  
  if (lastItem && selectedElementIds.length === 0) {
    const timer = setTimeout(() => {
      onSelect(lastItem.id);
    }, 50);
    return () => clearTimeout(timer);
  }
}, [section.data.items, selectedElementIds, onSelect]);

const handleDoubleClick = (e) => {
  e.stopPropagation();
  const range = document.createRange();
  range.selectNodeContents(e.target);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};
  const isBlank = section.type === "blank";
const isSectionSelected = (state.selectedElementIds || []).includes(section.id);
const hasSelectedChild = section.data.items.some(it => selectedElementIds.includes(it.id));
const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

useEffect(() => {
  if (state.activeGroupId) {
    const group = activePage?.groups?.find(
      g => g.id === state.activeGroupId
    );

    if (group) {
      setTargets(
        group.elementIds.map(id => itemRefs.current[id]).filter(Boolean)
      );
      return;
    }
  }

  if (selectedElementIds.length > 0) {
    const selectedItems = selectedElementIds
      .map(id => itemRefs.current[id])
      .filter(Boolean);

    setTargets(selectedItems);
  } else {
    setTargets([]);
  }
}, [selectedElementIds, state.activeGroupId]);
  return (
    <div
      ref={sectionRef}
className={`section-container selecto-area section-${section.id} ${isBlank ? "is-blank-layer" : ""}`}
onMouseDown={(e) => {
  const clickedEmpty = e.target === e.currentTarget;

  if (clickedEmpty) {
    store.selectItems([]);
    store.setState(prev => ({
      ...prev,
      selectionGroupMode: false
    }));
  }
}}onMouseUp={(e) => {
    if (!state.isDraggingNow) return;
    e.stopPropagation();

    const rect = sectionRef.current.getBoundingClientRect(); 
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const defaultWidth = 150;
    const defaultHeight = 150;

    store.addItemAtPosition(state.draggingType, x, y, section.id, {
        width: defaultWidth,
        height: defaultHeight,
        styles: state.draggingType === 'shape' ? { clipPath: "inset(0% 0% 0% 0%)" } : {}
    });
    
    store.setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
}}

style={{
  position: section.styles?.position || "relative", 
  left: section.styles?.left || 0,
  top: section.styles?.top || 0,
  width: section.styles?.width || "100%",

  height: isMobile ? "auto" : (section.height ? `${section.height}px` : "auto"),
  minHeight: section.height ? `${section.height}px` : "50px",  
  
backgroundColor: section.styles?.backgroundColor || "transparent",  
  zIndex: allSections.length - sectionIndex,
  overflow: "visible", 
  display: isMobile ? "flex" : "block",
  flexDirection: "column",
  
  backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
  
  borderBottom: isSectionSelected ? "2px solid #4f46e5" : "1px solid rgba(204, 204, 204, 0.3)",
  pointerEvents: "auto",
  ...section.styles,
}}
    > 
    
{isSectionSelected && !state.isPreviewMode && (
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

{section.data.items?.map((item,index) => {
const selectedIds = state.selectedElementIds || [];
const activePage = state.pages?.find(p => p.id === state.activePageId);

const isGroupedSelected =
  activePage?.groups?.some(g =>
    selectedIds.every(id => g.elementIds.includes(id)) &&
    g.elementIds.includes(item.id)
  );

const isSelected = selectedIds.includes(item.id);
  const widthPercent = (item.width / BASE_WIDTH) * 100;
const isMobileOrTablet =
  typeof window !== "undefined" && window.innerWidth < 1024;
  const { clipPath, ...otherStyles } = item.styles || {};


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
        
        const currentSelected = Array.isArray(state.selectedElementIds) 
            ? state.selectedElementIds.map(String) 
            : [];
        
        const targetId = String(item.id);
        let newSelection;

        if (currentSelected.includes(targetId)) {
            newSelection = currentSelected.filter(id => id !== targetId);
        } else {
            newSelection = [...currentSelected, targetId];
        }

      store.selectItems(newSelection);

store.setState(prev => ({
  ...prev,
  selectionGroupMode: newSelection.length > 1
}));
        return;
    }

    if (!e.ctrlKey && !e.metaKey) {
    e.stopPropagation();
}

    onSelect(item.id);
    store.selectItems([String(item.id)]);
}}


onMouseUp={() => {
    setInteractionMode("select");
}}

style={{
position: (section.type === 'navbar' || isMobileOrTablet) ? "relative" : "absolute",
    left: (section.type === 'navbar' || isMobileOrTablet) ? "auto" : `${item.x}px`, 
    top: (section.type === 'navbar' || isMobileOrTablet) ? "auto" : `${item.y}px`,
    width: isMobileOrTablet ? "90%" : `${item.width}px`,
    height: isMobileOrTablet ? "auto" : `${item.height}px`,
    zIndex: isSelected ? 100000 : (2000 + index),
    margin: isMobileOrTablet ? "15px auto" : "0", 
    display: isMobileOrTablet ? "block" : "initial",
    cursor: item.isEditing ? "text" : "move",
    overflow: "visible",
    pointerEvents: "auto",
    willChange: "left, top, width, height",
    transform: 'translate(0, 0)', 
    backfaceVisibility: 'hidden',
    perspective: 1000,
    WebkitFontSmoothing: 'antialiased',
}}
      >




{isSelected && !item.isEditing && !state.isPreviewMode && (
      <div
      onMouseDown={(e) => {
 
        e.stopPropagation();
        e.preventDefault();
        deleteElement(item.id);
      }}
      style={{
        position: "absolute",
        top: "-35px",
        right: "-10px",
        width: "28px",
        height: "28px",
        backgroundColor: "#ef4444",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 9999999,
        pointerEvents: "auto",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        border: "2px solid white",
      }}
    >
      <Trash2 size={14} color="white" strokeWidth={3} />
    </div>
  )}

{item.type === 'text' && (
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
        store.updateItem(state.activePageId, section.id, item.id, { 
          text: e.target.innerText, 
          isEditing: false 
        });
      }}
      style={{
       width: "100%", 
        outline: "none",
        zIndex: 5,
        fontSize: isMobile ? `clamp(12px, 4vw, 18px)` : (item.styles?.fontSize || "16px"),
        textAlign: item.styles?.textAlign || "left",
        lineHeight: "1.2", 
        wordBreak: "break-word", 
        overflowWrap: "anywhere",
        whiteSpace: "normal", 
        ...item.styles,
      }}
    >
      {item.text || "Type your text..."}
    </div>
  </div>
)}
       {item.type === 'image' && (
  <div 
    style={{ 
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
      ...item.styles 
    
    }}
  >

    {item.src ? (
      <img 
        src={item.src} 
        style={{ width: "100%", height: "100%", objectFit: "cover",maxWidth: "100%" }} 
        alt="Uploaded content"
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
              reader.onload = (e) => {
                updateItem(activePageId, section.id, item.id, { 
                  src: e.target.result 
                });
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          gap: "8px",
          color: "#64748b",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <div>
          <span style={{ fontSize: "20px", fontWeight: "bold", lineHeight: 1 }}>+</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "500" }}>add image</span>
      </div>
    )}
  </div>
)}

{item.type === 'shape' && (
  <div 
    key={item.id}
    style={{ 
      width: `${item.width}px`, 
      height: `${item.height}px`, 
      overflow: "visible",
      zIndex: item.styles?.zIndex || 100,
    }}
  >
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <path 
        d={getShapePath(item.shapeType)}
        fill={item.styles?.backgroundColor || "#4f46e5"}
        stroke={item.styles?.borderColor || "transparent"}
        strokeWidth={item.styles?.borderWidth || 0}
      />
    </svg>
  </div>
)}


{item.type === 'button' && (
          <div
            className="button-container-wrapper"
            style={{
              width: "100%", height: "100%",
      display: "flex",          
      alignItems: "center",
      justifyContent: "center",
              backgroundColor: item.styles?.backgroundColor || "#4f46e5",
              borderRadius: item.styles?.borderRadius || "6px",
              transition: "background-color 0.2s",
              cursor: isSelected ? "move" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isSelected && item.hoverStyles?.backgroundColor) {
                e.currentTarget.style.backgroundColor = item.hoverStyles.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = item.styles?.backgroundColor || "#4f46e5";
            }}
            onClick={() => {
              if (!isSelected && item.action?.url) window.open(item.action.url, '_blank');
            }}
          >
            <span
             contentEditable={item.isEditing}
              onDoubleClick={handleDoubleClick} 
              suppressContentEditableWarning
              onBlur={(e) => updateItem(activePageId, section.id, item.id, { text: e.target.innerText })}
              style={{
                color: item.styles?.color || "white",
                fontSize: item.styles?.fontSize || "16px",
                fontFamily: item.styles?.fontFamily || "inherit", 
                pointerEvents: "auto",
                userSelect: isSelected ? "text" : "none", 
                cursor: isSelected ? "text" : "move",
                lineHeight: "1",
                outline: "none" 
              }}
            >
              {item.text || "Button"}
            </span>
          </div>
        )}

{item.type === 'link' && (
  <a
    href={item.action?.url || "#"} 
    target="_blank"
    rel="noopener noreferrer"
    contentEditable={isSelected && !state.isPreviewMode}
    suppressContentEditableWarning
    onDoubleClick={handleDoubleClick}
    onBlur={(e) => {
      updateItem(activePageId, section.id, item.id, { text: e.target.innerText });
    }}
    onClick={(e) => {
      if (!state.isPreviewMode) {
        if (!e.ctrlKey) {
          e.preventDefault();
        }
      }
    }}
    style={{
      ...item.styles,
      width: "100%",
      height: "100%",
      cursor: state.isPreviewMode ? "pointer" : "text",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "underline",
      color: item.styles?.color || "inherit",
      outline: "none",
      userSelect: state.isPreviewMode ? "none" : "text",
      pointerEvents: "auto", 
    }}
  >
    {item.text || "Link Text"}
  </a>
)}            
      </div>

    </React.Fragment>
  );
})}

{targets.length > 0 && !state.isPreviewMode && (
               <>
<Moveable
target={targets.length === 1 ? targets[0] : targets}
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
   verticalGuidelines={[
       (document.querySelector(".section-container")?.offsetWidth || 0) / 2
    ]}
    horizontalGuidelines={[
       (document.querySelector(".section-container")?.offsetHeight || 0) / 2
    ]}
    snapContainer={document.querySelector("#main-canvas")}
    elementGuidelines={[
        document.querySelector("#main-canvas"),
        ...Array.from(document.querySelectorAll(".section-container, .text-element-wrapper, .button-container-wrapper"))
    ]}    
portalContainer={sectionRef.current}
    isDisplaySnapDigit={false} 
    isDisplayInnerSnapDigit={false}

    onDrag={({ target, left, top }) => {
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
    }}

   onDragEnd={({ target }) => {
    if (Array.isArray(target)) return;

    updateItem(activePageId, section.id, target.id, {
        x: parseFloat(target.style.left),
        y: parseFloat(target.style.top)
    });
}}

    onResize={({ target, width, height, drag }) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.left = `${drag.left}px`;
        target.style.top = `${drag.top}px`;
    }}

    onResizeEnd={({ target }) => {
        updateItem(activePageId, section.id, target.id, {
            width: parseFloat(target.style.width),
            height: parseFloat(target.style.height),
            x: parseFloat(target.style.left),
            y: parseFloat(target.style.top)
        });
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


      {!state.isDraggingNow && isSectionSelected && (
<Moveable
    target={sectionRef} 
    resizable={true}
    draggable={true} 
    edgeDraggable={false} 
    edge={false} 
    stopPropagation={true}
    keepRatio={false}
    throttleResize={1}
    renderDirections={["n", "nw", "ne", "s", "sw", "se", "w", "e"]}
    origin={false}
    zoom={1 / canvasScale}
    onDrag={({ target, left, top }) => {
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
    }}
    onDragEnd={({ target }) => {
        updateSection(state.activePageId, section.id, { 
            styles: { 
                ...section.styles, 
                left: parseFloat(target.style.left), 
                top: parseFloat(target.style.top), 
                position: 'absolute' 
            } 
        });
    }}

    onResizeStart={({ setOrigin, dragStart }) => {
        setOrigin(["%", "%"]);
        dragStart && dragStart.set(
            parseFloat(sectionRef.current.style.left || 0), 
            parseFloat(sectionRef.current.style.top || 0)
        );
    }}
    onResize={({ target, width, height, drag }) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
    }}
    onResizeEnd={({ target, lastEvent }) => {
        updateSection(state.activePageId, section.id, {
            styles: { 
                ...section.styles, 
                width: parseFloat(target.style.width),
                height: parseFloat(target.style.height),
                left: (section.styles.left || 0) + (lastEvent?.drag.beforeTranslate[0] || 0),
                top: (section.styles.top || 0) + (lastEvent?.drag.beforeTranslate[1] || 0),
            }
        });
        target.style.transform = "none"; 
    }}
/>

)}

<Selecto
 container={document.body}
  dragContainer={sectionRef.current}
  rootContainer={document.body}
  selectableTargets={
  interactionMode === "select"
    ? [".canvas-element"]
    : []
}
  hitRate={0}
  selectByClick={false}
  selectFromInside={false}
  preventDragFromInside={true}
  
onDragStart={e => {
  if (e.inputEvent.target.closest(".moveable-control-box")) {
    e.stop();
    return;
  }

  if (e.inputEvent.target.closest(".canvas-element")) {
    e.stop(); // مهم: يمنع اللاسو عند تحريك عنصر
    return;
  }

  const rect = sectionRef.current.getBoundingClientRect();
  e.datas.offset = [rect.left, rect.top];
}}

onDrag={(e) => {
    const box = document.querySelector(".selecto-selection");

    
  }}
  
  onSelect={e => {
    const ids = e.selected.map(el => String(el.id));
    store.selectItems(ids);
  }}
/>

<style>{`
    #main-canvas {
        position: relative;
        overflow: hidden;
        transition: background-color 0.3s ease, transform 0.3s ease !important;
    }

    .main-canvas-area.snapping {
        cursor: crosshair;
    }



.section-container {
    position: relative !important; /* ضروري جداً ليعمل المربع داخله بدقة */
    pointer-events: auto !important;
    overflow: visible !important; /* للسماح للمربع بالتحرك بحرية */
}
    

.section-container.selected, 
    .section-container > *, 
    .text-element-wrapper, 
    .button-container-wrapper {
        pointer-events: auto !important;
       
    }

    .section-container[style*="position: absolute"] {
        cursor: move !important;
    }

    .is-blank-layer { 
        pointer-events: auto !important; 
    }

    .moveable-target {
        will-change: transform, width, height;
        transition: none !important; 
    }

    .section-container * {
        backface-visibility: hidden;
        perspective: 1000;
    }

    [style*="sectionToolbar"] {
        pointer-events: auto !important;
        z-index: 1000001 !important;
    }

    [style*="toolBtn"] {
        pointer-events: auto !important;
        cursor: pointer !important;
    }

    .element-moveable-tool {
        z-index: 1000000 !important;
    }

    .section-resizer-tool .moveable-control { 
        background: #4f46e5 !important; 
        opacity: 0.8; 
        height: 6px !important; 
        width: 50px !important; 
        border-radius: 10px !important;
        border: none !important;
    }

    .button-container-wrapper {
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        overflow: hidden;
    }

    .text-element-wrapper > div, 
    .button-container-wrapper > span, 
    img {
        pointer-events: auto !important;
    }

    .moveable-control {
        background: #ffffff !important;
        border: 2px solid #4f46e5 !important;
        width: 12px !important;
        height: 12px !important;
        border-radius: 50% !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    }

    .moveable-control-box {
        z-index: 2147483647 !important;
    }

    .moveable-snap-digit, 
    .moveable-snappable-dimension {
        display: none !important;
        opacity: 0 !important;
    }

    .moveable-control-box .moveable-line.moveable-guideline {
        background: transparent !important;
        display: block !important;
        opacity: 1 !important;
    }

    .moveable-control-box .moveable-line.moveable-guideline.moveable-vertical {
        border-left: 1px dashed #4f46e5 !important;
        width: 1px !important;
    }

    .moveable-control-box .moveable-line.moveable-guideline.moveable-horizontal {
        border-top: 1px dashed #4f46e5 !important;
        height: 1px !important;
    }

    .moveable-control-box .moveable-line.moveable-guideline.moveable-vertical.moveable-center {
        border-left: 1px dashed #ff0000 !important;
        height: 10000px !important;
        top: -5000px !important;
        z-index: 9999999 !important;
        background: transparent !important;
    }

    .moveable-control-box .moveable-line.moveable-guideline.moveable-horizontal.moveable-middle {
        border-top: 1px dashed #ff0000 !important;
        width: 10000px !important;
        left: -5000px !important;
        z-index: 9999999 !important;
        background: transparent !important;
    }

    .moveable-line.moveable-snap-line {
        background: transparent !important;
        border-top: 1px dashed #4f46e5 !important;
    }

    .moveable-line.moveable-direction {
        background: transparent !important;
        border-top: 1px dashed #4f46e5 !important;
    }


.selecto-selection {
    background: rgba(66,133,244,.25) !important;
    border: 1px solid #4285f4 !important;
    z-index: 2147483647 !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: none !important;
    will-change: transform;
}
/* لمنع ظهور النقطة المزعجة في الزاوية قبل السحب */
.selecto-selection:not([style*="width"]) {
    display: none !important;
}

`}</style>

</div>
  );
}

const styles = {
  deleteSectionBtn: { position: "absolute", right: 10, top: 10, zIndex: 2000, background: "#fee2e2", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 },
  deleteElementBtn: { 
    position: "absolute", background: "#ef4444", borderRadius: "50%", 
    width: 22, height: 22, zIndex: 9999, cursor: "pointer", 
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)", pointerEvents: "auto"
  },
sectionToolbar: {
    position: "absolute",
    top: "-50px", 
    left: "0",
    display: "flex",
    gap: "4px",
    padding: "6px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
    zIndex: 1000000,
},
toolBtn: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.2s",
    color: "#4b5563",
},

};