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
  isFormOpen: false,
    ...initialState
});
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
        const activePage = prev.pages?.find(p => p.id === prev.activePageId);
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

        if (elementsToCopy?.length > 0) {
            return { ...prev, clipboard: elementsToCopy };
        }
        return prev;
    });
}, []);

const pasteElements = useCallback(() => {
  setState(prev => {
    if (!prev.clipboard || prev.clipboard?.length === 0) return prev;

    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    saveToHistory(prev);

const targetSection =
  activePage.sections?.find(s => s.id === sectionId)
  || activePage.sections?.[0];

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
        activePageId: filtered?.length > 0 ? (prev.activePageId === pageId ? filtered[0].id : prev.activePageId) : null
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
const groupSelectedItems = useCallback(() => {
  setState(prev => {
    const selectedIds = prev.selectedElementIds || [];
    if (selectedIds.length < 2) return prev;

    saveToHistory(prev);

    const groupId = `group-${Date.now()}`;

    return {
      ...prev,
  selectedElementIds: selectedIds,
  activeGroupId: groupId,
      pages: prev.pages.map(p =>
        p.id === prev.activePageId
          ? {
              ...p,
              groups: [
                ...(p.groups || []),
               {
  id: groupId,
  elementIds: selectedIds,
  createdAt: Date.now()
}
              ],
              sections: p.sections.map(s => ({
                ...s,
                data: {
                  ...s.data,
                  items: s.data.items.map(item =>
                    selectedIds.includes(item.id)
                      ? { ...item, groupId }
                      : item
                  )
                }
              }))
            }
          : p
      )
    };
  });
}, [setState]);
const ungroupSelectedItems = useCallback(() => {
  setState(prev => {
    const selectedIds = prev.selectedElementIds || [];

    if (!selectedIds.length) return prev;

    saveToHistory(prev);

    let groupIdToRemove = null;

    const page = prev.pages.find(p => p.id === prev.activePageId);

    const group = page?.groups?.find(g =>
      g.elementIds.some(id => selectedIds.includes(id))
    );

    if (!group) return prev;

    groupIdToRemove = group.id;

    return {
      ...prev,
      pages: prev.pages.map(p =>
        p.id === prev.activePageId
          ? {
              ...p,
              groups: p.groups.filter(g => g.id !== groupIdToRemove),
              sections: p.sections.map(s => ({
                ...s,
                data: {
                  ...s.data,
                  items: s.data.items.map(item =>
                    group.elementIds.includes(item.id)
                      ? { ...item, groupId: null }
                      : item
                  )
                }
              }))
            }
          : p
      )
    };
  });
}, [setState]);
const updateCanvasStyles = useCallback((newStyles) => {
  setState(prev => {
    saveToHistory(prev); 
    return {
      ...prev,
      canvasStyles: { ...prev.canvasStyles, ...newStyles }
    };
  });
}, [saveToHistory]);

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
    const activePage = prev.pages?.find(p => p.id === pageId);
    
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
    input: {
    width: 250,
    height: 45,
    text: "",
    styles: { 
      backgroundColor: "#ffffff", 
      color: "#000000", 
      borderRadius: "6px",
      border: "1px solid #cbd5e1",
      padding: "10px"
    }
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
    },
  };

  const config = elementDefaults[type] || elementDefaults.default;

  const finalWidth = extraData.width || config.width;
  const finalHeight = extraData.height || config.height;
const finalX = Math.max(
  20,
  (typeof x === "number" ? x : 100) - finalWidth / 2
);

const finalY = Math.max(
  20,
  (typeof y === "number" ? y : 100) - finalHeight / 2
);
  setState(prev => {
    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

const newItem = {
  id: finalNewId,
  type,
    parentSectionId: sectionId || null,
  x: finalX,
  y: finalY,
  width: finalWidth,
  height: finalHeight,
  text: extraData.text !== undefined ? extraData.text : config.text,
  action: {
    type: "none", 
    payload: "" 
  },
  styles: {
    ...config.styles, 
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    ...(extraData.styles || {}),
    
    ...Object.fromEntries(
      Object.entries(extraData.styles || {}).filter(([key]) => 
        !['position', 'top', 'left', 'transform'].includes(key)
      )
    ),
  }
};    
let updatedSections = [...activePage.sections];

if (updatedSections?.length === 0) {
  const newAutoSectionId = `s-${Date.now()}`;

  const isLargeSection = ['navbar', 'hero', 'footer'].includes(type);

  newItem.parentSectionId = newAutoSectionId;

  updatedSections = [{
    id: newAutoSectionId,
    type: isLargeSection ? type : "blank",
    height: isLargeSection ? 600 : 100,
    styles: {
      backgroundColor: isLargeSection ? "#ffffff" : "transparent",
      padding: "0px",
      minHeight: isLargeSection ? "400px" : "50px",
      zIndex: 1
    },
    data: {
      items: [newItem]
    }
  }];
}else {
      const targetId = sectionId || updatedSections[0].id;
      newItem.parentSectionId = targetId;
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
    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
const groups = activePage?.groups || [];
    
    let finalIds = [...ids];

    groups.forEach(group => {
      const hasSelectedMember = group.elementIds.some(memberId => ids.includes(memberId));
      if (hasSelectedMember) {
        finalIds = [...finalIds, ...group.elementIds];
        const activeGroup = groups.find(group =>
  group.elementIds.includes(ids[0])
);
      }
    });
    const activeGroup = groups.find(group =>
  ids.some(id => group.elementIds.includes(id))
);

    finalIds = [...new Set(finalIds)];


    if (JSON.stringify(prev.selectedElementIds) === JSON.stringify(finalIds)) {
      return prev;
    }

    return {
      ...prev,
selectedElementIds: finalIds,
activeGroupId: activeGroup?.id || null,
      activeElementId: finalIds?.length > 0 ? finalIds[0] : null
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
    height: 150,
    styles: { 
        backgroundColor: "transparent", 
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
  setState(prev => {
    saveToHistory(prev);
    const newState = {
      ...prev,
      pages: prev.pages.map(p => ({
        ...p,
        sections: p.sections.filter(s => s.id !== sectionId)
      }))
    };
    return newState;
  });
}, [saveToHistory]);
const deleteElement = useCallback((itemId) => {
  saveToHistory(state);
  
  selectItems([]); 
  
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
}, [state, saveToHistory, selectItems]);
const undo = useCallback(() => {
  setHistory((prevHistory) => {
    if (prevHistory?.length === 0) return prevHistory;

    const previousState = safeClone(prevHistory[prevHistory?.length - 1]);
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
    if (prevRedo?.length === 0) return prevRedo;

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
                items: s.data.items.map(it => {
                  if (it.id === itemId) {

                    return {
                      ...it,
                      ...data,
                      styles: { 
                        ...(it.styles || {}), 
                        ...(data?.styles || {})
                      }
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
}, [saveToHistory]); 


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
    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const elementsToCopy = [];
    activePage.sections.forEach(section => {
      section.data.items.forEach(item => {
        if (elementIds.includes(item.id)) elementsToCopy.push(safeClone(item));
      });
    });
    if (elementsToCopy?.length === 0) return prev;
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
    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
    if (!activePage) return prev;

    const sections = [...activePage.sections];
    const index = sections?.findIndex(s => s.id === sectionId);
    
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections?.length - 1)) {
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


const injectFormTemplate = useCallback((sectionId) => {
  setState(prev => {
    const activePage = prev.pages?.find(p => p.id === prev.activePageId);
    if (!activePage || !sectionId) return prev;

    saveToHistory(prev);
    const timestamp = Date.now();
    const containerId = `e-${timestamp}-container`;

    const formElements = [
      // 1. الحاوية (الخلفية)
      {
        id: containerId,
        type: "shape",
        x: 400, y: 20, width: 400, height: 350,
        styles: { 
          backgroundColor: "#ffffff", 
          borderRadius: "12px", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0"
        }
      },
      // 2. العنوان داخل الحاوية
      {
        id: `e-${timestamp}-t`, type: "text", text: "Contact Us",
        x: 425, y: 40, width: 350, height: 40,
        styles: { fontSize: "22px", fontWeight: "bold", color: "#1e293b", textAlign: "center" }
      },
      // 3. حقول الإدخال
      {
        id: `e-${timestamp}-n`, type: "input", text: "Your Name",
        x: 425, y: 100, width: 350, height: 45,
        styles: { borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }
      },
      {
        id: `e-${timestamp}-e`, type: "input", text: "Email Address",
        x: 425, y: 160, width: 350, height: 45,
        styles: { borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }
      },
      // 4. زر الإرسال
      {
        id: `e-${timestamp}-b`, type: "button", text: "Send Message",
        x: 425, y: 230, width: 350, height: 45,
        action: { type: "submit_form", payload: "" },
        styles: { backgroundColor: "#4f46e5", color: "#ffffff", borderRadius: "6px", fontWeight: "600" }
      }
    ];

    return {
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? {
        ...p,
        sections: p.sections.map(s => s.id === sectionId ? {
          ...s,
          data: { ...s.data, items: [...(s.data.items || []), ...formElements] }
        } : s)
      } : p)
    };
  });
}, [saveToHistory]);
const handleAction = useCallback((action) => {
  if (!action || action.type === "none") return;

  switch (action.type) {
    case "url":
      const url = action.payload.startsWith("http") ? action.payload : `https://${action.payload}`;
      window.open(url, "_blank");
      break;

    case "page":
      setState(prev => ({ ...prev, activePageId: action.payload }));
      break;

    case "scroll":
      const element = document.getElementById(action.payload);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      break;
  }
}, []);

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
    injectFormTemplate, 
    handleAction,
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
  groupSelectedItems,
  ungroupSelectedItems,
  };
}