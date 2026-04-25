import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DndContext, closestCenter,DragOverlay, useDroppable,PointerSensor, rectIntersection,useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionRenderer from '../components/SectionRenderer';
import { useDraggable } from '@dnd-kit/core';

import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  GripVertical, Trash2, FileText, Plus, Sparkles, Monitor, 
  Tablet, Smartphone, ChevronRight, X, Image as ImageIcon, 
  Type, Layout, Globe, MousePointer2, Download, Send, RotateCcw, RotateCw,ExternalLink, Square
} from 'lucide-react';
import { useParams } from 'react-router-dom';
const ResizeHandle = () => (
<div className="absolute -right-1 -bottom-1 w-3 h-3 bg-indigo-600 border border-white rounded-full cursor-se-resize z-150 shadow-sm hover:scale-125 transition-transform" />);
// أيقونة السحب الاحترافية في الصفحات

const toId = (id) => String(id);
// أيقونات السايدبار الأيسر
const SidebarElement = ({ type, label, icon: Icon, onClick, isAtomic = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}-${isAtomic ? 'atomic' : 'section'}`,
    data: { type, isSidebarItem: !isAtomic, isAtomic, isElement: false }
  });

const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
visibility: isDragging ? 'hidden' : 'visible'  };

  return (
    <div 
  ref={setNodeRef} 
  {...listeners}
  {...attributes} 
  style={style} 
  onClick={onClick}
  className={`w-full mb-3 touch-none p-4 bg-transparent rounded-2xl border-2 border-transparent
  hover:border-indigo-500 hover:bg-transparent transition-all flex items-center gap-4 group 
  cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
>

      <div className="p-2 rounded-xl shadow-sm group-hover:bg-indigo-50
       group-hover:text-indigo-600 transition-colors"><Icon size={20} strokeWidth={2.5} /></div>
      <span className="font-bold text-slate-700 text-xs uppercase tracking-tight">{label}</span>
    </div>
  );
};


const MoveIcon = () => (
<svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
  <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
</svg>
);


const SortablePageItem = ({
  page,
  isActive,
  onSelect,
  onRename,
  onRemove
}) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      
      <div
        {...listeners}
        onClick={() => onSelect(page.id)}
        className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${
          isActive ? 'bg-indigo-600 text-white' : 'bg-transparent'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(page.id);
          }}
        >
          ✕
        </button>
                {page.name}

      </div>

    </div>
  );
};


