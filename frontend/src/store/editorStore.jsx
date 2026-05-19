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
                    clonedItem.parentSectionId = null; 
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

    const targetSection = activePage.sections?.find(s => s.id === prev.activeSectionId) || activePage.sections?.[0];
    if (!targetSection) return prev;

    const newItems = prev.clipboard.map(item => ({
      ...item,
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      parentSectionId: targetSection.id,
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
}, [saveToHistory]);const updateState = useCallback((newState) => {
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

if (updatedSections.length === 0) {

  const newAutoSectionId = `s-${Date.now()}`;

  newItem.parentSectionId = newAutoSectionId;

updatedSections = [{
  id: newAutoSectionId,
  type: "ghost-section",
  isGhost: true,

  height: 9999,

  styles: {
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    padding: "0px",
    minHeight: "100%",
    position: "relative",
    pointerEvents: "none"
  },

  data: {
    items: [newItem]
  }
}];}
else {
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


   const same =
  prev.selectedElementIds.length === finalIds.length &&
  prev.selectedElementIds.every((id, i) => id === finalIds[i]);

if (same) return prev;

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
  
  navbar: {
    id: `s-${Date.now()}`,
    type: "navbar",
    height: 80, 
    styles: { 
      backgroundColor: "#ffffff", 
      borderBottom: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)"
    },
    data: {
      items: [
        { 
          id: `e-${Date.now()}-logo`, 
          type: "text", 
          text: "COMPANY", 
          x: 80, 
          y: 25, 
          width: 150, 
          height: 30, 
          styles: { fontSize: "20px", fontWeight: "800", color: "#1e293b", letterSpacing: "1.5px" } 
        },
        { 
          id: `e-${Date.now()}-nav1`, 
          type: "button", 
          text: "Home", 
          x: 450, 
          y: 25, 
          width: 40, 
          height: 30, 
          action: { type: "page", payload: "home" },
          styles: { backgroundColor: "transparent", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer" } 
        },
        { 
          id: `e-${Date.now()}-nav2`, 
          type: "button", 
          text: "Services", 
          x: 550, 
          y: 25, 
          width: 90, 
          height: 30, 
          action: { type: "page", payload: "services" },
          styles: { backgroundColor: "transparent", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer" } 
        },
        { 
          id: `e-${Date.now()}-nav3`, 
          type: "button", 
          text: "Contact", 
          x: 660, 
          y: 25, 
          width: 80, 
          height: 30, 
          action: { type: "scroll", payload: "contact-section" },
          styles: { backgroundColor: "transparent", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer" } 
        },
        { 
          id: `e-${Date.now()}-nav-btn`, 
          type: "button", 
          text: "Get Started", 
          x: 850, 
          y: 18, 
          width: 120, 
          height: 44, 
          action: { type: "url", payload: "dashboard" },
          styles: { backgroundColor: "#0f172a", color: "#ffffff", borderRadius: "6px", fontWeight: "600", fontSize: "14px" } 
        }
      ]
    }
  },

hero: {
  id: `s-${Date.now()}`,
  type: "hero",
  height: 580, 
  styles: { 
    backgroundColor: "#f8fafc", 
    backgroundImage: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)"
  },
  data: {
    items: [
      { 
        id: `e-${Date.now()}-h-tag`, 
        type: "text", 
        text: "WELCOME TO OUR PLATFORM", 
        x: 80, 
        y: 140, 
        width: 300, 
        height: 25, 
        styles: { fontSize: "12px", fontWeight: "700", color: "#2563eb", letterSpacing: "2px" } 
      },
      { 
        id: `e-${Date.now()}-h-title`, 
        type: "text", 
        text: "Build Your Vision & Share It With The World",
        x: 80, 
        y: 180, 
        width: 550, 
        height: 120, 
        styles: { fontSize: "30px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2" } 
      },
      { 
        id: `e-${Date.now()}-h-desc`, 
        type: "text", 
        text: "Discover creative tools, robust features, and custom layouts designed to bring your project online beautifully and effortlessly.",
        x: 80, 
        y: 310, 
        width: 500, 
        height: 60, 
        styles: { fontSize: "16px", color: "#475569", lineHeight: "1.6" } 
      },
      { 
        id: `e-${Date.now()}-h-btn1`, 
        type: "button", 
        text: "Get Started",
        x: 80, 
        y: 400, 
        width: 160, 
        height: 50, 
        action: { type: "url", payload: "#" },
        styles: { backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "6px", fontWeight: "600", fontSize: "15px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" } 
      },
      { 
        id: `e-${Date.now()}-h-btn2`, 
        type: "button", 
        text: "Learn More",
        x: 260, 
        y: 400, 
        width: 140, 
        height: 50, 
        action: { type: "url", payload: "#" },
        styles: { backgroundColor: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "600", fontSize: "15px" } 
      },
      {
        id: `e-${Date.now()}-h-img-bg`,
        type: "shape",
        x: 600,
        y: 150,
        width: 340,
        height: 300,
        styles: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }
      },
      {
        id: `e-${Date.now()}-h-img-placeholder`,
        type: "text",
        text: "Your Visual Asset Here",
        x: 600,
        y: 270,
        width: 340,
        height: 40,
        styles: { fontSize: "16px", color: "#94a3b8", fontWeight: "500", textAlign: "center" }
      }
    ]
  }
},
  'feature-grid': {
    id: `s-${Date.now()}`,
    type: "feature-grid",
    height: 460,
    styles: { backgroundColor: "#ffffff" },
    data: {
      items: [
        { 
          id: `feat-t-${Date.now()}`, 
          type: 'text', 
          text: 'Core Platform Functional', 
          x: 350, 
          y: 40, 
          width: 400, 
          height: 40, 
          styles: { fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#0f172a' } 
        },
        { 
          id: `feat-sub-${Date.now()}`, 
          type: 'text', 
          text: 'Engineered for scalability, standard layout patterns, and modern performance.', 
          x: 300, 
          y: 90, 
          width: 500, 
          height: 25, 
          styles: { fontSize: '15px', textAlign: 'center', color: '#64748b' } 
        },
        
{ id: `feat-sh1-${Date.now()}`, type: 'shape', x: 30, y: 160, width: 300, height: 230, styles: { backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' } },
{ id: `feat-d1-${Date.now()}`, type: 'text', text: 'Fast & Secure', x: 60, y: 195, width: 250, height: 30, styles: { fontSize: '18px', fontWeight: '700', color: '#1e293b' } },
{ id: `feat-p1-${Date.now()}`, type: 'text', text: 'Optimized performance guaranteeing high speed, modern secure frameworks, and lightweight elements.', x: 60, y: 240, width: 250, height: 80, styles: { fontSize: '14px', color: '#64748b', lineHeight: '1.5' } },

{ id: `feat-sh2-${Date.now()}`, type: 'shape', x: 360, y: 160, width: 300, height: 230, styles: { backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' } },
{ id: `feat-d2-${Date.now()}`, type: 'text', text: 'Easy Customization', x: 390, y: 195, width: 250, height: 30, styles: { fontSize: '18px', fontWeight: '700', color: '#1e293b' } },
{ id: `feat-p2-${Date.now()}`, type: 'text', text: 'Full visual control over layouts, spacing, canvas elements, dynamic styles, and custom content templates.', x: 390, y: 240, width: 250, height: 80, styles: { fontSize: '14px', color: '#64748b', lineHeight: '1.5' } },

{ id: `feat-sh3-${Date.now()}`, type: 'shape', x: 690, y: 160, width: 300, height: 230, styles: { backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' } },
{ id: `feat-d3-${Date.now()}`, type: 'text', text: 'Fully Responsive', x: 720, y: 195, width: 250, height: 30, styles: { fontSize: '18px', fontWeight: '700', color: '#1e293b' } },
{ id: `feat-p3-${Date.now()}`, type: 'text', text: 'Beautiful layout transitions adapted smoothly across all screen variants, devices, and modern viewpoints.', x: 720, y: 240, width: 250, height: 80, styles: { fontSize: '14px', color: '#64748b', lineHeight: '1.5' } },      ]
    }
  },

  footer: {
    id: `s-${Date.now()}`,
    type: "footer",
    height: 180,
    styles: { 
      backgroundColor: "#ffffff", 
      borderTop: "1px solid #e2e8f0"
    },
    data: {
      items: [
        { 
          id: `foot-brand-${Date.now()}`, 
          type: 'text', 
          text: 'COMPANY SYSTEM', 
          x: 80, 
          y: 40, 
          width: 200, 
          height: 30, 
          styles: { fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '1px' } 
        },
        { 
          id: `foot-sub-${Date.now()}`, 
          type: 'text', 
          text: 'Automated layouts and asset management platform tools.', 
          x: 80, 
          y: 80, 
          width: 350, 
          height: 40, 
          styles: { fontSize: '13px', color: '#64748b', lineHeight: '1.4' } 
        },
        { 
          id: `foot-link1-${Date.now()}`, 
          type: 'button', 
          text: 'Privacy Policy', 
          x: 600, 
          y: 40, 
          width: 110, 
          height: 30, 
          action: { type: "page", payload: "privacy" },
          styles: { backgroundColor: "transparent", fontSize: '14px', color: '#475569', textAlign: 'right' } 
        },
        { 
          id: `foot-link2-${Date.now()}`, 
          type: 'button', 
          text: 'Terms of Service', 
          x: 750, 
          y: 40, 
          width: 130, 
          height: 30, 
          action: { type: "page", payload: "terms" },
          styles: { backgroundColor: "transparent", fontSize: '14px', color: '#475569', textAlign: 'right' } 
        },
        { 
          id: `foot-line-${Date.now()}`, 
          type: 'shape', 
          x: 80, 
          y: 130, 
          width: 1080, 
          height: 1, 
          styles: { backgroundColor: '#e2e8f0' } 
        },
        { 
          id: `foot-copy-${Date.now()}`, 
          type: 'text', 
          text: '© 2026 Platform Builder. All rights reserved.', 
          x: 400, 
          y: 145, 
          width: 400, 
          height: 25, 
          styles: { fontSize: '12px', color: '#94a3b8' } 
        }
      ]
    }
  }
};

const baseTemplate = templates[type] ;
const newSection = {
  ...baseTemplate,
  id: `s-${Date.now()}`, 
  type: type            
};
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

    const targetSection = prev.pages
      .flatMap(p => p.sections)
      .find(s => s.id === sectionId);

    if (targetSection?.isGhost) {
      return {
        ...prev,
        selectedElementIds: [],
        activeElementId: null,
        activeGroupId: null
      };
    }

    saveToHistory(prev);

    return {
      ...prev,
      selectedElementIds: [],
      activeElementId: null,
      activeGroupId: null,

      pages: prev.pages.map(p => ({
        ...p,
        sections: p.sections.filter(s => s.id !== sectionId)
      }))
    };
  });
}, [saveToHistory]);


const deleteElement = useCallback((itemId) => {
  saveToHistory(state);
  
  selectItems([]); 
  
  setState(prev => {
    const newState = {
      ...prev,
      pages: prev.pages.map(p => {
        const updatedSections = p.sections.map(s => ({
          ...s,
          data: { 
            ...s.data, 
            items: (s.data.items || []).filter(it => it.id !== itemId) 
          }
        }));

       const cleanedSections = updatedSections.filter(s => {
  const isGhostSection = s.isGhost;
  const isSectionEmpty = !s.data?.items || s.data.items.length === 0;

  if (isGhostSection && isSectionEmpty) {
    return false;
  }

  return true;
});

        return {
          ...p,
          sections: cleanedSections
        };
      })
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
      {
        id: `e-${timestamp}-t`, type: "text", text: "Contact Us",
        x: 425, y: 40, width: 350, height: 40,
        styles: { fontSize: "22px", fontWeight: "bold", color: "#1e293b", textAlign: "center" }
      },
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