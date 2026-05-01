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

  store.addItemAtPosition(state.draggingType, x, y, section.id);
  
  store.setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
}}   
style={{
  position: "relative",
  width: "100%",
  ...section.styles,
  height: isMobile ? "auto" : (section.height ? `${section.height}px` : "auto"),
  minHeight: section.height ? `${section.height}px` : "50px",  
  
  // تعديل: إذا كان السكشن "blank" نجعله شفافاً تماماً
  backgroundColor: section.type === "blank" ? "transparent" : (section.styles?.backgroundColor || "#ffffff"),
  
  zIndex: allSections.length - sectionIndex,
  overflow: "visible", 
  display: isMobile ? "flex" : "block",
  flexDirection: "column",
  paddingBottom: isMobile ? "50px" : "0px",
  backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
  
  // تحسين: جعل الحدود أقل إزعاجاً بصرياً
  borderBottom: isSectionSelected ? "2px solid #4f46e5" : "1px solid rgba(204, 204, 204, 0.3)",
}}
    > 
     {isSectionSelected && (
  <div style={styles.sectionToolbar}>
    <button onClick={() => store.moveSectionUp(section.id)} style={styles.toolBtn}>🔼</button>
    <button onClick={() => store.moveSectionDown(section.id)} style={styles.toolBtn}>🔽</button>
    <button onClick={() => deleteSection(section.id)} style={{...styles.toolBtn, color: 'red'}}>
       <Trash2 size={14} />
    </button>
  </div>
)}

