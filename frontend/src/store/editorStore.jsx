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
    modal: { isOpen: false, type: null, data: null },
    canvasStyles: { backgroundColor: "#ffffff" },
    canvasWidth: '100%', 
    canvasHeight: '800px', 
    pages: [],
    activePageId: null,
    selected: [],           // المسمى القديم (للوحة الخصائص)
    selectedElementIds: [], // المسمى الجديد (للتحريك والـ Moveable)
    clipboard: [], 
    isDraggingNow: false,   // ضروري لعمل الـ DnD
  draggingType: null,
    ...initialState
});
const [history, setHistory] = useState([]);
const [redoStack, setRedoStack] = useState([]);
const saveToHistory = useCallback((stateToSave) => {
    if (!stateToSave) return;
    const clone = safeClone(stateToSave);
    
    setHistory(prev => {
        return [...prev, clone].slice(-30);
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
            return { ...prev, clipboard: elementsToCopy };
        }
        return prev;
    });
}, []); 

const pasteElements = useCallback(() => {
  setState(prev => {
    if (!prev.clipboard || prev.clipboard.length === 0) return prev;

    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    saveToHistory(prev);

    // البحث عن السيكشن المختار أو آخر سيكشن مضاف
    const targetSection = activePage.sections.find(s => s.id === prev.activeSectionId) || activePage.sections[activePage.sections.length - 1];
    
    if (!targetSection) return prev;

    const newItems = prev.clipboard.map(item => ({
      ...item,
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: item.x + 40, 
      y: item.y + 40,
    }));
    setTimeout(() => {
      selectItems(newItems.map(i => i.id));
    }, 50);

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? {
        ...p,
        sections: p.sections.map(s => s.id === targetSection.id ? {
          ...s,
          data: { ...s.data, items: [...(s.data.items || []), ...newItems] }
        } : s)
      } : p),
      selectedElementIds: newItems.map(ni => ni.id)
    };
  });
}, [saveToHistory]);
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
const addPage = useCallback((name = "New Page") => {
  setState(prev => {
    saveToHistory(prev); 
    const newPage = { id: `p-${Date.now()}`, name, sections: [] };
    return {
      ...prev,
      pages: [...prev.pages, newPage],
      activePageId: newPage.id
    };
  });
}, [saveToHistory]); 

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
const updateCanvasStyles = useCallback((newStyles) => {
  setState(prev => ({
    ...prev,
    canvasStyles: { ...prev.canvasStyles, ...newStyles }
  }));
}, []);

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
  setState(prev => {
    saveToHistory(prev);
    return {
      ...prev,
      pages: prev.pages.map(p => ({
        ...p,
        sections: p.sections.map(s => 
          s.id === sectionId 
            ? { 
                ...s, 
                data: { 
                  ...s.data, 
                  styles: { ...(s.data.styles || {}), ...(data.styles || {}) },
                  items: data.items || s.data.items 
                } 
              } 
            : s
        )
      }))
    };
  });
}, [saveToHistory]);



const addItemAtPosition = useCallback((type, x, y, sectionId = null) => {
  setState(prev => {
    saveToHistory(prev); 

    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const newId = `e-${Date.now()}`; 
    
    // الإحداثيات والستايل الأساسي
    const baseItem = {
      id: newId,
      type: type,
      x: x - 75,
      y: y - 25,
      width: 150,
      height: 50,
      styles: { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        zIndex: 100 ,
        userSelect: 'none', 
  WebkitUserSelect: 'none',
  cursor: 'move'
      }
    };

    // --- بداية قسم البيانات الخاصة (بدون أي حذف) ---
    let specificData = {};
    if(type === "text") {
        specificData = { text: "New Text", styles: { ...baseItem.styles, fontSize: "16px", color: "#333333" } };
    } else if(type === "button") {
        specificData = { 
            text: "New Button", 
            action: { type: 'link', url: '' }, 
            styles: { 
                ...baseItem.styles, 
                backgroundColor: "#4f46e5", 
                color: "white", 
                borderRadius: "6px",
                fontSize: "14px", 
                fontWeight: "bold",
                textAlign: "center", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                lineHeight: "1", 
                padding: "0 16px", 
                cursor: "pointer",
                border: "0px solid #000000",
                transition: "all 0.2s" 
            },
            hoverStyles: {
                backgroundColor: "#4338ca",
                color: "white"
            }
        };
    } else if(type === "image") {
        specificData = { 
            src: null, 
            styles: { 
                ...baseItem.styles, 
                objectFit: "cover",
                borderRadius: "8px", 
                border: "0px solid #000000" 
            } 
        };
    } else if(type === "shape") {
        specificData = { 
            shapeType: 'rect', 
            styles: { 
                ...baseItem.styles, 
                backgroundColor: "#4f46e5", 
                borderRadius: "0px",
                clipPath: "none" 
            } 
        };
    }
    // --- نهاية قسم البيانات الخاصة ---

    const newItem = { ...baseItem, ...specificData };
    let updatedSections = [...activePage.sections];
    
    // منطق اختيار السيكشن المستهدف (ذكي)
    let targetSectionId = sectionId;
    if (!targetSectionId && updatedSections.length > 0) {
        targetSectionId = updatedSections[0].id; 
    }

    if (!targetSectionId || !activePage.sections.some(s => s.id === targetSectionId)) {
      const newBlankSection = {
        id: `s-${Date.now()}`,
        type: "blank", 
        data: {
          styles: { 
            minHeight: "500px", // زدنا الارتفاع ليظهر بوضوح عند السحب لأول مرة
            backgroundColor: "transparent", 
            padding: "0px",
            zIndex: 1,
            position: "relative"
          },
          items: [newItem]
        }
      };
      updatedSections.push(newBlankSection);
    } else {
      updatedSections = updatedSections.map(s => 
        s.id === targetSectionId 
          ? { ...s, data: { ...s.data, items: [...(s.data.items || []), newItem] } } 
          : s
      );
    }

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, sections: updatedSections } : p),
      selected: [],           // للوحة الخصائص
      selectedElementIds: [],  // للتحريك (Moveable)
      activeElementId: newId,
      isDraggingNow: false,         // إيقاف وضع السحب
      draggingType: null            // تنظيف نوع العنصر المسحوب
    };
    setTimeout(() => {
  setState(current => ({
    ...current,
    selected: [newId],
    selectedElementIds: [newId]
  }));
}, 50);
  });
}, [saveToHistory, setState]);


