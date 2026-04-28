import { useState, useCallback } from "react";

const safeClone = (obj) => {
  try {
    return obj ? JSON.parse(JSON.stringify(obj)) : null;
  } catch (e) {
    return null;
  }
};

export function useEditorStore(initialState) {
  const [state, setState] = useState({
    projectName: "Shops Project", 
    viewMode: 'desktop',
    modal: {
      isOpen: false,
      type: null, 
      data: null, 
    },
    canvasWidth: '100%', 
    canvasHeight: '800px', 
    pages: [],
    activePageId: null,
    selected: [],
    clipboard: [], 
    ...initialState
  });

const [history, setHistory] = useState([]);
const [redoStack, setRedoStack] = useState([]);

const saveToHistory = useCallback((stateToSave) => {
    if (!stateToSave) return;

    const clone = safeClone(stateToSave);
    const cloneString = JSON.stringify(clone); // حوليه مرة واحدة فقط

    setHistory(prev => {
        if (prev.length > 0) {
            // قارني الستريج الجاهز بآخر عنصر في التاريخ
            if (JSON.stringify(prev[prev.length - 1]) === cloneString) return prev;
        }
        return [...prev, clone].slice(-40);
    });
    setRedoStack([]); 
}, []);

const copyElements = useCallback((elementIds) => {
    setState(prev => {
        const activePage = prev.pages.find(p => p.id === prev.activePageId);
        if (!activePage) return prev;

        const elementsToCopy = [];
        activePage.sections.forEach(section => {
            section.data.items.forEach(item => {
                if (elementIds.includes(item.id)) {
                    elementsToCopy.push(safeClone(item));
                }
            });
        });

        if (elementsToCopy.length > 0) {
            console.log("تم النسخ للـ clipboard:", elementsToCopy);
            return { ...prev, clipboard: elementsToCopy };
        }
        return prev;
    });
}, []); 

const pasteElements = useCallback(() => {
    setState(prev => {
        if (!prev.clipboard || prev.clipboard.length === 0) {
            return prev;
        }

        const activePage = prev.pages.find(p => p.id === prev.activePageId);
        if (!activePage || activePage.sections.length === 0) return prev;

        // تحديد السكشن المستهدف (أول سكشن كمثال)
        const targetSection = activePage.sections[0]; 
        
        // إنشاء العناصر الجديدة مع معرفات (IDs) فريدة وإزاحة بسيطة
        const newItems = prev.clipboard.map(item => ({
            ...item,
            id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            x: item.x + 40, 
            y: item.y + 40,
        }));

        const newItemIds = newItems.map(ni => ni.id);

        saveToHistory(prev); 

        return {
            ...prev,
            pages: prev.pages.map(p => p.id === prev.activePageId ? {
                ...p,
                sections: p.sections.map(s => s.id === targetSection.id ? {
                    ...s,
                    data: { ...s.data, items: [...(s.data.items || []), ...newItems] }
                } : s)
            } : p),
            // التعديل هنا: استخدام الاسم الصحيح للمصفوفة التي تراقبها الواجهة
            selectedElementIds: newItemIds,
            activeElementId: newItemIds[0] || null // اختيار أول عنصر ملصق كعنصر نشط
        };
    });
}, [saveToHistory, setState]);

 

const updateState = useCallback((newState) => {
    saveToHistory(state);
    setState(newState);
  }, [state, saveToHistory]);

  const setCanvasSize = useCallback((width, height) => {
  setState(prev => ({
    ...prev,
    canvasWidth: width,
    canvasHeight: height
  }));
}, []);

// مثال لتصحيح دالة addPage في ملفك:
const addPage = useCallback((name = "New Page") => {
  setState(prev => {
    saveToHistory(prev); // نحفظ الحالة الحالية الحقيقية (prev)
    const newPage = { id: `p-${Date.now()}`, name, sections: [] };
    return {
      ...prev,
      pages: [...prev.pages, newPage],
      activePageId: newPage.id
    };
  });
}, [saveToHistory]); // لاحظي حذفنا [state] من التبعيات

const deletePage = useCallback((pageId) => {
    setState(prev => {
      saveToHistory(prev);
      const filtered = prev.pages.filter(p => p.id !== pageId);
      return {
        ...prev,
        pages: filtered,
        activePageId: filtered.length > 0 ? (prev.activePageId === pageId ? filtered[0].id : prev.activePageId) : null
      };
    });
  }, [saveToHistory]);

  const renamePage = useCallback((pageId, newName) => {
    saveToHistory(state);
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? { ...p, name: newName } : p)
    }));
  }, [state, saveToHistory]);


const openModal = useCallback((type, data = null) => {
  setState(prev => ({
    ...prev,
    modal: { isOpen: true, type, data }
  }));
}, []);

const closeModal = useCallback(() => {
  setState(prev => ({
    ...prev,
    modal: { isOpen: false, type: null, data: null }
  }));
}, []);

const updateSection = useCallback((sectionId, data) => {
  saveToHistory(state);
  setState(prev => ({
    ...prev,
    pages: prev.pages.map(p => ({
      ...p,
      sections: p.sections.map(s => s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s)
    }))
  }));
}, [state]); 