{section.data.items?.map((item,index) => {
const isSelected = (state.selectedElementIds || []).includes(item.id) || (state.selected || []).includes(item.id); 
const leftPercent = (item.x / BASE_WIDTH) * 100;
  const widthPercent = (item.width / BASE_WIDTH) * 100;
const isMobileOrTablet = window.innerWidth < 1024;  
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
position: isMobileOrTablet ? "relative" : "absolute",
          left: isMobileOrTablet ? "0" : `${(item.x / BASE_WIDTH) * 100}%`,
          width: isMobileOrTablet ? "90%" : `${(item.width / BASE_WIDTH) * 100}%`,
          top: isMobileOrTablet ? "auto" : `${item.y}px`,
          height: isMobileOrTablet ? "auto" : `${item.height}px`,  marginBottom: isMobile ? "20px" : "0", 
  transform: 'translate(0, 0)',
zIndex: isSelected ? 9999 : (2000 + index), 
 margin: isMobileOrTablet ? "15px auto" : "0", 
          display: isMobileOrTablet ? "block" : "initial",
            cursor: item.isEditing ? "text" : "move",
          overflow: "visible",
          pointerEvents: "auto",
          willChange: "left, top, width, height",
          ...item.styles, 
        }}
      >

{isSelected && !item.isEditing && (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              deleteElement(item.id);
            }}
            style={{
              position: "absolute",
              top: "-35px", // يظهر فوق العنصر مباشرة
              right: "0px", // يلتصق بالزاوية اليمنى للعنصر
              background: "#ef4444",
              borderRadius: "50%",
              width: "26px",
              height: "26px",
              zIndex: 10001,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              pointerEvents: "auto",
            }}
          >
            <Trash2 size={14} color="white" />
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
    style={{ 
      width: "100%", 
      height: "100%", 
      backgroundColor: item.styles?.backgroundColor || "#4f46e5",
      clipPath: item.styles?.clipPath || "none",
      borderRadius: item.styles?.borderRadius || "0px",
      ...item.styles 
    }} 
  />
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

        
      </div>

      {isSelected && itemRefs.current[item.id] && !item.isEditing && (
        <>
         <Moveable
    target={itemRefs.current[item.id]}
    draggable={true}
    resizable={true}
    origin={false}
    throttleDrag={1} // تغيير بسيط لتقليل عدد العمليات
    throttleResize={1} 
    zoom={1 / canvasScale}
    className="element-moveable-tool"
    /* إضافة اتجاهات التحجيم لضمان الدقة */
    renderDirections={["nw","n","ne","w","e","sw","s","se"]} 
    
    onDrag={({ target, transform }) => {
        // التحريك باستخدام transform أسرع بمراحل من left/top في الأداء
        target.style.transform = transform;
    }}
    
    onDragEnd={({ target, lastEvent }) => {
        if (lastEvent) {
            updateItem(activePageId, section.id, item.id, {
                // استخراج القيم النهائية فقط عند الإفلات
                x: lastEvent.beforeDelta[0], 
                y: lastEvent.beforeDelta[1],
                transform: target.style.transform
            });
        }
    }}

    onResize={({ target, width, height, drag }) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.transform = drag.transform;
    }}
    
    onResizeEnd={({ target, lastEvent }) => {
        if (lastEvent) {
            updateItem(activePageId, section.id, item.id, {
                width: parseInt(target.style.width),
                height: parseInt(target.style.height),
                transform: target.style.transform
            });
        }
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
    keepRatio={false}
    renderDirections={["s"]} 
    origin={false}
    zoom={1 / canvasScale}
    edge={true} 
    onResize={({ target, height }) => {
      target.style.height = `${height}px`;
    }}
    onResizeEnd={({ target }) => {
      const newHeight = parseInt(target.style.height);
      updateSection(state.activePageId, section.id, { 
        ...section,
        height: newHeight 
      });
    }}
  />
)}
<style>{`
        /* --- 1. مقابض التحكم في العناصر (نص، صورة، زر) --- */
        .element-moveable-tool .moveable-line {
            border-top: 1px solid #4f46e5 !important; /* خط متصل أنيق */
            background: transparent !important;
        }
        
        .element-moveable-tool .moveable-control {
            width: 10px !important; 
            height: 10px !important;
            background: white !important;
            border: 2px solid #4f46e5 !important; /* حدود زرقاء عريضة قليلاً */
            border-radius: 50% !important; /* شكل دائري مثل تطبيقات التصميم العالمية */
            margin-top: -5px !important; 
            margin-left: -5px !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* --- 2. صندوق التحكم العام --- */
        .moveable-control-box {
            z-index: 9999 !important;
            background-color: transparent !important;
        }
        
        .moveable-control, .moveable-line {
            pointer-events: auto !important;
        }

        /* --- 3. أداة التحكم في ارتفاع السكشن (Section Resizer) --- */
        .section-resizer-tool .moveable-line { 
            display: none !important; 
        }
        
        .section-resizer-tool .moveable-control { 
            background: #4f46e5 !important; 
            opacity: 0.8; 
            height: 6px !important; 
            width: 50px !important; 
            border-radius: 10px !important;
            border: none !important;
        }

        /* --- 4. إدارة التفاعل مع الطبقات الشفافة --- */
        /* السكاشن الشفافة لا يجب أن تحجب ما خلفها إلا إذا كانت مختارة */
        .is-blank-layer { 
            pointer-events: none !important; 
        }
        
        /* السماح بالتفاعل مع العناصر داخل السكشن المختار فقط */
        .section-container.selected, 
        .section-container > *, 
        .text-element-wrapper, 
        .button-container-wrapper,
        .moveable-control-box {
            pointer-events: auto !important;
        }

        /* --- 5. تنسيقات المحتوى الداخلي --- */
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

        /* منع التداخل أثناء السحب */
        .moveable-control-box.dragging {
            pointer-events: none !important;
        }

        /* تحسين أداء السحب */
.moveable-target {
    will-change: transform, width, height;
    transition: none !important; /* مهم جداً: الانتقالات تبطئ السحب الفوري */
}

/* لضمان عدم تداخل الماوس مع أي شيء خلف العنصر أثناء السحب */
.moveable-control-box {
    pointer-events: none;
}
.moveable-control, .moveable-line {
    pointer-events: auto;
}
    `}</style>    </div>
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
  right: "-45px", // تقريب المسافة قليلاً
  top: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  zIndex: 10000, // التأكد من أنه فوق كل شيء
  background: "white",
  padding: "5px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: "1px solid #e2e8f0"
},
  toolBtn: {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  }
};