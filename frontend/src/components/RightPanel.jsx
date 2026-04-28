import React, { useMemo, useEffect } from "react";
import { debounce } from "lodash"; 
export default function RightPanel({ store }) {
  const { state, updateItem, previewUpdateItem } = store;

  // جلب الصفحة النشطة
  const activePage = state.pages.find((p) => p.id === state.activePageId);
  
  // العثور على العنصر المختار حالياً
  const selectedId = state.selected?.[0];
  let selectedItem = null;

  if (selectedId && activePage) {
    activePage.sections.forEach((section) => {
      const item = section.data.items.find((it) => it.id === selectedId);
      if (item) selectedItem = { ...item, sectionId: section.id };
    });
  }


const debouncedSave = useMemo(
    () =>
      debounce((pageId, sectionId, itemId, data) => {
        updateItem(pageId, sectionId, itemId, data);
      }, 500), // انتظر 500 ملي ثانية بعد توقف الحركة للحفظ
    [updateItem]
  );

  // تنظيف التايمر عند إغلاق المكون لمنع تسريب الذاكرة
  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  // --- 1. دوال المعاينة (Preview): تُحدث الواجهة فوراً دون حفظ في التاريخ ---
  
 const handleStylePreview = (key, value) => {
  if (!selectedItem) return;
  previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
    styles: { 
      ...selectedItem.styles, 
      [key]: value 
    },
  });
};

  const handleTextPreview = (value) => {
    if (!selectedItem) return;
    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      text: value,
    });
  };


const handleStyleCommit = (key, value) => {
  if (!selectedItem) return;
  
  const newStyles = { 
    ...selectedItem.styles, 
    [key]: value 
  };

  // إذا كنا نغير الشكل، يجب أن نلغي الـ borderRadius
  if (key === "clipPath" && value !== "none") {
    newStyles.borderRadius = "0px";
  }

  updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
    styles: newStyles
  });
};

  const handleTextCommit = (value) => {
    if (!selectedItem) return;
    updateItem(state.activePageId, selectedItem.sectionId, selectedId, {
      text: value,
    });
  };

 // ... نفس الكود العلوي (الدوال والتعريفات) ...

  return (
    <div className="properties-panel" style={styles.panel}>      
      <h3 style={styles.title}>Properties</h3>

      {!selectedItem ? (
        <div style={styles.emptyState}>Select an element to edit</div>
      ) : (
        <div style={styles.controls}>
          {/* 1. قسم المحتوى - النص */}
          <div style={styles.group}>
            <label style={styles.label}>Content</label>
            <input
              type="text"
              value={selectedItem.text || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleTextPreview(val); // تحديث فوري للشكل
                debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { text: val }); // حفظ ذكي
              }}
              style={styles.input}
            />
          </div>

          <hr style={styles.divider} />

          {/* 2. قسم الحجم (Dimensions) */}
          <div style={styles.group}>
            <label style={styles.label}>Dimensions</label>
            <div style={styles.row}>
              <div style={styles.col}>
                <span style={styles.unit}>W</span>
               <input
  type="number"
  // تأكدي من استخدام || 0 لكي لا يكون الحقل undefined فيعلق
  value={Math.round(selectedItem.width) || ""} 
  onChange={(e) => {
    const val = Number(e.target.value);
    
    // التعديل الجوهري: تحديث الخاصية مباشرة + داخل الـ styles لضمان الاستجابة
    previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, { 
      width: val,
      styles: { ...selectedItem.styles, width: val } 
    });

    debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { 
      width: val,
      styles: { ...selectedItem.styles, width: val } 
    });
  }}
  style={styles.smallInput}
/>
              </div>
           <div style={styles.col}>
  <span style={styles.unit}>H</span>
  <input
    type="number"
    // 1. التعديل هنا: قراءة الـ height
    value={Math.round(selectedItem.height) || ""} 
    onChange={(e) => {
      const val = Number(e.target.value);
      
      // 2. التعديل هنا: تحديث height
      previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, { 
        height: val,
        styles: { ...selectedItem.styles, height: val } 
      });

      // 3. التعديل هنا: حفظ الـ height في الستور
      debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { 
        height: val,
        styles: { ...selectedItem.styles, height: val } 
      });
    }}
    style={styles.smallInput}
  />
