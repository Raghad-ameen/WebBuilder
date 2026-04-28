import React, { useRef } from "react";
import { Trash2 } from "lucide-react";
import Moveable from "react-moveable";

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem } = store;
  const itemRefs = useRef({});
  const sectionRef = useRef(null);
  // أضيفي useEffect في بداية المكون (بعد الـ useRefs مباشرة)
React.useEffect(() => {
  // إذا كان هناك عناصر ولكن لا يوجد شيء محدد، أو أضيف عنصر جديد
  const lastItem = section.data.items?.[section.data.items.length - 1];
  
  if (lastItem && selectedElementIds.length === 0) {
    // ننتظر ميلي ثانية واحدة لضمان أن الـ DOM أصبح جاهزاً
    const timer = setTimeout(() => {
      onSelect(lastItem.id);
    }, 50);
    return () => clearTimeout(timer);
  }
}, [section.data.items.length]); // يعمل فقط عند تغير عدد العناصر
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
      {/* زر حذف السكشن */}
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
              // الحل السحري للتأخير: استخدمي onMouseDown للتحديد بدلاً من onClick
              onMouseDown={(e) => {
                e.stopPropagation();
                // التحديد هنا يكون أسرع بـ 300ms من الـ onClick
                if (!isSelected) {
                    onSelect(item.id);
                }
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
                ...item.styles,
              }}
            >
              {item.type === 'text' && (
                <span style={{ pointerEvents: "none", display: "block", ...item.styles }}>
                  {item.text}
                </span>
              )}
            </div>

            {isSelected && itemRefs.current[item.id] && (
              <>
                <Moveable
                  target={itemRefs.current[item.id]}
                  draggable={true}
                  resizable={true}
                  origin={false}
                  className="element-moveable-tool"
                  // لمنع أي تعليق في البداية
                  edgeDraggable={false}
                  onDrag={({ target, left, top }) => {
                    target.style.left = `${left}px`;
                    target.style.top = `${top}px`;
                    previewUpdateItem(state.activePageId, section.id, item.id, { x: left, y: top });
                  }}
                  onDragEnd={({ target }) => {
                    updateItem(state.activePageId, section.id, item.id, {
                      x: parseInt(target.style.left),
                      y: parseInt(target.style.top)
                    });
                  }}
                  onResize={({ target, width, height, drag }) => {
                    target.style.width = `${width}px`;
                    target.style.height = `${height}px`;
                    target.style.left = `${drag.left}px`;
                    target.style.top = `${drag.top}px`;
                    previewUpdateItem(state.activePageId, section.id, item.id, {
                      width, height, x: drag.left, y: drag.top
                    });
                  }}
                />
                
                {/* زر حذف العنصر - معدل ليكون مستجيباً جداً */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteElement(item.id);
                  }}
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
        /* تنسيق الخط المقطع */
        .element-moveable-tool .moveable-line {
            border-top: 1px dashed #4f46e5 !important;
            background: transparent !important;
        }

        /* تنسيق المقابض: مربعة، أصغر، وموزونة */
        .element-moveable-tool .moveable-control {
            width: 6px !important; 
            height: 6px !important;
            background: white !important;
            border: 1px solid #4f46e5 !important;
            border-radius: 0% !important; /* تجعلها مربعة */
            margin-top: -3px !important; /* لنصف العرض لضمان السنترة */
            margin-left: -3px !important;
        }

        /* منع تأخير الماوس */
        .moveable-control-box {
            pointer-events: none !important;
        }
        .moveable-control, .moveable-line {
            pointer-events: auto !important;
        }

        /* تنسيق أداة السكشن */
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