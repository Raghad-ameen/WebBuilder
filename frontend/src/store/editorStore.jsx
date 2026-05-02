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
    selected: [],          
    selectedElementIds: [], 
    clipboard: [], 
    isDraggingNow: false,  
  draggingType: null,
  isPreviewMode: false,
    ...initialState
});
// أضيفي هذه الدالة مع باقي الدوال مثل addPage و deletePage
const togglePreview = useCallback(() => {
  setState(prev => ({
    ...prev,
    isPreviewMode: !prev.isPreviewMode
  }));
}, []);
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
                    const clonedItem = safeClone(item);
                    
                    clonedItem.id = `e-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                    
                    elementsToCopy.push(clonedItem);
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

const updateSection = useCallback((pageId, sectionId, newData) => {

  setState(prev => {
    const activePage = prev.pages.find(p => p.id === pageId);
    
    if (!activePage) {
      console.warn("⚠️ Page not found in store:", pageId);
      return prev; 
    }

    return {
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;

        return {
          ...p,
          sections: p.sections.map(s => {
            if (s.id !== sectionId) return s;

            const updatedSection = {
              ...s,
              height: newData.height !== undefined ? newData.height : s.height,
              styles: { 
                ...(s.styles || {}), 
                ...(newData.styles || {}) 
              },
              data: { 
                ...(s.data || {}), 
                ...(newData.data || {}) 
              }
            };
            
            return updatedSection;
          })
        };
      })
    };
  });
}, [setState]);

const addItemAtPosition = useCallback((type, x, y, sectionId = null, extraData = {}) => {
  const finalNewId = `e-${Date.now()}`;

  const elementDefaults = {
    button: {
      width: 150,
      height: 45,
      text: "Click Me",
      styles: { backgroundColor: "#4f46e5", color: "#ffffff", borderRadius: "6px" }
    },
    text: {
      width: 200,
      height: 50,
      text: "New Text",
      styles: { backgroundColor: "transparent", color: "#000000" }
    },
    shape: {
      width: 100,
      height: 100,
      text: "",
      styles: { backgroundColor: "#4f46e5", borderRadius: "0px" }
    },
    image: {
      width: 250,
      height: 180,
      text: "",
      styles: { backgroundColor: "transparent", border: "1px dashed #ccc" }
    },
    default: {
      width: 150,
      height: 50,
      text: "",
      styles: { backgroundColor: "transparent", color: "#000000" }
    }
  };

  const config = elementDefaults[type] || elementDefaults.default;

  const finalWidth = extraData.width || config.width;
  const finalHeight = extraData.height || config.height;
  const finalX = (typeof x === 'number' ? x : 100) - (finalWidth / 2);
  const finalY = (typeof y === 'number' ? y : 100) - (finalHeight / 2);

  setState(prev => {
    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

const newItem = {
  id: finalNewId,
  type,
  x: finalX,
  y: finalY,
  width: finalWidth,
  height: finalHeight,
  text: extraData.text !== undefined ? extraData.text : config.text,
  action: type === 'link' ? { url: 'https://www.google.com' } : {},
  
  styles: {
    position: 'absolute',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    // 1. نضع ستايلات الكوفيج أولاً
    ...config.styles,
    // 2. ثم نضع ستايلات الـ extraData
    ...(extraData.styles || {}),
    // 3. أخيراً، نفرض لون الرابط والخط السفلي لضمان عدم مسحهما من أي ملف آخر
    ...(type === 'link' && {
      color: '#2563eb',
      textDecoration: 'underline',
      cursor: 'pointer'
    })
  }
};
    let updatedSections = [...activePage.sections];

if (updatedSections.length === 0) {
    // التحقق هل العنصر المضاف هو أصلاً سكشن (مثل هيرو) أم عنصر بسيط (مثل نص)
    const isLargeSection = ['navbar', 'hero', 'footer'].includes(type);

    updatedSections = [{
        id: `s-${Date.now()}`,
        type: isLargeSection ? type : "blank",
        // إذا كان سكشن كبير نعطيه 600، إذا كان نص نعطيه 100 فقط
        height: isLargeSection ? 600 : 100, 
        styles: { 
            // السكاشن البسيطة دائماً شفافة لتظهر خلفية الكانفاس
            backgroundColor: isLargeSection ? "#ffffff" : "transparent", 
            padding: "0px",
            // منع الارتفاع الإجباري الكبير للعناصر البسيطة
            minHeight: isLargeSection ? "400px" : "50px" 
        },
        data: { items: [newItem] }
    }];
}    else {
      const targetId = sectionId || updatedSections[0].id;
      updatedSections = updatedSections.map(s => {
        if (s.id === targetId) {
          return {
            ...s,
            data: {
              ...s.data,
              items: [...(s.data.items || []), newItem]
            }
          };
        }
        return s;
      });
    }

    return {
      ...prev,
      pages: prev.pages.map(p => 
        p.id === prev.activePageId ? { ...p, sections: updatedSections } : p
      ),
      isDraggingNow: false,
      draggingType: null
    };
  });

  setTimeout(() => {
    setState(current => ({
      ...current,
      selectedElementIds: [finalNewId],
      activeElementId: finalNewId
    }));
  }, 50);

}, [setState]);

const selectItems = useCallback((ids) => {
  setState(prev => {
    if (JSON.stringify(prev.selectedElementIds) === JSON.stringify(ids)) {
      return prev;
    }
    return {
      ...prev,
      selectedElementIds: ids,
      activeElementId: ids.length > 0 ? ids[0] : null
    };
  });
}, [setState]);

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
    height: 150, // تقليل الارتفاع الافتراضي للسكشن الفارغ
    styles: { 
        backgroundColor: "transparent", // جعله شفافاً ليعكس لون الكانفاس
        padding: "0px",
        minHeight: "50px"
    },
    data: { items: [] }
},
    hero: {
      id: `s-${Date.now()}`,
      type: "section",
      height: 600, 
      styles: { 
        backgroundColor: "#f8fafc", 
        padding: "80px 40px" 
      },
      data: {
        items: [
          { 
            id: `e-${Date.now()}-1`, 
            type: "text", 
            text: "Hero Title", 
            x: 200, 
            y: 50, 
            width: 400, 
            height: 60, 
            styles: { fontSize: "42px", fontWeight: "bold", textAlign: "center" } 
          }
        ]
      }
    },
    navbar: {
      id: `s-${Date.now()}`,
      type: "section",
      height: 80, 
      styles: { 
        backgroundColor: "#ffffff", 
        borderBottom: "1px solid #eee" 
      },
      data: {
        items: [
          { 
            id: `e-${Date.now()}-logo`, 
            type: "text", 
            text: "LOGO", 
            x: 20, 
            y: 25, 
            width: 100, 
            height: 30, 
            styles: { fontWeight: "bold" } 
          }
        ]
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

const moveSection = useCallback((sectionId, direction) => {
  setState(prev => {
    const activePage = prev.pages.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const sections = [...activePage.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return prev;
    }

    saveToHistory(prev);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, sections } : p)
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
    updateSection,
    updateCanvasStyles,
    togglePreview,
    isPreviewMode: state.isPreviewMode,
    moveSection,
    moveSectionUp: (id) => moveSection(id, 'up'),
  moveSectionDown: (id) => moveSection(id, 'down'),
  };
}