</div>
            </div>
          </div>

          {/* 3. قسم التنسيق (Typography) */}
{selectedItem.type === "text" && (
  <div style={styles.group}>
    <label style={styles.label}>Typography</label>
    
    {/* Font Family - اختيار الخطوط التي أضفناها */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Family</span>
      <select 
        value={selectedItem.styles?.fontFamily || "Inter"}
        onChange={(e) => handleStyleCommit("fontFamily", e.target.value)}
        style={styles.input}
      >
        <option value="'Plus Jakarta Sans', sans-serif">Jakarta (Default)</option>
        <option value="'Righteous', cursive">Righteous (Retro)</option>
        <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
        <option value="'Inter', sans-serif">Inter (Clean)</option>
  <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech)</option>
  <option value="'Righteous', cursive">Righteous (Retro)</option>
  <option value="'Bebas Neue', sans-serif">Bebas Neue (Bold)</option>
  <option value="'Playfair Display', serif">Playfair (Elegant)</option>
  <option value="'Montserrat', sans-serif">Montserrat</option>
  <option value="'Syne', sans-serif">Syne (Artistic)</option>
        <option value="'Cairo', sans-serif">Cairo (Arabic)</option>
        <option value="'Tajawal', sans-serif">Tajawal (Soft Arabic)</option>
  <option value="'Almarai', sans-serif">Almarai (Corporate)</option>
      </select>
    </div>

    {/* Font Size & Color (الموجودة سابقاً) */}
    <div style={styles.row}>
       <div style={{...styles.field, flex: 2}}>
          <span style={styles.subLabel}>Size</span>
          <input
            type="number"
            value={parseInt(selectedItem.styles?.fontSize) || 16}
            onChange={(e) => {
              const val = `${e.target.value}px`;
              handleStylePreview("fontSize", val);
              debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, fontSize: val } });
            }}
            style={styles.input}
          />
       </div>
       {/* <div style={{...styles.field, flex: 1}}>
          <input
            type="color"
            value={selectedItem.styles?.color || "#000000"}
            onChange={(e) => handleStylePreview("color", e.target.value)}
            onBlur={(e) => handleStyleCommit("color", e.target.value)}
            style={styles.colorPickerSmall}
          />
       </div> */}
    </div>

    {/* Weight & Alignment */}
    <div style={styles.row}>
      <select 
        value={selectedItem.styles?.fontWeight || "400"}
        onChange={(e) => handleStyleCommit("fontWeight", e.target.value)}
        style={{...styles.input, width: '50%'}}
      >
        <option value="300">Light</option>
        <option value="400">Regular</option>
        <option value="700">Bold</option>
        <option value="900">Black</option>
      </select>

      {/* استبدلي الجزء الخاص بالأزرار بهذا */}
{/* ابحثي عن هذا القسم في ملف RightPanel.jsx */}
<div style={styles.alignGroup}>
  {['left', 'center', 'right'].map((align) => (
    <button
      key={align}
      onClick={() => {
       
        
        const payload = { 
          styles: { 
            ...selectedItem.styles, 
            textAlign: align 
          } 
        };

        previewUpdateItem(state.activePageId, selectedItem.sectionId, selectedId, payload);
        updateItem(state.activePageId, selectedItem.sectionId, selectedId, payload);
        // ---------------------------
      }}
      style={{
        ...styles.alignButton,
        background: selectedItem.styles?.textAlign === align ? '#e2e8f0' : 'transparent',
        borderBottom: selectedItem.styles?.textAlign === align ? '2px solid #4f46e5' : 'none'
      }}
    >
      {/* عرض الأيقونات بناءً على المحاذاة */}
      {align === 'left' ? '⊢' : align === 'center' ? '≡' : '⊣'}
    </button>
  ))}
