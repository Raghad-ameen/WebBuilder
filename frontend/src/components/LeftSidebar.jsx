import React from "react";
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
  Pencil
} from "lucide-react";

export default function LeftSidebar({ store }) {
// أضف setState بدلاً من updateState إذا لم تكن معرفة
const { addItemAtPosition, addSection, state, addPage, deletePage, renamePage, setState } = store;
  const basicElements = [
    { id: 'text', label: 'Text', icon: <Type size={18} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={18} /> },
    { id: 'button', label: 'Button', icon: <CreditCard size={18} /> },
    { id: 'rect', label: 'Shape', icon: <Square size={18} /> },
    { id: 'link', label: 'Link', icon: <LinkIcon size={18} /> },
  ];

  const sections = [
    { id: 'blank', label: 'Blank Canvas', icon: <Square size={18} /> }, // الخيار الجديد
    { id: 'navbar', label: 'Navbar', icon: <Layout size={18} /> },
    { id: 'hero', label: 'Hero', icon: <Columns size={18} /> },
    { id: 'features', label: 'Features', icon: <Plus size={18} /> },
    { id: 'footer', label: 'Footer', icon: <Smartphone size={18} /> },
  ];

const handleElementClick = (type) => {
  const currentPage = state.pages.find(p => p.id === state.activePageId);
  
  // إذا لم توجد صفحة، ننشئ واحدة أولاً
  if (!currentPage) {
    addPage("Main Page");
    // هنا قد نحتاج لانتظار إنشاء الصفحة، لكن في الغالب المستخدم سيكون لديه صفحة مفتوحة
    return;
  }

  // نأخذ الـ ID الخاص بأول سكشن لو وجد، وإذا لم يوجد سنرسله null
  const targetSectionId = currentPage.sections[0]?.id || null;
  
  // سيقوم الـ Store بالباقي (إضافة سكشن لو لزم الأمر + إضافة العنصر) في ضغطة واحدة!
  addItemAtPosition(type, 150, 150, targetSectionId);
};

  return (
    <div style={styles.sidebar}>
      {/* قسم الصفحات - التحكم المركزي هنا فقط */}
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
    
    {/* اسم الصفحة */}
    <span style={{ flex: 1 }}>{page.name}</span>

    {/* أيقونة التعديل الجديدة */}
    <button 
  className="action-icon"
  onClick={(e) => {
    e.stopPropagation();
    // نفتح المودال ونمرر الـ id والاسم الحالي
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
  
  {/* أيقونة الحذف الموجودة مسبقاً */}
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

      {/* قسم العناصر */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Basic Elements</h3>
        <div style={styles.grid}>
          {basicElements.map((el) => (
           // داخل LeftSidebar.jsx في جزء الـ basicElements.map
<button 
    key={el.id} 
    style={styles.elementBtn}
    onClick={(e) => {
      // 1. توليد ID فريد للعنصر قبل إضافته لكي نتمكن من تحديده فوراً
      const newElementId = `item_${Date.now()}`; 

      // 2. تحديد الصفحة والسكشن المستهدف
      const activePage = state.pages.find(p => p.id === state.activePageId);
      const targetSectionId = activePage?.sections[0]?.id || null;

      // 3. إضافة العنصر مع تمرير الـ ID الذي اخترناه
      // ملاحظة: تأكدي أن دالة addItemAtPosition في الـ Store تقبل الـ ID كباراميتر
      store.addItemAtPosition(el.id, 100, 100, targetSectionId, newElementId);
      
      // 4. السطر السحري: نطلب من الـ Store تحديد العنصر الجديد فوراً
      // هذا هو السطر الذي سيجعل مربعات التحديد تظهر
      if (typeof setState === 'function') {
        setState(prev => ({ 
          ...prev, 
          selectedElementIds: [newElementId], // نضع الـ ID الجديد في مصفوفة التحديد
          isDraggingNow: false, 
          draggingType: null 
        }));
      }
    }}
    onMouseDown={(e) => {
        e.preventDefault(); 
        setState(prev => ({ 
            ...prev, 
            isDraggingNow: true, 
            draggingType: el.id 
        }));
    }}
  >
    {el.icon}
    <span style={styles.label}>{el.label}</span>
  </button>
          ))}
        </div>
      </section>

      {/* قسم الـ Sections */}
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
  opacity: 0.6, // ستظهر بشكل باهت قليلاً وتتضح عند التركيز
  transition: '0.2s',
},
};