const selectItems = useCallback((ids) => {
  setState(prev => {
    const newSelected = Array.isArray(ids) ? ids : [ids];
    
    // المقارنة لضمان عدم إعادة الرندرة بدون داعي (تحسين أداء)
    if (JSON.stringify(prev.selectedElementIds) === JSON.stringify(newSelected)) {
      return prev;
    }

    return { 
      ...prev, 
selected: newSelected, // للوحات القديمة (Properties)
      selectedElementIds: newSelected ,
    activeElementId: newSelected[0] || null };
      
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
    saveToHistory(prev);
    const updatedPages = prev.pages.map(page => {
      if (page.id === prev.activePageId) {
        return {
          ...page,
          sections: page.sections.map(section => ({
            ...section,
            data: { 
              ...section.data, 
              items: [] 
            }
          }))
        };
      }
      return page;
    });

    return {
      ...prev,
      pages: updatedPages,
selectedElementIds: [],
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
  setHistory((prevHistory) => {
    if (prevHistory.length === 0) return prevHistory;

    const previousState = safeClone(prevHistory[prevHistory.length - 1]);
    const newHistory = prevHistory.slice(0, -1);

    setState((currentState) => {
      setRedoStack((prevRedo) => [safeClone(currentState), ...prevRedo]);
      return previousState;
    });

    return newHistory;
  });
}, []);

const redo = useCallback(() => {
  setRedoStack((prevRedo) => {
    if (prevRedo.length === 0) return prevRedo;

    const nextState = safeClone(prevRedo[0]);
    const newRedo = prevRedo.slice(1);

    setState((currentState) => {
      setHistory((prevH) => [...prevH, safeClone(currentState)]);
      return nextState;
    });

    return newRedo;
  });
}, []);
const updateItem = useCallback((pageId, sectionId, itemId, data) => {
  setState(prev => {
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
                items: s.data.items.map(it => {
                  if (it.id === itemId) {
                    return {
                      ...it,
                      ...data,
                      // هذا السطر هو الأهم لضمان وصول الـ clipPath من الـ data
                      styles: { ...it.styles, ...(data.styles || {}) }
                    };
                  }
                  return it;
                })
              }
            };
          })
        };
      })
    };
  });
}, []);

const previewUpdateItem = useCallback((pageId, sectionId, itemId, data) => {
  setState(prev => ({
    ...prev,
    pages: prev.pages.map(p => p.id === pageId ? {
      ...p,
      sections: p.sections.map(s => s.id === sectionId ? {
        ...s,
        data: {
          ...s.data,
          items: s.data.items.map(it => it.id === itemId ? { 
            ...it, 
            ...data, 
            styles: { ...it.styles, ...(data.styles || {}) } 
          } : it)
        }
      } : s)
    } : p)
  }));
}, []);

const cutElements = useCallback((elementIds) => {
  setState(prev => {
    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const elementsToCopy = [];
    activePage.sections.forEach(section => {
      section.data.items.forEach(item => {
        if (elementIds.includes(item.id)) elementsToCopy.push(safeClone(item));
      });
    });
    if (elementsToCopy.length === 0) return prev;
    saveToHistory(prev);

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
selectedElementIds: [],    };
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
    updateSection,
    updateCanvasStyles,
  };
}