const addItemAtPosition = useCallback((type, x, y, sectionId = null) => {
  setState(prev => {
    saveToHistory(prev); 

    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const newId = `e-${Date.now()}`; // توليد الـ ID هنا لنستخدمه في التحديد لاحقاً

    const baseItem = {
      id: newId,
      type: type,
      x: x - 75,
      y: y - 25,
      width: 150,
      height: 50,
      styles: { display: "flex", alignItems: "center", justifyContent: "center" }
    };

    let specificData = {};
    if(type === "text") {
        specificData = { text: "New Text", styles: { ...baseItem.styles, fontSize: "16px", color: "#333" } };
    } else if(type === "button") {
        specificData = { text: "Click Me", styles: { ...baseItem.styles, backgroundColor: "#4f46e5", color: "white", borderRadius: "6px" } };
    } else if(type === "image") {
        specificData = { src: "https://via.placeholder.com/150", styles: { ...baseItem.styles, objectFit: "cover" } };
    }
    
    const newItem = { ...baseItem, ...specificData };

    let updatedSections = [...activePage.sections];
    
    if (!sectionId || !activePage.sections.some(s => s.id === sectionId)) {
      const newBlankSection = {
        id: `s-${Date.now()}`,
        type: "blank", 
        data: {
          styles: { 
            minHeight: "0px", 
            backgroundColor: "transparent", 
            padding: "0px",
            zIndex: 1 
          },
          items: [newItem]
        }
      };
      updatedSections.push(newBlankSection);
    } else {
      updatedSections = updatedSections.map(s => 
        s.id === sectionId 
          ? { ...s, data: { ...s.data, items: [...(s.data.items || []), newItem] } } 
          : s
      );
    }

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, sections: updatedSections } : p),
      // التعديل الجوهري هنا:
      selectedElementIds: [newId], // نستخدم الاسم الصحيح الذي يراقبه المكون
      activeElementId: newId      // احتياطاً إذا كان الستور يستخدم هذا الاسم أيضاً
    };
  });
}, [saveToHistory, setState]); // أضيفي setState للمصفوفة لضمان الاستقرار
const selectItems = useCallback((ids) => {
  setState(prev => {
    const newSelected = Array.isArray(ids) ? ids : [ids];
    
    // مقارنة بسيطة: إذا كان التحديد الجديد هو نفس القديم، لا تفعل شيئاً
    // هذا السطر "سحري" لأنه يمنع الـ Re-render ويجعل السحب ناعماً جداً
    if (JSON.stringify(prev.selected) === JSON.stringify(newSelected)) {
      return prev;
    }

    return { ...prev, selected: newSelected };
  });
}, []);

const saveProject = useCallback(() => {
  try {
    localStorage.setItem(`project_${state.projectName}`, JSON.stringify(state));
    openModal("saveSuccess", { 
      message: "Your project progress has been saved successfully to browser storage." 
    });
    
  } catch (error) {
    console.error("Save failed:", error);
    openModal("error", { message: "Failed to save project." });
  }
}, [state]);

const loadProject = useCallback(() => {
  const savedData = localStorage.getItem(`project_${state.projectName}`);
  if (savedData) {
    setState(JSON.parse(savedData));
  }
}, [state.projectName]);


  const addSection = useCallback((type) => {
    saveToHistory(state); 
    
    const templates = {
     blank: {
    id: `s-${Date.now()}`,
    type: "blank",
    data: {
      styles: { 
        minHeight: "0px", 
        backgroundColor: "transparent", 
        padding: "0px" 
      },
      items: [] 
    }
  },
      hero: {
        id: `s-${Date.now()}`,
        type: "section",
        data: {
          styles: { padding: "80px 40px", backgroundColor: "#f8fafc" },
          items: [
            { id: `e-${Date.now()}-1`, type: "text", text: "Hero Title", x: 200, y: 50, width: 400, height: 60, styles: { fontSize: "42px", fontWeight: "bold", textAlign: "center" } }
          ]
        }
      },
      navbar: {
        id: `s-${Date.now()}`,
        type: "section",
        data: {
          styles: { height: 80, backgroundColor: "#ffffff", borderBottom: "1px solid #eee" },
          items: [{ id: `e-${Date.now()}-logo`, type: "text", text: "LOGO", x: 20, y: 25, width: 100, height: 30, styles: { fontWeight: "bold" } }]
        }
      }
    };

    const newSection = templates[type] || templates.blank;

    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId 
        ? { ...p, sections: [...p.sections, newSection] } 
        : p
      )
    }));
  }, [state, saveToHistory]); 

