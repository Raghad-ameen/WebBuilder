import React, { useRef ,useState} from "react";
import { Trash2 ,Image as ImageIcon} from "lucide-react";
import Moveable from "react-moveable";
import SectionWrapper from "./SectionWrapper";
import CanvasElement from "./CanvasElement";

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store, canvasScale = 1 }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem,moveSectionUp, moveSectionDown } = store;
  const activePageId = state.activePageId; 
  const allSections = state.pages.find(p => p.id === activePageId)?.sections || [];
  const itemRefs = useRef({});
  const BASE_WIDTH = 1200;
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
const [targets, setTargets] = useState([]); // لإدارة العناصر المختارة والتجميع
  const getShapePath = (shapeType) => {
  const paths = {
    'triangle': "M50 0 L100 100 L0 100 Z",
    'circle': "M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0",
    'square': "M0 0 H100 V100 H0 Z",
    'rhombus': "M50 0 L100 50 L50 100 L0 50 Z"
  };
  return paths[shapeType] || paths['square'];
};
  const sectionIndex = state.pages
  .find(p => p.id === activePageId)
  .sections.findIndex(s => s.id === section.id);

React.useEffect(() => {
  const lastItem = section.data.items?.[section.data.items.length - 1];
  
  if (lastItem && selectedElementIds.length === 0) {
    const timer = setTimeout(() => {
      onSelect(lastItem.id);
    }, 50);
    return () => clearTimeout(timer);
  }
}, [section.data.items.length]); 

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