const ElementWrapper = ({
  
  element,
  sectionId,
  isSelected,
  onSelect,
  updatePosition,
  updateSize
}) => {
  if (!element || !element.id) return null;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    data: { element, sectionId, isElement: true }
  });

  const style = {
    position: "absolute",
  left: element.x,
  top: element.y,
  width: element.width,
  height: element.height,
  opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      className="absolute"
    >
      {element.type === "text" && (
        <div style={element.styles}>{element.text}</div>
      )}

      {element.type === "link" && (
        <a style={element.styles}>{element.text}</a>
      )}

      {element.type === "image" && (
        <img src={element.src} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
};


const SortableItem = ({ 
  id, 
  section, 
  onRemove, 
  updateSectionData, 
  onSelect, 
  isSelected, 
  selectedElements, 
  selectedElementIds,
  onElementClick, 
  fileInputRef, 
  setIsMovingElement
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(id) });
  
  const style = { 
    transition, 
    zIndex: isDragging ? 100 : 1, 
    opacity: isDragging ? 0.4 : 1, 
    position: 'relative' 
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={(e) => { 
        e.stopPropagation(); 
        onSelect(id); // هذه الدالة ستتعامل مع كل حالات التحديد
      }}
      className={`group/section relative transition-all duration-300 border-2 ${
        isSelected ? 'border-indigo-500 shadow-2xl bg-transparent' : 'border-transparent hover:border-indigo-200'
      }`}
    >
      {/* أدوات التحكم بالسحب والحذف */}
      <div className="absolute -top-12 left-0 right-0 flex justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 z-100 pointer-events-none">
        <div className="flex bg-indigo-600 text-white rounded-xl shadow-xl pointer-events-auto overflow-hidden border border-indigo-400">
          <div {...attributes} {...listeners} className="px-4 py-2 hover:bg-indigo-700 cursor-grab active:cursor-grabbing border-r border-indigo-500/50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <GripVertical size={12} /> MOVE
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(id); }} 
            className="px-4 py-2 hover:bg-red-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 size={12} /> DELETE
          </button>
        </div>
      </div>

      {/* عرض محتوى السكشن - استدعاء واحد فقط هنا */}
<SectionRenderer
  section={section}
  updateSectionData={updateSectionData}
  isSelected={isSelected}
  selectedElements={selectedElements}
  onElementClick={onElementClick}
  setIsMovingElement={setIsMovingElement}
  selectedElementIds={selectedElementIds}
    ElementWrapper={ElementWrapper}

/>     

      {isSelected && <ResizeHandle />}
    </div>
  );
};
const FONT_OPTIONS = [
{ name: 'Inter (Modern)', value: "'Inter', sans-serif" },
{ name: 'Cairo (Arabic High-Tech)', value: "'Cairo', sans-serif" },
{ name: 'Tajawal (Arabic Elegant)', value: "'Tajawal', sans-serif" },
{ name: 'Lalezar (Arabic Bold)', value: "'Lalezar', system-ui" },
{ name: 'Poppins (Geometric)', value: "'Poppins', sans-serif" },
{ name: 'Montserrat (Classic)', value: "'Montserrat', sans-serif" },
{ name: 'Playfair (Luxury)', value: "'Playfair Display', serif" },
{ name: 'Oswald (Strong)', value: "'Oswald', sans-serif" },
{ name: 'Roboto Mono (Tech)', value: "'Roboto Mono', monospace" },
];
const COLOR_PRESETS = [
'#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', 
'#8b5cf6', '#ec4899', '#1e293b', '#transparent', '#000000'
];
const DroppableCanvas = ({ children, onCanvasClick, onPointerDown }) => {
  const { setNodeRef, isOver } = useDroppable({
  id: 'canvas-drop-zone',
});
return (
<div 
ref={setNodeRef} 
onMouseDown={onCanvasClick}
className={`max-w-5xl mx-auto bg-transparent min-h-screen rounded-none shadow-sm relative transition-colors isolate ${isOver ? 'bg-indigo-50/10' : ''}`}>
{children}
</div>
);};
function Editor() {
const [isMovingElement, setIsMovingElement] = useState(false);

const sensors = useSensors(
useSensor(PointerSensor, {
 activationConstraint: {
  distance: 5
}
}),
useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);
const [activeDragItem, setActiveDragItem] = useState(null);
const [siteData, setSiteData] = useState(null);
  const [isActive, setIsActive] = useState(true); 
  const { siteId } = useParams(); 
    const [elements, setElements] = useState([]); 
  const [loading, setLoading] = useState(true);
// const [pages, setPages] = useState([{ id: 'p1', name: 'Home Page', sections: [] }]);
const [history, setHistory] = useState([]);
const [redoStack, setRedoStack] = useState([]); 
const pushHistory = (newState) => {
  setHistory(prev => [...prev, structuredClone(newState)]);
  setRedoStack([]);
};


const updateEditor = (updater) => {
  setState(prev => {
    const next = updater(prev);
    pushHistory(prev); // احفظ القديم
    return next;
  });
};

const [state, setState] = useState({
  pages: [{ id: 'p1', name: 'Home Page', sections: [] }],
  activePageId: 'p1',
  selected: {
    sectionId: null,
    elementIds: []
  }
});
const pages = state.pages;
const activePageId = state.activePageId;
const selectedSectionId = state.selected.sectionId;
const selectedElementIds = state.selected.elementIds;
const setPages = (newPages) => {
  setState(prev => ({
    ...prev,
    pages: typeof newPages === "function"
      ? newPages(prev.pages)
      : newPages
  }));
};
const setActivePageId = (id) => {
  setState(prev => ({
    ...prev,
    activePageId: id
  }));
};

const setSelectedSectionId = (id) => {
  setState(prev => ({
    ...prev,
    selected: {
      ...prev.selected,
      sectionId: id
    }
  }));
};

const setSelectedElementIds = (ids) => {
  setState(prev => ({
    ...prev,
    selected: {
      ...prev.selected,
      elementIds: typeof ids === "function"
        ? ids(prev.selected.elementIds)
        : ids
    }
  }));
};

const setEditorState = (newState) => {
  setState(newState);
};
const [activeSidebarItem, setActiveSidebarItem] = useState(null);
const [colorMode, setColorMode] = useState('HEX');
const [viewMode, setViewMode] = useState('desktop');
const fileInputRef = useRef(null);
const [uploadTargetSection, setUploadTargetSection] = useState(null);
// التعديل الآمن في سطر 157
const activePage =
  state.pages?.find(p => p.id === state.activePageId)
  || state.pages?.[0]
  || { sections: [] };

const selectedSection =
  activePage?.sections?.find(
    s => s.id === state.selected.sectionId
  );
  const downloadProject = () => {
const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pages, null, 2));
const downloadAnchorNode = document.createElement('a');
downloadAnchorNode.setAttribute("href", dataStr);
downloadAnchorNode.setAttribute("download", "my_project.json");
document.body.appendChild(downloadAnchorNode);
downloadAnchorNode.click();
downloadAnchorNode.remove();};


