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
console.log(`🎨 RENDERING CHECK [${section.id}]:`, section.styles?.backgroundColor);
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
}}onMouseUp={(e) => {
  if (!state.isDraggingNow) return;
  e.stopPropagation();

  const rect = e.currentTarget.getBoundingClientRect();
  
  const x = (e.clientX - rect.left) / canvasScale;
  const y = (e.clientY - rect.top) / canvasScale;

  store.addItemAtPosition(state.draggingType, x, y, section.id);
  
  store.setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
}}   
style={{
 position: "relative",
  width: "100%",
  ...section.styles, 

zIndex: allSections.length - sectionIndex,
  overflow: "visible", 
  height: section.height ? `${section.height}px` : "auto",
  backgroundColor: section.styles?.backgroundColor || "transparent",
  display: "block",

  backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
borderBottom: isSectionSelected ? "3px dashed #4f46e5" : "1px dashed #cccccc",
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

{section.data.items?.map((item) => {
const isSelected = (state.selectedElementIds || []).includes(item.id) || (state.selected || []).includes(item.id);  return (
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
          position: "absolute",
         left: `${item.x}px`,   
        top: `${item.y}px`,   
        width: `${item.width}px`,
        height: `${item.height}px`,
        transform: 'translate(0, 0)',
zIndex: isSelected ? 9999 : 2000,
          cursor: item.isEditing ? "text" : "move",
          overflow: "visible",
          pointerEvents: "auto",
          willChange: "left, top, width, height",
          ...item.styles, 
        }}
      >
{item.type === 'text' && (
  <div 
    className="text-element-wrapper"
    style={{ 
      position: 'relative', 
      width: "100%", 
      height: "100%", 
      display: "flex",
      alignItems: item.styles?.alignItems || "center",
      justifyContent: 
        item.styles?.textAlign === 'right' ? 'flex-end' : 
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
        pointerEvents: "auto", 
        userSelect: "text", 
        WebkitUserSelect: "text",
        textAlign: item.styles?.textAlign || "left",
        lineHeight: item.styles?.lineHeight || "1.5", 
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
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
        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
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
            clipPath: item.styles?.clipPath || (
         item.shapeType === 'triangle' ? "polygon(50% 0%, 0% 100%, 100% 100%)" :
         item.shapeType === 'star' ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" :
         "none"
      ),
      
      borderRadius: item.shapeType === 'circle' ? "50%" : (item.styles?.borderRadius || "0px"),
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
            throttleDrag={1} 
            throttleResize={1} 
            zoom={1 / canvasScale}
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
     updateSection(state.activePageId, section.id, { 
        ...section,
        height: parseInt(target.style.height) 
      });
    }}
  />
)}
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
    z-index: 9999 !important;
    background-color: transparent !important;
}
    .section-container.is-selected {
    background-color: inherit !important;
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
        .is-blank-layer { 
    pointer-events: auto !important; 
}
   .section-container {
    pointer-events: auto !important;
}
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
 .text-element-wrapper, .button-container-wrapper {
    pointer-events: auto !important; 
}

.text-element-wrapper > div, .button-container-wrapper > span, img {
    pointer-events: auto !important;
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
    right: "-50px", 
    top: "0",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    zIndex: 3000,
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