const clearCanvas = useCallback(() => {
  setState(prev => {
    // 1. حفظ الحالة للتراجع
    saveToHistory(prev);

    // 2. الوصول للصفحة النشطة وتفريغ الـ items في كل section
    const updatedPages = prev.pages.map(page => {
      if (page.id === prev.activePageId) {
        return {
          ...page,
          sections: page.sections.map(section => ({
            ...section,
            data: { 
              ...section.data, 
              items: [] // تفريغ العناصر تماماً
            }
          }))
        };
      }
      return page;
    });

    return {
      ...prev,
      pages: updatedPages,
      selected: [] // إزالة أي تحديد نشط
    };
  });
}, [saveToHistory]);

 const deleteSection = useCallback((sectionId) => {
  saveToHistory(state); 
  setState(prev => {
    const newState = {
      ...prev,
      pages: prev.pages.map(p => ({
        ...p,
        sections: p.sections.filter(s => s.id !== sectionId)
      }))
    };
    localStorage.setItem(`project_${newState.projectName}`, JSON.stringify(newState));
    return newState;
  });
}, [state, saveToHistory]);

const deleteElement = useCallback((itemId) => {
  saveToHistory(state);
  
  setState(prev => {
    const newState = {
      ...prev,
      pages: prev.pages.map(p => ({
        ...p,
        sections: p.sections.map(s => ({
          ...s,
          data: { 
            ...s.data, 
            items: (s.data.items || []).filter(it => it.id !== itemId) 
          }
        }))
      }))
    };
        localStorage.setItem(`project_${newState.projectName}`, JSON.stringify(newState));
    return newState;
  });
}, [state, saveToHistory]);

const undo = useCallback(() => {
  // نستخدم التحديث الوظيفي للـ History والـ State لضمان الثبات
  setHistory((prevHistory) => {
    if (prevHistory.length === 0) return prevHistory;

    const previousState = prevHistory[prevHistory.length - 1];

    setState((currentState) => {
      setRedoStack((prevRedo) => [safeClone(currentState), ...prevRedo]);
      return previousState;
    });

    return prevHistory.slice(0, -1);
  });
}, []); // مصفوفة فارغة تعني أن الدالة لا تتغير أبداً

const redo = useCallback(() => {
  setRedoStack((prevRedo) => {
    if (prevRedo.length === 0) return prevRedo;

    const nextState = prevRedo[0];

    setState((currentState) => {
      setHistory((prevH) => [...prevH, safeClone(currentState)]);
      return nextState;
    });

    return prevRedo.slice(1);
  });
}, []); // مصفوفة فارغة أيضاً

const updateItem = useCallback((pageId, sectionId, itemId, data) => {
  setState(prev => {
    saveToHistory(prev); 

    return {
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map(s => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              data: {
                ...s.data,
                items: (s.data.items || []).map(it => {
                  if (it.id === itemId) {
                    return { 
                      ...it, 
                      ...data, 
                      styles: { 
                        ...it.styles, 
                        ...(data.styles || {}) 
                      } 
                    };
                  }
                  return it;
                }),
              },
            };
          }),
        };
      }),
    };
  });
}, [saveToHistory]);

// داخل useEditorStore.js
const previewUpdateItem = useCallback((pageId, sectionId, itemId, data) => {
  setState(prev => {
    // تحديث سريع جداً لا يلمس بقية الصفحات أو السكاشن غير المعنية
    const activePage = prev.pages.find(p => p.id === pageId);
    if (!activePage) return prev;

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? {
        ...p,
        sections: p.sections.map(s => s.id === sectionId ? {
          ...s,
          data: {
            ...s.data,
            items: s.data.items.map(it => it.id === itemId ? { ...it, ...data } : it)
          }
        } : s)
      } : p)
    };
  });
}, []);

const cutElements = useCallback((elementIds) => {
  setState(prev => {
    // 1. نسخ العناصر أولاً
    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const elementsToCopy = [];
    activePage.sections.forEach(section => {
      section.data.items.forEach(item => {
        if (elementIds.includes(item.id)) elementsToCopy.push(safeClone(item));
      });
    });

    if (elementsToCopy.length === 0) return prev;

    // 2. حفظ الحالة للتراجع
    saveToHistory(prev);

    // 3. حذف العناصر من الصفحات في خطوة واحدة
    const updatedPages = prev.pages.map(p => ({
      ...p,
      sections: p.sections.map(s => ({
        ...s,
        data: {
          ...s.data,
          items: (s.data.items || []).filter(it => !elementIds.includes(it.id))
        }
      }))
    }));

    return {
      ...prev,
      pages: updatedPages,
      clipboard: elementsToCopy,
      selected: [] // إلغاء التحديد بعد القص
    };
  });
}, [saveToHistory]);

  return { 
    state, 
    setState,
    selectItems,
    updateItem, 
    previewUpdateItem,
    addSection, 
    clearCanvas,
    deleteSection,
    addItemAtPosition, 
    deleteElement,
    copyElements,  
    pasteElements, 
    cutElements,
setViewMode: (mode) => {
  const sizes = {
    desktop: { width: '100%', height: '800px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  setState(prev => ({ 
    ...prev, 
    viewMode: mode,
    canvasWidth: sizes[mode].width,
    canvasHeight: sizes[mode].height
  }));
}, 
   undo, 
    redo ,
    addPage,      
  deletePage,  
  renamePage,
  history,  
  redoStack, 
  setCanvasSize,
  openModal, 
    closeModal,
    saveProject,
    loadProject,
    updateSection
  };
}