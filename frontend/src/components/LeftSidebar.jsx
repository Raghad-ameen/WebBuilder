import React, { useState, useEffect, useCallback } from "react";
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
  Trash2,
  Pencil,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Diamond,
  Layers, 
  Shapes,
  Grid2X2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const SHAPE_LIBRARY = [
  { id: "rect", label: "Square", icon: <Square size={20} />, path: "none", radius: "0px" },
  { id: "circle", label: "Circle", icon: <Circle size={20} />, path: "none", radius: "50%" },
  { id: "triangle", label: "Triangle", icon: <Triangle size={20} />, path: "polygon(50% 0%, 0% 100%, 100% 100%)", radius: "0px" },
  { id: "pentagon", label: "Pentagon", icon: <Hexagon size={20} />, path: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", radius: "0px" },
  { id: "star", label: "Star", icon: <Star size={20} />, path: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)", radius: "0px" },
  { id: "rhombus", label: "Rhombus", icon: <Diamond size={20} />, path: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", radius: "0px" }
];

export default function LeftSidebar({ store }) {
  const { addItemAtPosition, addSection, state, addPage, deletePage, renamePage, setState } = store;

  const [activeTab, useState_activeTab] = useState("elements"); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const basicElements = [
    { id: "text", label: "Text", icon: <Type size={18} /> },
    { id: "image", label: "Image", icon: <ImageIcon size={18} /> },
    { id: "button", label: "Button", icon: <CreditCard size={18} /> },
    { id: "link", label: "Link", icon: <LinkIcon size={18} /> },
    { id: "input", label: "Input Field", icon: <Layout size={18} /> }
  ];

  const sections = [
    { id: "navbar", label: "Navbar", icon: <Layout size={18} /> },
    { id: "hero", label: "Hero", icon: <Columns size={18} /> },
    { id: "feature-grid", label: "Features", icon: <Plus size={18} /> },
    { id: "footer", label: "Footer", icon: <Smartphone size={18} /> }
  ];

  const handleTabClick = (tabId) => {
    if (activeTab === tabId && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveTab(tabId);
      setIsDrawerOpen(true);
    }
  };

  const handleAddShape = (shape) => {
    const activePage = state.pages.find((p) => p.id === state.activePageId);
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
  };

const handleElementClick = (type) => {
    const currentPage = state.pages.find((p) => p.id === state.activePageId);
    if (!currentPage) {
      addPage("Main Page");
      return;
    }
    const targetSectionId = currentPage.sections[0]?.id || null;
    if (!targetSectionId) return;

    if (type === "link") {
      addItemAtPosition(type, 150, 150, targetSectionId, {
        forceAdd: true,
        text: "Click here to visit",
        styles: { color: "#2563eb", textDecoration: "underline" }
      });
    } 
    else if (type === "table") {
      addItemAtPosition(type, 150, 150, targetSectionId, {
        forceAdd: true,
        headers: ["المادة", "الكمية", "السعر"],
        rows: [
          ["منتج أ", "10", "$50"],
          ["منتج ب", "5", "$25"],
          ["منتج ج", "8", "$40"]
        ]
      });
    } 
    else if (type === "chart") {
      addItemAtPosition(type, 150, 150, targetSectionId, {
        forceAdd: true,
        data: [
          { name: "سبتمبر", uv: 400 },
          { name: "أكتوبر", uv: 700 },
          { name: "نوفمبر", uv: 500 }
        ]
      });
    } 
    else if (type === "animation") {
      addItemAtPosition(type, 150, 150, targetSectionId, {
        forceAdd: true,
        animationJson: null, 
        styles: { width: "150px", height: "150px" }
      });
    } 
    else if (type === "form-group") {
      addItemAtPosition(type, 150, 150, targetSectionId, {
        forceAdd: true,
        fields: ["الاسم الكامل", "البريد الإلكتروني", "نص الرسالة"]
      });
    } 
    else {
      addItemAtPosition(type, 150, 150, targetSectionId, { forceAdd: true });
    }
  };
  
  const handleStartDrag = (e, type) => {
  setState((prev) => ({
    ...prev,
    isDraggingNow: true,
    draggingType: type,
    draggingShapeData: null
  }));
};

  const setActiveTab = (tab) => {
    useState_activeTab(tab);
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconStrip}>
        <button style={{ ...styles.stripBtn, color: activeTab === 'pages' && isDrawerOpen ? '#4f46e5' : '#475569' }} onClick={() => handleTabClick('pages')}>
          <Layers size={20} />
          <span style={styles.stripLabel}>Pages</span>
        </button>
        <button style={{ ...styles.stripBtn, color: activeTab === 'elements' && isDrawerOpen ? '#4f46e5' : '#475569' }} onClick={() => handleTabClick('elements')}>
          <Grid2X2 size={20} />
          <span style={styles.stripLabel}>Elements</span>
        </button>
        <button style={{ ...styles.stripBtn, color: activeTab === 'shapes' && isDrawerOpen ? '#4f46e5' : '#475569' }} onClick={() => handleTabClick('shapes')}>
          <Shapes size={20} />
          <span style={styles.stripLabel}>Shapes</span>
        </button>
        <button style={{ ...styles.stripBtn, color: activeTab === 'sections' && isDrawerOpen ? '#4f46e5' : '#475569' }} onClick={() => handleTabClick('sections')}>
          <Plus size={20} />
          <span style={styles.stripLabel}>Sections</span>
        </button>
        {/* 🛠️ أضيفي هذه الأزرار داخل حاوية الـ iconStrip تحت زر الـ Sections مباشرة */}
<button 
  style={{ ...styles.stripBtn, color: activeTab === 'data-visual' && isDrawerOpen ? '#4f46e5' : '#475569' }} 
  onClick={() => handleTabClick('data-visual')}
>
  <Grid2X2 size={20} /> {/* أو أيقونة BarChart3 إذا حبيتي تستوردينها */}
  <span style={styles.stripLabel}>Data</span>
</button>

<button 
  style={{ ...styles.stripBtn, color: activeTab === 'advanced' && isDrawerOpen ? '#4f46e5' : '#475569' }} 
  onClick={() => handleTabClick('advanced')}
>
  <Star size={20} />
  <span style={styles.stripLabel}>Graphics</span>
</button>
      </div>

      <div style={{ ...styles.drawer, width: isDrawerOpen ? "300px" : "0px", borderRight: isDrawerOpen ? "1px solid #e2e8f0" : "none" }}>
        {isDrawerOpen && (
          <div style={styles.drawerContent}>
            <div style={styles.drawerHeader}>
              <h3 style={styles.drawerTitle}>
                {activeTab === 'pages' && "Manage Pages"}
                {activeTab === 'elements' && "Basic Elements"}
                {activeTab === 'shapes' && "Shape Library"}
                {activeTab === 'sections' && "Smart Sections"}
                {activeTab === 'data-visual' && "Charts & Tables"}
  {activeTab === 'advanced' && "Animations & Forms"}
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} style={styles.closeDrawerBtn}>
                <X size={16} />
              </button>
            </div>

            {activeTab === 'pages' && (
              <section style={styles.section}>
                <div style={styles.headerRow}>
                  <span style={styles.sectionTitle}>Your Pages</span>
                  <button onClick={() => addPage("New Page")} style={styles.miniAddBtn}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={styles.pagesList}>
                  {state.pages.map((page, index) => (
                    <div
                      key={page.id}
                      onClick={() => setState((prev) => ({ ...prev, activePageId: page.id }))}
                      style={{
                        ...styles.pageItem,
                        backgroundColor: state.activePageId === page.id ? "#eff6ff" : "transparent",
                        color: state.activePageId === page.id ? "#3b82f6" : "#475569",
                        borderColor: state.activePageId === page.id ? "#bfdbfe" : "transparent"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                        <span style={{ fontSize: "10px", opacity: 0.5 }}>{index + 1}</span>
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); store.openModal("renamePage", { pageId: page.id, currentName: page.name }); }} style={styles.actionBtn}>
                          <Pencil size={12} />
                        </button>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); store.openModal("deletePage", { pageId: page.id }); }} style={styles.trashBtn}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'elements' && (
              <section style={styles.section}>
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
                </div>
              </section>
            )}

            {activeTab === 'shapes' && (
              <section style={styles.section}>
                <div style={styles.shapesGrid}>
                  {SHAPE_LIBRARY.map((s) => (
                    <div
                      key={s.id}
                      style={styles.shapeIconItem}
                      onClick={(e) => { e.stopPropagation(); handleAddShape(s); }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setState((prev) => ({
                          ...prev,
                          isDraggingNow: true,
                          draggingType: "shape",
                          draggingShapeData: { 
                            shapeType: s.id, 
                            styles: { 
                              clipPath: s.path, 
                              borderRadius: s.radius, 
                              backgroundColor: "#4f46e5" 
                            } 
                          }
                        }));
                      }}
                    >
                      <div style={styles.shapeIconContainer}>{s.icon}</div>
                      <span style={{ fontSize: "11px", color: "#475569" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'sections' && (
              <section style={styles.section}>
                <div style={styles.list}>
                  {sections.map((sec) => (
                    <button key={sec.id} onClick={() => addSection(sec.id)} style={styles.sectionBtn}>
                      <div style={styles.iconBox}>{sec.icon}</div>
                      <div style={styles.btnContent}>
                        <span style={styles.btnTitle}>{sec.label}</span>
                        <span style={styles.btnSub}>Click to add layout</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {/* 🛠️ أولاً: محتوى تبويب البيانات (Charts & Tables) */}
{activeTab === 'data-visual' && (
  <section style={styles.section}>
    <div style={styles.grid}>
      {/* كرت الرسم البياني */}
      <button
        style={styles.elementBtn}
        onClick={() => handleElementClick("chart")}
        onMouseDown={(e) => handleStartDrag(e, "chart")}
      >
        <span style={{ fontSize: "20px" }}>📊</span>
        <span style={styles.label}>Bar Chart</span>
      </button>

      {/* كرت الجدول الإحصائي */}
      <button
        style={styles.elementBtn}
        onClick={() => handleElementClick("table")}
        onMouseDown={(e) => handleStartDrag(e, "table")}
      >
        <span style={{ fontSize: "20px" }}>📅</span>
        <span style={styles.label}>Data Table</span>
      </button>
    </div>
  </section>
)}

{/* 🛠️ ثانياً: محتوى تبويب الجرافيكس المتقدم (Animations & Advanced Forms) */}
{activeTab === 'advanced' && (
  <section style={styles.section}>
    <div style={styles.grid}>
      {/* كرت الأنميشن المتحرك */}
      <button
        style={styles.elementBtn}
        onClick={() => handleElementClick("animation")}
        onMouseDown={(e) => handleStartDrag(e, "animation")}
      >
        <span style={{ fontSize: "20px" }}>✨</span>
        <span style={styles.label}>Lottie Animation</span>
      </button>

      <button
        style={styles.elementBtn}
        onClick={() => handleElementClick("form-group")}
        onMouseDown={(e) => handleStartDrag(e, "form-group")}
      >
        <span style={{ fontSize: "20px" }}>📝</span>
        <span style={styles.label}>Contact Form</span>
      </button>
    </div>
  </section>
)}
          </div>
        )}

        <button 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
          style={styles.toggleBtnInside}
        >
          {isDrawerOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100%", zIndex: 99, position: "relative" },
  iconStrip: {
    width: "72px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "16px",
    gap: "12px",
    height: "100%",
    position: "relative",
    zIndex: 2
  },
  stripBtn: {
    width: "60px",
    height: "64px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    gap: "4px",
    transition: "all 0.2s"
  },
  stripLabel: { fontSize: "10px", fontWeight: "600" },
  drawer: {
    backgroundColor: "#ffffff",
    height: "100%",
    overflow: "visible",
    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    zIndex: 1
  },
  toggleBtnInside: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: "100%",
    marginLeft: "-1px", 
    width: "24px",
    height: "48px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: "none",
    borderRadius: "0 100px 100px 0", 
    boxShadow: "4px 0 10px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#1e293b",
    zIndex: 10,
    padding: 0,
    outline: "none"
  },
  drawerContent: { width: "300px", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "20px", height: "100%", overflowY: "auto" },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" },
  drawerTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b" },
  closeDrawerBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: "50%", padding: "4px" },
  section: { display: "flex", flexDirection: "column" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  sectionTitle: { fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" },
  pagesList: { display: "flex", flexDirection: "column", gap: "4px" },
  pageItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", border: "1px solid transparent" },
  miniAddBtn: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  trashBtn: { background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  elementBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 0", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" },
  shapesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  shapeIconItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" },
  shapeIconContainer: { width: "48px", height: "48px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#475569" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  sectionBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", cursor: 'pointer', textAlign: 'left', width: '100%' },
  iconBox: { width: "36px", height: "36px", background: "#eff6ff", color: "#3b82f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  btnContent: { display: "flex", flexDirection: "column" },
  btnTitle: { fontSize: "0.85rem", fontWeight: "600", color: "#1e293b" },
  btnSub: { fontSize: "0.65rem", color: "#94a3b8" },
  label: { fontSize: "0.75rem", fontWeight: "500", color: "#334155" },
  actionBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }
};