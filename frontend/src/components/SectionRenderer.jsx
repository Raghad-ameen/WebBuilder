import React, { useRef ,useState} from "react";
import { Trash2 ,Image as ImageIcon} from "lucide-react";
import Moveable from "react-moveable";

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem } = store;
  const activePageId = state.activePageId; 
  const itemRefs = useRef({});
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
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
  // تحديد النص بالكامل
  const range = document.createRange();
  range.selectNodeContents(e.target);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};
  const isBlank = section.type === "blank";

  return (
    <div
      ref={sectionRef}
      className={`section-container ${isBlank ? "is-blank-layer" : ""}`}
      style={{
        position: isBlank ? "absolute" : "relative",
        width: "100%",
        height: section.data?.styles?.height || (isBlank ? "100%" : "auto"),
        minHeight: isBlank ? 0 : 400,
        backgroundColor: isBlank ? "transparent" : (section.data?.styles?.backgroundColor || "transparent"),
        borderBottom: isBlank ? "none" : "1px dashed #ddd",
        overflow: "visible",
        pointerEvents: "auto",
        zIndex: isBlank ? 10 : 1,
      }}
    >
      {!isBlank && (
        <button
          onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
          style={styles.deleteSectionBtn}
        >
          <Trash2 size={14} />
        </button>
      )}

{section.data.items?.map((item) => {
  const isSelected = selectedElementIds.includes(item.id);
  
  return (
    <React.Fragment key={item.id}>
      <div
        ref={(el) => (itemRefs.current[item.id] = el)}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!isSelected) onSelect(item.id);
        }}
        style={{
          position: "absolute",
          left: item.x,
          top: item.y,  
          width: item.width,
          height: item.height,
          zIndex: isSelected ? 2000 : 150,
          cursor: "move",
          pointerEvents: "auto",
          willChange: "left, top, width, height",
          ...item.styles, // هنا يتم تطبيق الستايلات القادمة من المتجر (مثل clipPath للأشكال)
        }}
      >
        {/* --- بداية الدمج: رندرة الأنواع المختلفة --- */}

        {/* 1. رندرة النصوص */}
        {item.type === 'text' && (
          <div
            contentEditable={isSelected}
            onDoubleClick={handleDoubleClick} // إضافة التحديد الأزرق
            suppressContentEditableWarning
            onBlur={(e) => updateItem(activePageId, section.id, item.id, { text: e.target.innerText })}
            style={{
              width: "100%",
              height: "100%",
              outline: "none",
              cursor: isSelected ? "text" : "move", // يظهر حرف I عند الاختيار للتعديل
      display: "grid",     
      placeItems: "center",      // تمركز أفقي وعمودي بكلمة واحدة              // لضبط المحاذاة
      alignItems: "center",              // محاذاة عمودية
      justifyContent: "center",  
      textAlign: "center",        // محاذاة أفقية (اختياري حسب رغبتك)
      lineHeight: "1.5 !important",                 // لضبط المسافات بين الأسطر
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",    // للحفاظ على المسافات والأسطر
              ...item.styles,
              display: "grid !important" // التأكيد على النوع
            }}
          >
            {item.text || "Type your text..."}
          </div>
        )}

        {/* 2. رندرة الصور */}
        {item.type === 'image' && (
          <div style={{ width: "100%", height: "100%", overflow: "hidden", ...item.styles }}>
            {item.src ? (
              <img src={item.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
                 <ImageIcon size={24} />
              </div>
            )}
          </div>
        )}

        {/* 3. رندرة الأشكال (التي تستخدم clipPath) */}
        {item.type === 'shape' && (
          <div 
            style={{ 
              width: "100%", 
              height: "100%", 
              backgroundColor: item.styles?.backgroundColor || "#4f46e5",
              ...item.styles 
            }} 
          />
        )}

        {/* 4. رندرة الأزرار (كودك الأصلي كما هو) */}
        {item.type === 'button' && (
          <div
            className="button-container-wrapper"
            style={{
              width: "100%", height: "100%",
      display: "flex",           // ضروري جداً للمحاذاة
      alignItems: "center",
      justifyContent: "center",
              backgroundColor: item.styles?.backgroundColor || "#4f46e5",
              borderRadius: item.styles?.borderRadius || "6px",
              transition: "background-color 0.2s",
              cursor: isSelected ? "move" : "pointer",
            }}
            onMouseEnter={(e) => {
              console.log("Mouse Entered!"); 
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
              onDoubleClick={handleDoubleClick} // إضافة التحديد الأزرق
              suppressContentEditableWarning
              onBlur={(e) => updateItem(activePageId, section.id, item.id, { text: e.target.innerText })}
              style={{
                color: item.styles?.color || "white",
                fontSize: item.styles?.fontSize || "16px",
                pointerEvents: "auto",
                userSelect: "none",
                lineHeight: "1"
              }}
            >
              {item.text || "Button"}
            </span>
          </div>
        )}
        
        {/* --- نهاية الدمج --- */}
      </div>

      {/* منطق الـ Moveable وزر الحذف الخاص بك (بدون أي تغيير) */}
      {isSelected && itemRefs.current[item.id] && (
        <>
          <Moveable
            target={itemRefs.current[item.id]}
            draggable={true}
            resizable={true}
            origin={false}
            throttleDrag={1} 
            throttleResize={1} 
            className="element-moveable-tool"
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`;
              target.style.top = `${top}px`;
            }}
            onDragEnd={({ target }) => {
              updateItem(activePageId, section.id, item.id, {
                x: parseInt(target.style.left),
                y: parseInt(target.style.top)
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
                width: parseInt(target.style.width),
                height: parseInt(target.style.height),
                x: parseInt(target.style.left),
                y: parseInt(target.style.top)
              });
            }}
          />
          <div
            onMouseDown={(e) => { e.stopPropagation(); deleteElement(item.id); }}
            style={{
              ...styles.deleteElementBtn,
              left: item.x + item.width - 10,
              top: item.y - 15,
            }}
          >
            <Trash2 size={12} color="white" />
          </div>
        </>
      )}
    </React.Fragment>
  );
})}

      <Moveable
        target={sectionRef.current}
        resizable={true}
        renderDirections={["s"]}
        className="section-resizer-tool"
        onResize={({ target, height }) => {
          target.style.height = `${height}px`;
          updateSection(section.id, { styles: { height } });
        }}
      />

    <style>{`
        .element-moveable-tool .moveable-line {
            border-top: 1px dashed #4f46e5 !important;
            background: transparent !important;
        }
        .element-moveable-tool .moveable-control {
            width: 6px !important; 
            height: 6px !important;
            background: white !important;
            border: 1px solid #4f46e5 !important;
            border-radius: 0% !important; 
            margin-top: -3px !important; 
            margin-left: -3px !important;
        }
        .moveable-control-box {
            pointer-events: none !important;
        }
        .moveable-control, .moveable-line {
            pointer-events: auto !important;
        }

        .section-resizer-tool .moveable-line { display: none !important; }
        .section-resizer-tool .moveable-control { 
          background: #4f46e5 !important; 
          opacity: 0.5; 
          height: 4px !important; 
          width: 40px !important; 
          border-radius: 2px !important;
        }
        .is-blank-layer { pointer-events: none !important; }
        .is-blank-layer > div { pointer-events: auto !important; }
.button-container-wrapper {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}
.moveable-control-box.dragging {
    pointer-events: none !important;
}
    .button-container-wrapper {
    box-sizing: border-box !important;
    overflow: hidden;
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
};