const handleRenamePage = (id, newName) => {
saveToHistory();
setPages(pages.map(p => p.id === id ? { ...p, name: newName } : p));};

    // 2. كود حفظ التصميم (يُستدعى عند الضغط على زر حفظ)
    const saveDesign = async () => {
        try {
            const token = localStorage.getItem('access_token');

            await axios.patch(`http://127.0.0.1:8000/api/websites/${siteId}/`, {
                content: pages // نرسل الـ state الحالية للسيرفر
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("تم الحفظ بنجاح! شغل الـ dnd محفوظ الآن.");
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ");
        }
    };

const updateSectionData = (id, newData) => {
  updateEditor(prev => ({
    ...prev,
    pages: prev.pages.map(p =>
      p.id === prev.activePageId
        ? {
            ...p,
            sections: p.sections.map(s =>
              s.id === id
                ? {
                    ...s,
                    data: {
                      ...s.data,
                      ...newData,
data: {
  ...s.data,
  ...newData,
  styles: {
    ...s.data.styles,
    ...(newData.styles || {})
  },
  items: newData.items ?? s.data.items
}                    }
                  }
                : s
            )
          }
        : p
    )
  }));
};


const saveToHistory = (customPages = null) => {
const pagesToSave = customPages || pages;
const historyItem = {
pages: JSON.parse(JSON.stringify(pagesToSave)), 
selectedSectionId,
selectedElementIds: [...selectedElementIds]};
setHistory(prev => [...prev, historyItem]);
setRedoStack([]); };

const addAtomicElementToSection = (type, sectionId) => {
  let targetId = sectionId ? String(sectionId) : (selectedSectionId ? String(selectedSectionId) : null);

  const newId = String(Date.now()); 
  saveToHistory();

  let newItem = {
    id: newId,
    type: type.toLowerCase(),
    x: 50,
    y: 50,
    width: 150,
    height: 50,
    styles: { color: '#000000', fontSize: 18, backgroundColor: 'transparent' }
  };

  if (type === 'Button') {
    newItem = { ...newItem, type: 'link', text: 'Click Me', styles: { backgroundColor: '#4f46e5', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold' } };
  } else if (type === 'Text') {
    newItem.text = 'New Text Element';
    newItem.styles.backgroundColor = 'transparent'; 
  } else if (type === 'Link') {
    newItem = { ...newItem, type: 'link', text: 'New Link', styles: { color: '#4f46e5', textDecoration: 'underline' } };
  } else if (type === 'Image') {
    newItem = { ...newItem, type: 'image', src: '/placeholder.png', width: 200, height: 150 };
  }

  // التعديل هنا: إذا لم يوجد سكشن، ننشئه وبداخله العنصر فوراً
  if (!targetId) {
    const newSectionId = String(Date.now() + 1); // نستخدم مسمى المتغير الخاص بك

    const newSection = {
      id: newSectionId,
      type: 'Custom',
      data: {
        styles: { backgroundColor: 'transparent', height: 400 },
        items: [newItem] // دمجنا newItem هنا بدلاً من المصفوفة الفارغة
      }
    };

    setPages(prev => prev.map(p => {
      if (p.id !== activePageId) return p;
      return {
        ...p,
        sections: [...p.sections, newSection]
      };
    }));

    setSelectedSectionId(newSectionId);
    // تم إزالة الـ setTimeout لضمان ثبات البيانات وظهورها فوراً
  } else {
    // تحديث السكشن المستهدف بالعنصر الجديد (نفس كودك تماماً)
    setPages(prev =>
      prev.map(p => {
        if (p.id !== activePageId) return p;

        return {
          ...p,
          sections: p.sections.map(s =>
            String(s.id) === targetId
              ? { ...s, data: { ...s.data, items: [...(s.data.items || []), newItem] } }
              : s
          )
        };
      })
    );
  }

  setSelectedElementIds([newId]); 
};

const handlePageReorder = (event) => {
const { active, over } = event;
if (!over) return;

if (active.id !== over.id) {
setPages((items) => {
const oldIndex = items.findIndex((p) => p.id === active.id);
const newIndex = items.findIndex((p) => p.id === over.id);
return arrayMove(items, oldIndex, newIndex);
});}};

const updateSelectedElementsStyle = (newStyles) => {
  if (!selectedSection || selectedElementIds.length === 0) return;
  
  saveToHistory(); 
  
  const updatedItems = selectedSection.data.items.map(item => {
    if (selectedElementIds.includes(toId(item.id))) {
      return {
        ...item,
        styles: {
          ...(item.styles || {}), 
          ...newStyles
        }
      };
    }
    return item;
  });

  updateSectionData(selectedSection.id, { items: updatedItems });
};

const handleElementClick = (e, elementId, sectionId) => {
  e?.stopPropagation?.();

  if (sectionId) setSelectedSectionId(sectionId);

  if (e?.ctrlKey || e?.metaKey) {
    setSelectedElementIds(prev =>
      prev.includes(elementId)
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  } else {
    setSelectedElementIds([elementId]);
  }
};

const undo = () => {
  if (!history.length) return;

  const previous = history[history.length - 1];

  // 🟢 حفظ الحالة الحالية للـ Redo قبل التراجع
  setRedoStack(prev => [
    ...prev,
    { 
      pages: JSON.parse(JSON.stringify(pages)), 
      selectedSectionId, 
      selectedElementIds: [...selectedElementIds] 
    }
  ]);

  setHistory(prev => prev.slice(0, -1));

  // 🟢 استرجاع الحالة السابقة وتوزيعها على الـ States
  setPages(previous.pages);
  setSelectedSectionId(previous.selectedSectionId);
  setSelectedElementIds(previous.selectedElementIds || []);
};


const redo = () => {
  if (!redoStack.length) return;

  const next = redoStack[redoStack.length - 1];

  // 🟢 حفظ الحالة الحالية للـ History قبل التقدم
  setHistory(prev => [
    ...prev,
    { 
      pages: JSON.parse(JSON.stringify(pages)), 
      selectedSectionId, 
      selectedElementIds: [...selectedElementIds] 
    }
  ]);

  setRedoStack(prev => prev.slice(0, -1));

  // 🟢 استرجاع الحالة القادمة وتوزيعها على الـ States
  setPages(next.pages);
  setSelectedSectionId(next.selectedSectionId);
  setSelectedElementIds(next.selectedElementIds || []);
};

const updateActivePageSections = (newSections) => {
if (!activePageId) return;
saveToHistory();
setPages(pages.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));};
const addSection = (type) => {
  saveToHistory();

  const newId = String(Date.now());
  let data = { styles: { backgroundColor: 'transparent', height: 450 }, items: [] };

  if (type === 'Navbar') {
    data.styles.height = 80;
    data.items = [
      { id: `logo-${newId}`, type: 'logo', text: 'BRAND', x: 40, y: 15, width: 80, height: 30, styles: { color: '#4f46e5', fontSize: 24, fontWeight: '900' } },
      { id: `link-${newId}`, type: 'link', text: 'Home', x: 350, y: 15, width: 80, height: 30, styles: { color: '#1e293b', fontSize: 16 } },
      { id: `link-about-${newId}`, type: 'link', text: 'About', x: 420, y: 15, width: 80, height: 30, styles: { color: '#1e293b', fontSize: 16 } }
    ];
  } else if (type === 'HeroSection') {
    data.styles.height = 550;
    data.items = [
      { id: `hero-title-${newId}`, type: 'text', text: 'Build Something Great', x: 50, y: 120, width: 500, styles: { fontSize: 56, fontWeight: '900', textAlign: 'left', lineHeight: '1.2' } },
      { id: `hero-desc-${newId}`, type: 'text', text: 'The best way to predict the future is to create it.', x: 50, y: 280, width: 450, styles: { fontSize: 18, color: '#64748b', textAlign: 'left' } },
      { id: `hero-btn-${newId}`, type: 'link', text: 'Get Started Now', x: 50, y: 380, width: 180, height: 50, styles: { backgroundColor: '#4f46e5', color: '#transparent', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' } }
    ];
  } else if (type === 'FeatureGrid') {
    data.items = [{ id: 'f1', type: 'text', text: 'Feature One', x: 100, y: 50, width: 300, height: 200, styles: { backgroundColor: '#f8fafc', borderRadius: '20px' } }];
  } else if (type === 'Footer') {
    data.styles.height = 150;
    data.items = [{ id: 'ft-1', type: 'text', text: '© 2026 Your Brand', x: 350, y: 60, width: 300 }];
  }

  // ⚠️ الإصلاح: تحديث الحالة من خلال مرجع واحد فقط لضمان عدم الضياع
  const newSection = { id: newId, type, data };
  setPages(prev => prev.map(p => 
    p.id === activePageId ? { ...p, sections: [...p.sections, newSection] } : p
  ));
  
  setSelectedSectionId(newId);
  setSelectedElementIds([]);
};


useEffect(() => {
    const loadDesign = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`http://127.0.0.1:8000/api/websites/${siteId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let siteContent = response.data.content;

            if (typeof siteContent === 'string') {
                try {
                    siteContent = JSON.parse(siteContent);
                } catch (e) {
                    console.error("فشل تحويل المحتوى إلى JSON", e);
                    siteContent = []; 
                }
            }

            const normalizedPages = Array.isArray(siteContent)
  ? siteContent.map(p => ({
      id: p.id || String(Date.now()),
      name: p.name || "Page",
      sections: p.sections || []
    }))
  : [{
      id: 'p1',
      name: 'Home Page',
      sections: []
    }];

setPages(normalizedPages);
            setSiteData(response.data);
            setIsActive(response.data.is_active);

            // 👈 تعيين الصفحة النشطة تلقائيًا إذا لم تكن محددة
if (normalizedPages.length > 0 && !state.activePageId) {
    setActivePageId(normalizedPages[0].id);
}
        } catch (error) {
            console.error("خطأ في التحميل:", error);
        } finally {
            // 👈 هذا السطر هو مفتاح الحل؛ سيوقف اللودينج مهما كانت النتيجة
            setLoading(false); 
        }
    };
    
    if (siteId) loadDesign();
}, [siteId]);

useEffect(() => {
const saved = localStorage.getItem('web-builder-data');
if (saved) {
setPages(JSON.parse(saved));}}, []);


useEffect(() => {
localStorage.setItem('web-builder-data', JSON.stringify(pages));
}, [pages]);



useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [history, redoStack, pages, selectedSectionId, selectedElementIds]);



useEffect(() => {
    const checkSiteStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');

        // نفترض أنك تجلب بيانات الموقع الحالي هنا
        const response = await axios.get(`http://127.0.0.1:8000/api/websites/${siteId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSiteData(response.data);
        setIsActive(response.data.is_active); 
      } catch (error) {
        console.error("Error fetching site status");
      }
    };
    checkSiteStatus();
  }, []);



 if (loading) return <div>Loading...</div>;
// {loading ? (
//   <div className="p-10 text-center">Loading Editor...</div>
// ) : (
//   <SortableContext items={activePage.sections.map(s => String(s.id))}>
//       {activePage.sections.length === 0 && (
//           <div className="p-20 border-2 border-dashed text-slate-400 text-center">
//               Drop sections here
//           </div>
//       )}
//       {activePage.sections.map(s => (
//           <SortableItem key={s.id} {...props} />
//       ))}
//   </SortableContext>
// )}

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-center">
        <div className="bg-transparent p-10 rounded-3xl shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">الموقع متوقف مؤقتاً</h2>
          <p className="text-slate-600 mb-6">
            نعتذر منك، لقد تم تعطيل صلاحيات التعديل لهذا الموقع من قبل الإدارة. يرجى التواصل مع الدعم الفني لحل المشكلة.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }
//
return (
  <DndContext 
    sensors={sensors} 
collisionDetection={closestCenter} 
    onDragStart={(e) => {
if (e.active.data.current?.isElement) 
  setIsMovingElement(true); 
       setActiveSidebarItem(e.active.data.current?.type);
        setActiveDragItem(e.active);

    }}
    onDragEnd={(e) => {
      setIsMovingElement(false);
      const { active, over } = e;
      setActiveSidebarItem(null);
      setActiveDragItem(null);

if (!over || !active) return;

   if (active.data.current?.isSidebarItem) {
  saveToHistory();
  addSection(active.data.current.type);
  return;
}
if (active.data.current?.isAtomic || active.data.current?.isSidebarItem) {
        const targetSectionId = over.data.current?.sectionId || over.id;
        if (active.data.current?.isAtomic) {
             addAtomicElementToSection(active.data.current.type, targetSectionId);
        } else {
             addSection(active.data.current.type);
        }
        return;
    }
      // 2. ترتيب الصفحات
      const isActivePage = pages.some(p => p.id === active.id);
      if (isActivePage) {
if (!over || !active) return;
if (active.id !== over.id){
          saveToHistory();
          setPages((prev) => {
            const oldIdx = prev.findIndex(p => p.id === active.id);
            const newIdx = prev.findIndex(p => p.id === over.id);
            return arrayMove(prev, oldIdx, newIdx);
          });
        }
        return;
      }

      // 3. ترتيب السكشنات
if (!over || !active) return;
if (!active?.data?.current?.isSidebarItem && active.id !== over.id) {
  const oldIdx = (activePage.sections || []).findIndex(s => String(s.id) === String(active.id));
  const newIdx = (activePage.sections || []).findIndex(s => String(s.id) === String(over.id));
  
  if (oldIdx !== -1 && newIdx !== -1) {
      saveToHistory();
      const reorderedSections = arrayMove((activePage.sections || []), oldIdx, newIdx);
      updateActivePageSections(reorderedSections);
    }
}
    }}
  > 
    <div className="flex h-screen bg-transparent overflow-hidden font-sans" dir="ltr">
    {/* Sidebar الأيسر */}
    <aside className="w-80 bg-transparent border-r border-slate-200 p-6 flex flex-col shadow-2xl z-50">
      <h2 className="font-black text-2xl mb-10 tracking-tighter text-indigo-600 italic">ELEMENTS</h2>
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {[
  { type: 'Navbar', label: 'Navigation', icon: Globe },
  { type: 'HeroSection', label: 'Hero Header', icon: ImageIcon },
  { type: 'FeatureGrid', label: 'Features', icon: Layout },
  { type: 'Footer', label: 'Footer', icon: ChevronRight }
].map(item => (
  <SidebarElement key={item.type} type={item.type} label={item.label} icon={item.icon} onClick={() => addSection(item.type)} />
))}
      </div>
      {/* سكشن العناصر المنفردة */}
<div>
  <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block tracking-widest">Atomic Elements</label>
  <div className="grid grid-cols-1 gap-2">
    {[
      { type: 'Text', label: 'Typography', icon: Type },
      { type: 'Button', label: 'Action Button', icon: Square },
      { type: 'Image', label: 'Media / Photo', icon: ImageIcon },
      { type: 'Link', label: 'External Link', icon: ExternalLink }
    ].map(item => (
      <SidebarElement 
        key={item.type} 
        type={item.type} 
        label={item.label} 
        icon={item.icon} 
        isAtomic={true} 
        onClick={() => addAtomicElementToSection(item.type)} 
      />
    ))}
  </div>
</div>
      <button onClick={() => { 
saveToHistory(); 
updateActivePageSections([]); 
}} className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all">Clear Canvas</button>
    </aside>

    {/* Canvas */}
    <main 
className="flex-1 overflow-y-auto p-4 bg-transparent min-h-full"
// onMouseDown={(e) => {
//   if (e.target === e.currentTarget) {
//     setSelectedElementIds([]);
//   }
// }}
>
<div 
className="flex items-center gap-1 p-1" 
onClick={(e) => e.stopPropagation()}
>
{/* زر Undo */}
<button 
  onClick={(e) => {
    e.stopPropagation();
    undo(); 
  }} 
  disabled={history.length === 0}
  className="p-2 rounded-lg text-slate-600 hover:bg-transparent hover:text-indigo-600 hover:shadow-sm disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 group"
  title="Undo (Ctrl+Z)"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
  </svg>
</button>
<div className="w-px h-4 bg-transparent mx-1" />

{/* زر Redo */}
<button 
  onClick={(e) => {
    e.stopPropagation();
    redo(); 
  }}
  disabled={redoStack.length === 0}
  className="p-2 rounded-lg text-slate-600 hover:bg-transparent hover:text-indigo-600 hover:shadow-sm disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 group"
  title="Redo (Ctrl+Y)"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
  </svg>
</button>

</div>


<div className="flex gap-4 mb-4">
<div className="flex gap-2 bg-transparent p-1 rounded-xl shadow-sm border border-slate-200">
  {[
    { id: 'desktop', icon: Monitor },
    { id: 'tablet', icon: Tablet },
    { id: 'mobile', icon: Smartphone }
  ].map(mode => (
    <button 
      key={mode.id}
      onClick={() => setViewMode(mode.id)}
      className={`p-2 rounded-lg transition-all duration-200 ${
        viewMode === mode.id 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
      }`}
      title={mode.id.charAt(0).toUpperCase() + mode.id.slice(1) + " View"}
    >
      <mode.icon size={18} strokeWidth={2.5} />
    </button>
  ))}
      

</div>
</div>
<h3>{activePage?.name || "Untitled Page"}</h3>
<DroppableCanvas
  onCanvasClick={(e) => {
    const isCanvasClick =
      e.target === e.currentTarget ||
      e.target.classList.contains('max-w-5xl');

    if (isCanvasClick) {
      setSelectedElementIds([]);
    }
  }}
  onPointerDown={(e) => {
  if (e.target === e.currentTarget) {
    setEditorState(prev => ({
      ...prev,
      selected: {
        sectionId: null,
        elementIds: []
      }
    }));
  }
}}
>
  <div
    className={`mx-auto transition-all duration-500 bg-transparent min-h-full relative 
    ${
      viewMode === 'desktop'
        ? 'w-full max-w-5xl'
        : viewMode === 'tablet'
        ? 'w-3xl'
        : 'w-93.75'
    }`}
  >

    <SortableContext
      items={(activePage.sections || []).map((s) => String(s.id))}
      strategy={verticalListSortingStrategy}
    >

      {loading ? (
        <div className="p-10 text-center animate-pulse">
          Loading Editor...
        </div>

      ) : (activePage.sections || []).length === 0 ? (
        <div className="p-20 border-2 border-dashed border-slate-300 text-slate-400 text-center rounded-xl bg-transparent">
          Drop your first section here
        </div>

      ) : (
        <div className="space-y-1">

          {(activePage.sections || []).map((section) => (
            <SortableItem
              key={String(section.id)}
              setIsMovingElement={setIsMovingElement}
              id={String(section.id)}
              section={section}
              isSelected={selectedSectionId === section.id}
              selectedElementIds={selectedElementIds}
              onElementClick={(e, elementId) =>
              handleElementClick(e, elementId, section.id)
              }
              onSelect={(id) => {
                setSelectedSectionId(id);
                setSelectedElementIds([]);
              }}
              updateSectionData={updateSectionData}
              onRemove={(id) => {
                saveToHistory();
                updateActivePageSections(
                  (activePage.sections || []).filter((sec) => sec.id !== id)
                );
              }}
              fileInputRef={fileInputRef}
            />
          ))}

        </div>
      )}

    </SortableContext>
  </div>

  {/* Drag Overlay */}
<DragOverlay dropAnimation={null}>
  {activeDragItem ? (
    activeDragItem.data.current?.isAtomic ? (
      /* 🟢 تحسين مظهر العنصر الذري أثناء السحب */
      <div className="flex items-center justify-center bg-indigo-500/20 border-2 border-dashed border-indigo-500 text-indigo-700 font-bold px-4 py-2 rounded-lg opacity-80 cursor-grabbing shadow-xl"
           style={{ 
width: activeDragItem?.data?.current?.width ?? 150,
height: activeDragItem?.data?.current?.height ?? 50,
           }}>
        {/* يعرض نوع العنصر المسحوب بشكل احترافي */}
        <span className="text-xs uppercase tracking-wider">
          Moving {activeDragItem.data.current?.type}...
        </span>
      </div>
    ) : (
      /* 🔵 مظهر السكشن عند السحب (كما هو عندك مع تحسين) */
      <div className="bg-transparent p-4 rounded-xl shadow-2xl opacity-90 border-2 border-indigo-400 w-125">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg text-white">
            <MoveIcon />
          </div>
          <span className="font-bold text-indigo-900">
            Section: {activeDragItem.data.current?.type}
          </span>
        </div>
      </div>
    )
  ) : null}
</DragOverlay>
</DroppableCanvas>
    </main>

    {/* Sidebar الأيمن */}
    <aside className="w-80 bg-transparent border-l border-slate-200 p-6 shadow-2xl flex flex-col z-50 overflow-y-auto">
      <h2 className="font-black text-xl mb-8 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span> PROPERTIES
      </h2>
      {selectedSection ? (
        <div className="space-y-6">
          <div className="p-4 bg-transparent rounded-2xl border">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Section Background</label>
            <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={selectedSection.data.styles?.backgroundColor || '#transparent'} onChange={(e) => updateSectionData(selectedSection.id, { styles: { ...selectedSection.data.styles, backgroundColor: e.target.value } })} />
          </div>
{/* تأكد من وضع هذا الكود بدلاً من قسم Element Styling القديم */}
{selectedElementIds.length > 0 && (
<div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100 mt-4 space-y-6">
  <div className="flex items-center justify-between">
    <label className="text-[11px] font-black text-indigo-600 uppercase tracking-tighter italic">Element Styling</label>
    <span className="text-[10px] bg-transparent text-indigo-700 px-2 py-0.5 rounded-full font-bold">
      {selectedElementIds.length} Selected
    </span>
  </div>

  {/* Typography Section */}
  <div className="space-y-4">
    <p className="text-[10px] font-bold text-slate-400 uppercase">Typography</p>
    
    <select 
      className="w-full p-3 bg-transparent rounded-xl border-2 border-slate-100 text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm"
      onChange={(e) => updateSelectedElementsStyle({ fontFamily: e.target.value })}
    >
      {FONT_OPTIONS.map(font => (
        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>
      ))}
    </select>

    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
          <input 
          type="number" className="w-full p-2 bg-transparent rounded-lg border border-slate-200 text-xs font-bold"
          placeholder="Size" onChange={(e) => updateSelectedElementsStyle({ fontSize: parseInt(e.target.value) || 16 })}
        />
      </div>
      <div className="flex gap-1">
        {['400', '600', '900'].map(weight => ( // أضفت درجة 600 للوسط
          <button 
            key={weight} onClick={() => { saveToHistory(); updateSelectedElementsStyle({ fontWeight: weight }) }}
            className="flex-1 py-2 bg-transparent border border-slate-200 rounded-lg text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            {weight === '900' ? 'BLACK' : weight === '600' ? 'MED' : 'REG'}
          </button>
        ))}
      </div>
    </div>

    {/* Formatting & Alignment Toolbar */}
    <div className="flex bg-transparent rounded-xl border border-slate-100 p-1 shadow-sm overflow-hidden">
      <button onClick={() => { saveToHistory(); updateSelectedElementsStyle({ fontStyle: 'italic' }) }} className="flex-1 p-2 hover:bg-indigo-50 rounded-lg text-sm italic font-serif">I</button>
      <button onClick={() => { saveToHistory(); updateSelectedElementsStyle({ textDecoration: 'underline' }) }} className="flex-1 p-2 hover:bg-indigo-50 rounded-lg text-sm underline">U</button>
      {/* تم التأكد من ربط أزرار المحاذاة بـ saveToHistory لضمان العمل */}
      <button onClick={() => { saveToHistory(); updateSelectedElementsStyle({ textAlign: 'left' }) }} className="flex-1 p-2 hover:bg-indigo-50 rounded-lg text-[10px] font-bold">L</button>
      <button onClick={() => { saveToHistory(); updateSelectedElementsStyle({ textAlign: 'center' }) }} className="flex-1 p-2 hover:bg-indigo-50 rounded-lg text-[10px] font-bold">C</button>
      <button onClick={() => { saveToHistory(); updateSelectedElementsStyle({ textAlign: 'right' }) }} className="flex-1 p-2 hover:bg-indigo-50 rounded-lg text-[10px] font-bold">R</button>
    </div>
  </div>

  {/* Sliders for Line Height & Letter Spacing */}
  <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase"><span>Line Height</span></div>
        <input type="range" min="0.8" max="3" step="0.1" className="w-full accent-indigo-600" 
          onChange={(e) => { 
              saveToHistory(); 
              updateSelectedElementsStyle({ lineHeight: e.target.value.toString() }) 
          }} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase"><span>Letter Spacing</span></div>
        <input type="range" min="-1" max="10" step="0.5" className="w-full accent-indigo-600" 
          onChange={(e) => { 
              saveToHistory(); 
              updateSelectedElementsStyle({ letterSpacing: `${e.target.value}px` }) 
          }} />
      </div>
  </div>
  {/* Color & Magic Gradient Section */}
  <div className="space-y-3 pt-2">
    <p className="text-[10px] font-bold text-slate-400 uppercase">Color & Appearance</p>
    <div className="grid grid-cols-5 gap-2">
      {COLOR_PRESETS.map(color => (
        <button 
          key={color} onClick={() => { saveToHistory(); updateSelectedElementsStyle({ color: color, background: 'none', WebkitBackgroundClip: 'initial', WebkitTextFillColor: 'initial' })}}
          className="w-6 h-6 rounded-full border border-slate-200 shadow-inner transform hover:scale-125 transition-transform"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>

    <div className="flex items-center gap-3 p-2 bg-transparent rounded-xl border border-slate-100 shadow-sm">
      <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
        onChange={(e) => updateSelectedElementsStyle({ color: e.target.value })} 
      />
      <span className="text-xs font-mono font-bold text-slate-500 uppercase">Custom HEX</span>
    </div>

    <button 
      onClick={() => {
        saveToHistory(); 
        updateSelectedElementsStyle({ 
          background: 'linear-gradient(45deg, #4f46e5, #ec4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' 
        })}}
      className="w-full py-3 bg-linear-to-r from-indigo-500 to-pink-500 text-white rounded-xl text-[10px] font-black shadow-lg hover:brightness-110 transition-all uppercase"
    >
      ✨ Apply Magic Gradient
    </button>
  </div>
</div>
)}

          <div className="pt-6 border-t">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Add Elements</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => {
                saveToHistory(); 
                  const newLink = { id: String(Date.now()), type: 'link', text: 'New Link', x: 10, y: 10, styles: { color: '#4f46e5', fontSize: 16 } };
                  updateSectionData(selectedSection.id, { items: [...(selectedSection.data.items || []), newLink] });
              }} className="p-3 bg-transparent border-2 border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all">+ ADD LINK</button>

              <button onClick={() => {
                saveToHistory(); 
const newItem = { 
      id: String(Date.now()), 
      type: 'text', 
      text: 'New Text', 
      x: 50, 
      y: 50, 
      width: 150, 
      height: 50, 
      styles: { 
          color: '#000000', 
          fontSize: 20,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          backgroundColor: 'transparent'
      } 
  };                    updateSectionData(selectedSection.id, { items: [...(selectedSection.data.items || []), newItem] });
              }} className="p-3 bg-transparent border-2 border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all">+ ADD TEXT</button>
              
              <button onClick={() =>{
                saveToHistory(); 

                fileInputRef.current.click()
                ;}} className="p-3 bg-transparent border-2 border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all">+ ADD IMAGE</button>

            </div>
          </div>
        </div>
      ) : (
        <div className="bg-transparent rounded-4xl p-8 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px]">Select section to edit</div>
      )}
      {/* قسم الصفحات في السايدبار الأيمن */}
<div className="pt-10 border-t mt-auto">
<h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.3em]">Project Pages</h3>

<SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
  <div className="space-y-2 mb-4">
    {pages.map(p => (
      <SortablePageItem 
        key={p.id} 
        page={p} 
        isActive={activePageId === p.id} 
        onSelect={setActivePageId} 
        onRename={handleRenamePage}
        onRemove={(id) => {
          saveToHistory();
          const filtered = pages.filter(pg => pg.id !== id);
          if (filtered.length > 0) {
            setPages(filtered);
            if (activePageId === id) setActivePageId(filtered[0].id);
          }
        }} 
      />
    ))}
  </div>
</SortableContext>

<button onClick={() => {
  saveToHistory(); 
  const newId = String(Date.now());
  setPages([...pages, { id: newId, name: `Page ${pages.length + 1}`, sections: [] }]);
  setActivePageId(newId);
}} className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase hover:border-indigo-500 transition-all">
  + New Page
</button>
</div>
      <button className="mt-6 w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all">Publish Project</button>
      <button onClick={downloadProject} className="mt-2 w-full border-2 border-slate-900 text-slate-900 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-100 transition-all">
Export JSON
</button>
    </aside>
  </div>
  <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
      onChange={(e) => {
  const file = e.target.files[0];

  if (file && selectedSectionId) {
    const url = URL.createObjectURL(file);

    const newImageItem = {
      id: String(Date.now()),
      type: 'image',
      src: url,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      styles: {
        backgroundColor: 'transparent'
      }
    };

    const targetSection = (activePage?.sections || []).find(
      s => String(s.id) === String(selectedSectionId)
    );

    if (targetSection) {
      updateSectionData(selectedSectionId, {
        items: [
          ...(targetSection.data.items || []),
          newImageItem
        ]
      });

      setSelectedElementIds([newImageItem.id]);
    }

  }
}} 
      />
    </DndContext>
);}
export default Editor;