</div>
    </div>

    {/* الميزات الاحترافية الجديدة: Line Height & Letter Spacing */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Spacing</span>
      <div style={styles.col}>
        <span style={styles.tinyLabel}>Letter</span>
        <input
          type="number"
          step="0.1"
         // داخل الـ Input الخاص بـ letterSpacing
value={parseFloat(selectedItem.styles?.letterSpacing) || 0} // قراءة الرقم فقط
onChange={(e) => {
  const rawValue = e.target.value; // نأخذ القيمة كما هي
  const valWithUnit = `${rawValue}px`; // نضيف الوحدة فقط عند الإرسال للستور
  
  handleStylePreview("letterSpacing", valWithUnit);
  debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { 
    styles: { ...selectedItem.styles, letterSpacing: valWithUnit } 
  });
}}
          style={styles.smallInput}
        />
      </div>
      <div style={styles.col}>
       <span style={styles.tinyLabel}>Line</span>
<input
  type="number"
  step="0.1"
  value={selectedItem.styles?.lineHeight || 1.2} // قراءة مباشرة
 onChange={(e) => {
  const val = parseFloat(e.target.value); // تأكدي من تحويلها لرقم
  
  // تحديث المعاينة فوراً
  handleStylePreview("lineHeight", val); 
  
  // حفظ القيمة في الستور داخل كائن styles
  debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { 
    styles: { ...selectedItem.styles, lineHeight: val } 
  });
}}
  style={styles.smallInput}
/>
      </div>
    </div>

    {/* Case Transformation */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Case</span>
      <div style={styles.row}>
        {['none', 'uppercase', 'lowercase'].map((t) => (
          <button
            key={t}
            onClick={() => handleStyleCommit("textTransform", t)}
            style={{
              ...styles.tagButton,
              borderColor: selectedItem.styles?.textTransform === t ? '#10b981' : '#cbd5e1',
              color: selectedItem.styles?.textTransform === t ? '#10b981' : '#64748b'
            }}
          >
            {t === 'none' ? 'Ab' : t === 'uppercase' ? 'AB' : 'ab'}
          </button>
        ))}
      </div>
    </div>
  </div>
)}



