import React,{useState} from "react";
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Layout, 
  Columns, 
  Smartphone, 
  CreditCard, 
  Plus, 
  Link as LinkIcon, 
  Trash2 ,
  Pencil,
  Circle, Triangle, Star, Hexagon, Diamond 
} from "lucide-react";



const SHAPE_LIBRARY = [
  { id: 'rect', label: 'Square', icon: <Square />, path: 'none', radius: '0px' },
  { id: 'circle', label: 'Circle', icon: <Circle />, path: 'none', radius: '50%' },
  { id: 'triangle', label: 'Triangle', icon: <Triangle />, path: 'polygon(50% 0%, 0% 100%, 100% 100%)', radius: '0px' },
  { id: 'pentagon', label: 'Pentagon', icon: <Hexagon />, path: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', radius: '0px' },
  { id: 'star', label: 'Star', icon: <Star />, path: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', radius: '0px' },
  { id: 'rhombus', label: 'Rhombus', icon: <Diamond />, path: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', radius: '0px' },
];

export default function LeftSidebar({ store }) {
const { addItemAtPosition, addSection, state, addPage, deletePage, renamePage, setState } = store;
const [isShapesOpen, setIsShapesOpen] = React.useState(false);
  const basicElements = [
    { id: 'text', label: 'Text', icon: <Type size={18} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={18} /> },
    { id: 'button', label: 'Button', icon: <CreditCard size={18} /> },
    { id: 'link', label: 'Link', icon: <LinkIcon size={18} /> },
  ];

  const sections = [
    { id: 'navbar', label: 'Navbar', icon: <Layout size={18} /> },
    { id: 'hero', label: 'Hero', icon: <Columns size={18} /> },
    { id: 'features', label: 'Features', icon: <Plus size={18} /> },
    { id: 'footer', label: 'Footer', icon: <Smartphone size={18} /> },
  ];
const handleAddShape = (shape) => {
  const activePage = state.pages.find(p => p.id === state.activePageId);
  const targetSectionId = activePage?.sections[0]?.id || null;

  if (!targetSectionId) return;

  addItemAtPosition("shape", 150, 150, targetSectionId, {
    shapeType: shape.id,
    width: 100,
    height: 100,
    styles: { 
      width: "100px",
      height: "100px",
      backgroundColor: "#4f46e5",
      clipPath: shape.path,    
      borderRadius: shape.radius, 
      position: "absolute",
      display: "block"
    }
  });

  setIsShapesOpen(false);
};

const handleElementClick = (type) => {
  const currentPage = state.pages.find(p => p.id === state.activePageId);
  
  if (!currentPage) {
    addPage("Main Page");
    return;
  }

  const targetSectionId = currentPage.sections[0]?.id || null;
  
 if (type === 'link') {
    addItemAtPosition(type, 150, 150, targetSectionId, {
      text: "Click here to visit",
      action: { url: 'https://www.google.com' },
      styles: {
        color: '#2563eb',
        textDecoration: 'underline',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    });
  } else {
    addItemAtPosition(type, 150, 150, targetSectionId);
  }
};

const handleStartDrag = (e, type) => {
    e.preventDefault();
    let draggingData = {};
  if (type === 'link') {
    draggingData = {
      text: "New Link",
      action: { url: 'https://www.google.com' },
      styles: { color: '#2563eb', textDecoration: 'underline' }
    };
  }
    setState(prev => ({ 
      ...prev, 
      isDraggingNow: true, 
      draggingType: type 
    }));
  };

  return (
    <div style={styles.sidebar}>
      <section style={styles.section}>
        <div style={styles.headerRow}>
           <h3 style={styles.sectionTitle}>Pages</h3>
           <button onClick={() => addPage("New Page")} style={styles.miniAddBtn}>
             <Plus size={14}/>
           </button>
        </div>
        
      <div style={styles.pagesList}>
  {state.pages.map((page, index) => (
<div 
  key={page.id} 
  onClick={() => setState(prev => ({ ...prev, activePageId: page.id }))}
  style={{
    ...styles.pageItem,
    backgroundColor: state.activePageId === page.id ? '#eff6ff' : 'transparent',
    color: state.activePageId === page.id ? '#3b82f6' : '#475569',
    borderColor: state.activePageId === page.id ? '#bfdbfe' : 'transparent'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
    <span style={{ fontSize: '10px', opacity: 0.5 }}>{index + 1}</span>
    
    <span style={{ flex: 1 }}>{page.name}</span>

    <button 
  className="action-icon"
  onClick={(e) => {
    e.stopPropagation();
    store.openModal("renamePage", { 
      pageId: page.id, 
      currentName: page.name 
    });
  }}
  style={styles.actionBtn}
>
  <Pencil size={12} />
</button>
  </div>
  
  <button 
    onClick={(e) => {
      e.stopPropagation(); 
      store.openModal("deletePage", { pageId: page.id });
    }}
    style={styles.trashBtn}
  >
    <Trash2 size={14} />
  </button>
</div>  ))}
</div>
      </section>

<section style={styles.section}>
  <h3 style={styles.sectionTitle}>Basic Elements</h3>
  <div style={styles.grid}>
    {basicElements.map((el) => (
      <button 
        key={el.id} 
        style={styles.elementBtn}
        onClick={() => handleElementClick(el.id)}
        onMouseDown={(e) => handleStartDrag(e, el.id)}
      >
        {el.icon}
        <span style={styles.label}>{el.label}</span>
      </button>
    ))}

    <div style={{ position: 'relative' }}>
      <button 
        style={{...styles.elementBtn, width: '100%'}} 
        onClick={() => setIsShapesOpen(!isShapesOpen)}
      >
        <Square size={18} />
        <span style={styles.label}>Shapes</span>
      </button>

      {isShapesOpen && (
        <div style={styles.shapesGridPopup}>
{SHAPE_LIBRARY.map(s => (
  <div 
    key={s.id} 
    style={styles.shapeIconItem} 
    onClick={(e) => {
      e.stopPropagation();
      handleAddShape(s);
    }}
    onMouseDown={(e) => {
      e.stopPropagation();
      // التعديل هنا: نمرر ستايلات الشكل بالكامل في draggingShapeData
      setState(prev => ({ 
        ...prev, 
        isDraggingNow: true, 
        draggingType: 'shape',
        draggingShapeData: {
          styles: {
            clipPath: s.path,
            borderRadius: s.radius,
            backgroundColor: "#4f46e5"
          }
        }
      }));
    }}
  >
    {s.icon}
    <span style={{fontSize: '10px'}}>{s.label}</span>
  </div>
))}        </div>
      )}
    </div>
  </div>
</section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Smart Sections</h3>
        <div style={styles.list}>
          {sections.map((sec) => (
            <button key={sec.id} onClick={() => addSection(sec.id)} style={styles.sectionBtn}>
              <div style={styles.iconBox}>{sec.icon}</div>
              <div style={styles.btnContent}>
                <span style={styles.btnTitle}>{sec.label}</span>
                <span style={styles.btnSub}>Click to add</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  sidebar: { width: "260px", background: "#fff", borderRight: "1px solid #e5e7eb", padding: "20px 12px", overflowY: "auto", height: "100vh", display: "flex", flexDirection: "column", gap: "24px" },
  section: { display: 'flex', flexDirection: 'column' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sectionTitle: { fontSize: "0.7rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" },
  pagesList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  pageItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', border: '1px solid transparent', transition: '0.2s' },
  miniAddBtn: { background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trashBtn: { background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  elementBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "12px 0", border: "1px solid #f1f5f9", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", transition: "0.2s" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  sectionBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid #f1f5f9", borderRadius: "10px", background: "#fff", cursor: "pointer", textAlign: 'left' },
  iconBox: { width: "36px", height: "36px", background: "#eff6ff", color: "#3b82f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  btnContent: { display: "flex", flexDirection: "column" },
  btnTitle: { fontSize: "0.85rem", fontWeight: "600", color: "#1e293b" },
  btnSub: { fontSize: "0.65rem", color: "#94a3b8" },
  label: { fontSize: "0.75rem", fontWeight: "500" },
  actionBtn: {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  opacity: 0.6, 
  transition: '0.2s',
},
shapesGridPopup: {
    position: 'fixed',
    top: '83%', 
    left: '5%', 
    transform: 'translateY(-50%)',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '15px',
    width: '240px', 
    zIndex: 100000, 
},
  shapeIconItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    gap: '4px',
    transition: '0.2s',
    border: '1px solid transparent',
    ':hover': { background: '#f8fafc', borderColor: '#e2e8f0' }
  }
};