const formatAllStyles = (item) => {
  const s = item.styles || {};
  
  const filters = [];
  if (s.filterBlur) filters.push(`blur(${s.filterBlur}px)`);
  if (s.filterBrightness !== undefined) filters.push(`brightness(${s.filterBrightness}%)`);
  if (s.filterContrast !== undefined) filters.push(`contrast(${s.filterContrast}%)`);
  if (s.filterGrayscale !== undefined) filters.push(`grayscale(${s.filterGrayscale}%)`);

  const boxShadow = s.shadowColor 
    ? `${s.shadowX || 0}px ${s.shadowY || 0}px ${s.shadowBlur || 0}px ${s.shadowColor}` 
    : s.boxShadow;

  return {
    ...s,
    filter: filters.length > 0 ? filters.join(" ") : s.filter,
    boxShadow: boxShadow,
    fontSize: typeof s.fontSize === 'number' ? `${s.fontSize}px` : s.fontSize,
    letterSpacing: typeof s.letterSpacing === 'number' ? `${s.letterSpacing}px` : s.letterSpacing,
  };
};

  return (
    <div
      ref={sectionRef}
      className={`section-container section-${section.id} ${isBlank ? "is-blank-layer" : ""}`}
onMouseDown={(e) => {
  if (e.target === e.currentTarget || e.target.classList.contains('text-element-wrapper')) {
      e.stopPropagation();
      onSelect(section.id);
      store.selectItems([section.id]);
  }
}}
onMouseUp={(e) => {
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
  ...section.styles,
}}
    > 
    
    {/* Section Toolbar - يظهر فقط عند اختيار السكشن */}
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
)}{section.data.items?.map((item,index) => {
const isSelected = (state.selectedElementIds || []).includes(item.id) || (state.selected || []).includes(item.id); 
const leftPercent = (item.x / BASE_WIDTH) * 100;
  const widthPercent = (item.width / BASE_WIDTH) * 100;
const isMobileOrTablet = window.innerWidth < 1024;  
const { clipPath, ...otherStyles } = item.styles || {};


 return (
    <React.Fragment key={item.id}>
      <div
        ref={(el) => (itemRefs.current[item.id] = el)}
        id={item.id}
       onMouseDown={(e) => {
  if (item.isEditing) return;
  
  e.stopPropagation(); 
  onSelect(item.id);
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
    ref={(el) => (itemRefs.current[item.id] = el)} 
    style={{ 
      width: `${item.width}px`, 
      height: `${item.height}px`, 
      position: "absolute",
      top: `${item.y}px`, 
      left: `${item.x}px`,
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
              contentEditable={isSelected}
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

{isSelected && itemRefs.current[item.id] && !item.isEditing && !state.isPreviewMode && (
           <>
<Moveable
    target={itemRefs.current[item.id]}
    draggable={true}
    resizable={true}
    origin={false}
    zoom={1 / canvasScale}
    throttleDrag={0}
    throttleResize={0}
    renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
    
    snappable={true}
    snapThreshold={5}
    snapGap={true}
    snapElement={true}
    snapVertical={true}
    snapHorizontal={true}
    snapCenter={true}

    /* 🔥 الحل الديناميكي: حساب السنتر بناءً على حجم الكانفاس الحالي */
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
    portalContainer={document.body}
    isDisplaySnapDigit={false} 
    isDisplayInnerSnapDigit={false}

    onDrag={({ target, left, top }) => {
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
    }}

    onDragEnd={({ target }) => {
        updateItem(activePageId, section.id, item.id, { 
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
        updateItem(activePageId, section.id, item.id, {
            width: parseFloat(target.style.width),
            height: parseFloat(target.style.height),
            x: parseFloat(target.style.left),
            y: parseFloat(target.style.top)
        });
    }}
/>


</>
      )}
    </React.Fragment>
  );
})}

      {!state.isDraggingNow && isSectionSelected && (
<Moveable
    target={sectionRef} 
    resizable={true}
    draggable={true} 
    // التعديل: منع السحب من الحواف لترك المساحة للريسايز
    edgeDraggable={false} 
    // تأكدي من وجود واحدة فقط من هذه
    edge={false} 
    stopPropagation={true}
    keepRatio={false}
    throttleResize={1}
    renderDirections={["n", "nw", "ne", "s", "sw", "se", "w", "e"]}
    origin={false}
    zoom={1 / canvasScale}

    // السحب (Drag)
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

    // التحجيم (Resize) - الإصلاح هنا
    onResizeStart={({ setOrigin, dragStart }) => {
        setOrigin(["%", "%"]);
        // تثبيت نقطة البداية لمنع القفز المفاجئ
        dragStart && dragStart.set(
            parseFloat(sectionRef.current.style.left || 0), 
            parseFloat(sectionRef.current.style.top || 0)
        );
    }}
    onResize={({ target, width, height, drag }) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        // استخدام translate بدلاً من الماتريكس أثناء الحركة لضمان الاستجابة
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
    }}
    onResizeEnd={({ target, lastEvent }) => {
        // تحديث نهائي لبيانات السكشن
        updateSection(state.activePageId, section.id, {
            styles: { 
                ...section.styles, 
                width: parseFloat(target.style.width),
                height: parseFloat(target.style.height),
                // نأخذ الإحداثيات الجديدة بناءً على ما توقفت عنده عملية التحجيم
                left: (section.styles.left || 0) + (lastEvent?.drag.beforeTranslate[0] || 0),
                top: (section.styles.top || 0) + (lastEvent?.drag.beforeTranslate[1] || 0),
            }
        });
        target.style.transform = "none"; 
    }}
/>

)}
<style>{`
    /* 1. إعدادات الكانفاس ومساحة العمل */
    #main-canvas {
        position: relative;
        overflow: hidden;
        transition: background-color 0.3s ease, transform 0.3s ease !important;
    }

    .main-canvas-area.snapping {
        cursor: crosshair;
    }

    /* 2. التحكم في التفاعل والطبقات */
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
        pointer-events: none !important; 
    }

    .moveable-target {
        will-change: transform, width, height;
        transition: none !important; 
    }

    .section-container * {
        backface-visibility: hidden;
        perspective: 1000;
    }

    /* 3. أدوات التحكم والمقابض والـ Toolbar */
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

    /* 4. تنسيق العناصر الداخلية */
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

    /* 5. نظام خطوط السناب والإرشاد (المعدل والمحسن) */

    /* إخفاء الأرقام والأبعاد */
    .moveable-snap-digit, 
    .moveable-snappable-dimension {
        display: none !important;
        opacity: 0 !important;
    }

    /* أ- خطوط المحاذاة العامة: أزرق منقط (Blue & Dashed) */
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

    /* ب- خطوط السنتر: أحمر منقط وطويل (Red & Dashed) - تم تقوية الاستهداف */
    /* العمودي (Center) */
    .moveable-control-box .moveable-line.moveable-guideline.moveable-vertical.moveable-center {
        border-left: 1px dashed #ff0000 !important;
        height: 10000px !important;
        top: -5000px !important;
        z-index: 9999999 !important;
        background: transparent !important;
    }

    /* الأفقي (Middle) */
    .moveable-control-box .moveable-line.moveable-guideline.moveable-horizontal.moveable-middle {
        border-top: 1px dashed #ff0000 !important;
        width: 10000px !important;
        left: -5000px !important;
        z-index: 9999999 !important;
        background: transparent !important;
    }

    /* تنسيق خط السناب الأساسي */
    .moveable-line.moveable-snap-line {
        background: transparent !important;
        border-top: 1px dashed #4f46e5 !important;
    }

    /* تنسيق خط تحديد العنصر الأساسي */
    .moveable-line.moveable-direction {
        background: transparent !important;
        border-top: 1px dashed #4f46e5 !important;
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
    top: "-50px", // يرفعها فوق السكشن
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