{/* قسم خصائص الصورة - يظهر فقط للصور */}
{selectedItem.type === "image" && (
  <div style={styles.group}>
    <label style={styles.label}>Image Style</label>
    
    {/* زوايا الصورة (Border Radius) */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Corners (Roundness)</span>
      <input
        type="range"
        min="0"
        max="100"
        value={parseInt(selectedItem.styles?.borderRadius) || 0}
        onChange={(e) => {
          const val = `${e.target.value}px`;
          handleStylePreview("borderRadius", val);
          debouncedSave(state.activePageId, selectedItem.sectionId, selectedId, { styles: { ...selectedItem.styles, borderRadius: val } });
        }}
      />
    </div>

    {/* إطار الصورة (Border) */}
    <div style={styles.row}>
      <div style={{ flex: 2 }}>
        <span style={styles.tinyLabel}>Border Width</span>
        <input
          type="number"
          value={parseInt(selectedItem.styles?.borderWidth) || 0}
          onChange={(e) => handleStyleCommit("borderWidth", `${e.target.value}px`)}
          style={styles.input}
        />
      </div>
      <div style={{ flex: 1 }}>
        <span style={styles.tinyLabel}>Color</span>
        <input
          type="color"
          value={selectedItem.styles?.borderColor || "#000000"}
          onChange={(e) => handleStyleCommit("borderColor", e.target.value)}
          style={styles.fullColorPicker}
        />
      </div>
    </div>

    {/* طريقة عرض الصورة (Object Fit) */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Fitting</span>
      <select 
        value={selectedItem.styles?.objectFit || "cover"}
        onChange={(e) => handleStyleCommit("objectFit", e.target.value)}
        style={styles.input}
      >
        <option value="cover">Fill (Cover)</option>
        <option value="contain">Fit (Contain)</option>
        <option value="fill">Stretch</option>
      </select>
    </div>
  </div>
)}




{/* قسم خصائص الزر - يظهر فقط للأزرار */}
{selectedItem.type === "button" && (
  <div style={styles.group}>
    <label style={styles.label}>Button Style</label>
    
    {/* ألوان الخلفية والنص (الستايل المتطور) */}
    <div style={styles.row}>
      <div style={{ flex: 1 }}>
        <span style={styles.tinyLabel}>Button Color</span>
        <input
          type="color"
          value={selectedItem.styles?.backgroundColor || "#4f46e5"}
          onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
          onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
          style={styles.fullColorPicker}
        />
      </div>
      <div style={{ flex: 1 }}>
        <span style={styles.tinyLabel}>Hover Color</span>
        <input
          type="color"
          value={selectedItem.hoverStyles?.backgroundColor || "#4338ca"}
          onChange={(e) => {
              const val = e.target.value;
              updateItem(state.activePageId, selectedItem.sectionId, selectedId, { 
                  hoverStyles: { ...selectedItem.hoverStyles, backgroundColor: val } 
              });
          }}
          style={styles.fullColorPicker}
        />
      </div>
    </div>

    {/* قسم الـ Action */}
    <div style={styles.field}>
      <span style={styles.subLabel}>On Click Action</span>
      <select 
        value={selectedItem.action?.type || "none"}
        onChange={(e) => {
            const type = e.target.value;
            updateItem(state.activePageId, selectedItem.sectionId, selectedId, { 
                action: { ...selectedItem.action, type, url: type === 'link' ? '#' : '' } 
            });
        }}
        style={styles.input}
      >
        <option value="none">None</option>
        <option value="link">Open Link</option>
        <option value="function">Trigger Function (JS)</option>
      </select>
    </div>

    {/* رابط الـ Action */}
   {selectedItem.action?.type === 'link' && (
    <div style={styles.field}>
        <span style={styles.subLabel}>Link URL</span>
        <input
            type="text"
            // نستخدم القيمة من الستور
            value={selectedItem.action?.url || ""} 
            onChange={(e) => {
                const newUrl = e.target.value;
                // تحديث مباشر للستور
                updateItem(state.activePageId, selectedItem.sectionId, selectedId, { 
                    action: { ...selectedItem.action, url: newUrl } 
                });
            }}
            style={styles.input}
            placeholder="https://example.com"
        />
    </div>
)}



  </div>
)}

{/* قسم خصائص الأشكال - يظهر فقط عند اختيار Shape */}
{selectedItem.type === "shape" && (
  <div style={styles.group}>
    <label style={styles.label}>Shape Properties</label>
    
    {/* لون الشكل */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Fill Color</span>
      <input
        type="color"
        value={selectedItem.styles?.backgroundColor || "#4f46e5"}
        onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
        onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
        style={styles.fullColorPicker}
      />
    </div>

    {/* اختيار نوع الشكل (لحل مشكلة المستطيل) */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Change Shape</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
       {/* داخل قسم الأشكال في RightPanel */}
{[
  { label: 'Square', path: 'none' },
  { label: 'Circle', path: 'circle(50% at 50% 50%)' },
  { label: 'Triangle', path: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { label: 'Star', path: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
].map((shape) => (
  <button
    key={shape.label}
    onClick={() => {
      // نرسل قيمة clipPath للستور
      handleStyleCommit("clipPath", shape.path);
      // ملاحظة: الـ borderRadius قد يتعارض مع الـ clipPath في بعض المتصفحات
      // لذا يفضل تصفيره عند اختيار شكل هندسي غير المستطيل
      if (shape.path !== 'none') {
        handleStyleCommit("borderRadius", "0px");
      }
    }}
    style={{
       // تنسيقات الزر الموجودة لديك...
    }}
  >
    {shape.label}
  </button>
))}
      </div>
    </div>

    {/* شفافية الشكل */}
    <div style={styles.field}>
      <span style={styles.subLabel}>Opacity</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={selectedItem.styles?.opacity || 1}
        onChange={(e) => handleStyleCommit("opacity", parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  </div>
)}

{/* قسم التنسيقات المتقدمة - Decoration */}
<div style={styles.group}>
  <label style={styles.label}>Decoration</label>
  
  {/* أزرار Bold, Italic, Underline */}
  <div style={styles.row}>
    {[
      { key: 'fontWeight', val: '700', label: 'B', normal: '400' },
      { key: 'fontStyle', val: 'italic', label: 'I', normal: 'normal' },
      { key: 'textDecoration', val: 'underline', label: 'U', normal: 'none' }
    ].map((btn) => {
      const isActive = selectedItem.styles?.[btn.key] === btn.val;
      return (
        <button
          key={btn.key}
          onClick={() => handleStyleCommit(btn.key, isActive ? btn.normal : btn.val)}
          style={{
            ...styles.formatBtn,
            backgroundColor: isActive ? '#e2e8f0' : 'white',
            border: isActive ? '1px solid #4f46e5' : '1px solid #cbd5e1',
            fontWeight: btn.key === 'fontWeight' ? 'bold' : 'normal',
            fontStyle: btn.key === 'fontStyle' ? 'italic' : 'normal',
            textDecoration: btn.key === 'textDecoration' ? 'underline' : 'none'
          }}
        >
          {btn.label}
        </button>
      );
    })}
  </div>

  {/* لوحة الألوان المطورة (الخلفية والنص) */}
  <div style={styles.row}>
    <div style={{ flex: 1 }}>
      <span style={styles.tinyLabel}>Text Color</span>
      <input
        type="color"
        value={selectedItem.styles?.color || "#000000"}
        onChange={(e) => handleStylePreview("color", e.target.value)}
        onBlur={(e) => handleStyleCommit("color", e.target.value)}
        style={styles.fullColorPicker}
      />
    </div>
    <div style={{ flex: 1 }}>
      <span style={styles.tinyLabel}>Highlight</span>
      <input
        type="color"
        value={selectedItem.styles?.backgroundColor || "#ffffff"}
        onChange={(e) => handleStylePreview("backgroundColor", e.target.value)}
        onBlur={(e) => handleStyleCommit("backgroundColor", e.target.value)}
        style={styles.fullColorPicker}
      />
    </div>
  </div>
</div>
        </div>
      )}
    </div>
  );

}

const styles = {
  panel: {
    width: "280px",
    background: "#ffffff",
    borderLeft: "1px solid #e2e8f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.02)",
    overflowY: "auto"
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "24px"
  },
  emptyState: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "40px",
    fontSize: "0.9rem",
    fontStyle: "italic"
  },
group: {
  marginBottom: "16px",
  padding: "16px",
  backgroundColor: "#f8fafc", // لون أنعم قليلاً
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px" // يضيف مسافة بين الأسطر داخل المجموعة
},
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "10px"
  },
 subLabel: {
  fontSize: "0.7rem",
  color: "#64748b",
  fontWeight: "bold",
  textTransform: "uppercase"
},
 field: {
  display: "flex",
  flexDirection: "column", // التعديل: جعل الليبل فوق الانبوت ينهي الزحمة تماماً
  alignItems: "flex-start",
  gap: "6px",
  marginBottom: "8px"
},
input: {
  width: "100%", // جعل كل حقل يأخذ عرض الحاوية
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "0.85rem",
  outline: "none"
},
  smallInput: {
    width: "60px",
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem"
  },
  colorPicker: {
    flex: 1,
    height: "30px",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    cursor: "pointer"
  },
row: {
  display: "flex",
  gap: "12px",
  width: "100%" // ضمان توزيع العناصر بالتساوي
},
  col: {
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  unit: {
    fontSize: "0.7rem",
    color: "#94a3b8",
    fontWeight: "bold"
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f1f5f9",
    margin: "15px 0"
  },
  colorPickerSmall: {
    width: "100%",
    height: "32px",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    cursor: "pointer"
  },
  alignGroup: {
    display: "flex",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    overflow: "hidden",
    flex: 1,
    marginLeft: "10px"
  },
  alignButton: {
    flex: 1,
    border: "none",
    borderRight: "1px solid #cbd5e1",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white"
  },
  tinyLabel: {
    fontSize: "0.6rem",
    color: "#94a3b8",
    textTransform: "uppercase"
  },
  tagButton: {
    padding: "2px 8px",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "0.75rem",
    cursor: "pointer",
    background: "white",
    marginRight: "5px",
    fontWeight: "bold"
  },
  // أضيفي هذه داخل كائن styles الموجود عندك
formatBtn: {
  flex: 1,
  height: "35px",
  cursor: "pointer",
  fontSize: "1rem",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
},
fullColorPicker: {
  width: "100%",
  height: "35px",
  padding: "2px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "4px"
},
};