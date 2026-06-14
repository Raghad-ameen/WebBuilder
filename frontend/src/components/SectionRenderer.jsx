import React, { useRef, useState, useEffect, useMemo } from "react";
import axios from "axios"; 
import { Trash2, Image as ImageIcon } from "lucide-react";
import Moveable from "react-moveable";
import SectionWrapper from "./SectionWrapper";
import CanvasElement from "./CanvasElement";
import Selecto from "react-selecto";
import "./SectionRenderer.css"; 
import HoverWrapper from "./HoverWrapper";
import TextElement from "./editor/elements/TextElement";
import ImageElement from "./editor/elements/ImageElement";
import ShapeElement from "./editor/elements/ShapeElement";
import ButtonElement from "./editor/elements/ButtonElement";
import LinkElement from "./editor/elements/LinkElement";
import InputElement from "./editor/elements/InputElement";

export default function SectionRenderer({ section, selectedElementIds = [], onSelect, store, canvasScale = 1 }) {
  const { deleteSection, deleteElement, state, updateSection, previewUpdateItem, updateItem, moveSectionUp, moveSectionDown } = store;
  const activePageId = state.activePageId; 
  const allSections = state.pages.find(p => p.id === activePageId)?.sections || [];
  const itemRefs = useRef({});
  const BASE_WIDTH = 1200;
  const isSelected = state.selectedSectionId === section.id;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isActive = state.activeSectionId === section.id;
  
const isFormVisible = !state.isPreviewMode 
    ? isFormOpen
    : (state.isFormOpen && state.activeFormSectionId === section.id);
      const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const sectionRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [targets, setTargets] = useState([]); 
  const validTargets = targets.filter(Boolean);

  const [interactionMode, setInteractionMode] = useState("select"); 

  const activePage = state.pages.find(p => p.id === activePageId);
  const sectionIndex = activePage?.sections?.findIndex(s => s.id === section.id) ?? 0;

  const blurFilter = section.styles?.blur ? `blur(${section.styles.blur}px)` : "";
  const brightnessFilter = section.styles?.brightness ? `brightness(${section.styles.brightness}%)` : "";
  const contrastFilter = section.styles?.contrast ? `contrast(${section.styles.contrast}%)` : "";
  const saturateFilter = section.styles?.saturate ? `saturate(${section.styles.saturate}%)` : "";
  const grayscaleFilter = section.styles?.grayscale ? `grayscale(${section.styles.grayscale}%)` : "";
  const sepiaFilter = section.styles?.sepia ? `sepia(${section.styles.sepia}%)` : "";
  const hueRotateFilter = section.styles?.hueRotate ? `hue-rotate(${section.styles.hueRotate}deg)` : "";
  const invertFilter = section.styles?.invert ? `invert(${section.styles.invert}%)` : "";

  const [visibleLinkedElements, setVisibleLinkedElements] = useState({});

  const allLinkedTargetIds = useMemo(() => {
    const targets = [];
    section.data?.items?.forEach(item => {
      if (item.action?.type === 'link_element' && Array.isArray(item.action?.payload)) {
        targets.push(...item.action.payload);
      }
    });
    return targets;
  }, [section.data?.items]);


  const cleanFilter = useMemo(() => {
    return [
      blurFilter,
      brightnessFilter,
      contrastFilter,
      saturateFilter,
      grayscaleFilter,
      sepiaFilter,
      hueRotateFilter,
      invertFilter
    ].filter(Boolean).join(" ") || "none";
  }, [
    section.styles?.blur,
    section.styles?.brightness,
    section.styles?.contrast,
    section.styles?.saturate,
    section.styles?.grayscale,
    section.styles?.sepia,
    section.styles?.hueRotate,
    section.styles?.invert
  ]);

  useEffect(() => {
    const handleClick = (e) => {
      if (state.isPreviewMode && !e.target.closest('.canvas-element') && !e.target.closest('.modal-content-box')) {
        store.setState(prev => ({
          ...prev,
          activeFormSectionId: null
        }));
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [state.isPreviewMode]);

  const handleDoubleClick = (e) => {
    if (state.isPreviewMode) return;
    e.stopPropagation();
    const range = document.createRange();
    range.selectNodeContents(e.target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
const [showPopupSuccessModal, setShowPopupSuccessModal] = useState(false);

const handleSubmitForm = async (sectionId, action, isPopup = false, clickedItemId = null) => {
  if (!state.isPreviewMode) return;

  if (action?.type === 'link_element' && Array.isArray(action?.payload)) {
    setVisibleLinkedElements(prev => {
      const updated = { ...prev };
      action.payload.forEach(targetId => {
        updated[targetId] = !updated[targetId];
      });
      return updated;
    });
    return; 
  }

  const sectionItems = section?.data?.items || [];
  const clickedItem = sectionItems.find(item => item.id === clickedItemId);

  if (action?.type === 'submit_form' && action?.isPopupForm && !clickedItem?.belongsToPopup) {
    store.setState(prev => ({
      ...prev,
      isFormOpen: true,
      activeFormSectionId: sectionId
    }));
    return;
  }

  let finalIsPopup = isPopup;
  if (action?.type === 'submit') {
    finalIsPopup = false;
  } else {
    const hasPopupFields = sectionItems.some(item => item.belongsToPopup === true || item.action?.isPopupForm === true);
    const hasNormalFields = sectionItems.some(item => item.type === 'input' && !item.belongsToPopup && !item.action?.isPopupForm);
    
    if (action?.isPopupForm || (hasPopupFields && !hasNormalFields)) {
      finalIsPopup = true;
    }
  }

  let formFields = [];
  const hasSpecificBindings = action?.payload && Array.isArray(action.payload) && action.payload.length > 0;

  if (hasSpecificBindings) {
    formFields = sectionItems.filter(item => item.type === 'input' && action.payload.includes(item.id));
  } else {
    formFields = sectionItems.filter(item => {
      if (item.type !== 'input') return false;
      if (action?.type === 'submit') return !item.belongsToPopup;
      if (finalIsPopup) {
        return item.type === "input";
      } else {
        return !item.belongsToPopup && !item.action?.isPopupForm;
      }
    });
  }

  const structuredSubmissionData = formFields.map(field => {
    const inputEl = document.getElementById(`input-${field.id}`);
    return {
      field_id: field.id,
      field_key: field.name || field.label || `field_${field.id}`,
      value: inputEl ? inputEl.value : "",
      input_type: field.inputType || "text",
      data_type: field.dataType || "Any"
    };
  });

  console.log("🚀 Sending Custom Bound Form Data to Backend:", structuredSubmissionData);

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/forms/submit/', {
      section_id: sectionId,
      is_popup: finalIsPopup,
      submission_data: structuredSubmissionData 
    });

    if (response.status === 201 || response.status === 200) {
      console.log("✅ Data Saved Successfully in Django!", response.data);

      setVisibleLinkedElements(prev => {
        const cleared = { ...prev };
        if (Array.isArray(allLinkedTargetIds)) {
          allLinkedTargetIds.forEach(targetId => { cleared[targetId] = false; });
        }
        return cleared;
      });
      setIsFormOpen(false);
      store.setState((prev) => ({ 
        ...prev, 
        activeFormSectionId: null, 
        isFormOpen: false,
        selectedElementIds: [] 
      }));

      if (finalIsPopup) {
        setShowPopupSuccessModal(true);
        setShowSuccessModal(false);
      } else {
        setShowSuccessModal(true);
        setShowPopupSuccessModal(false);
      }      
      
      formFields.forEach(field => {
        const inputEl = document.getElementById(`input-${field.id}`);
        if (inputEl) inputEl.value = "";
      });
    }  
  } catch (error) {
    console.error("❌ فشل الإرسال للباكيند. تفاصيل الخطأ:", error.response?.data || error.message);
  }
};


const handleItemAction = (item) => {
    console.log("Button clicked", item);

    if (!state.isPreviewMode) return;
    const { action } = item;
    if (!action || !action.type) return;

    switch (action.type) {

case 'CLOSE_POPUP':
        console.log("🎯 تم الضغط على زر إغلاق الفورم الرمادي (X)");
        
        setVisibleLinkedElements(prev => {
          const cleared = { ...prev };
          if (Array.isArray(allLinkedTargetIds)) {
            allLinkedTargetIds.forEach(targetId => { cleared[targetId] = false; });
          }
          return cleared;
        });

        setIsFormOpen(false);
      case 'submit_form':
        handleSubmitForm(section.id, action);
        break;
      
      case 'link_element':
        if (Array.isArray(action.payload)) {
          setVisibleLinkedElements(prev => {
            const updated = { ...prev };
            action.payload.forEach(targetId => {
              updated[targetId] = !updated[targetId];
            });
            return updated;
          });
        }
        break;

      case 'page':
        if (action.payload) {
          store.setState(prev => ({
            ...prev,
            activePageId: action.payload,
            selectedElementIds: [],
            selectionGroupMode: false,
          }));
        }
        break;

      case 'url':
        if (action.payload) {
          let targetUrl = action.payload;
          if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
          }
          window.open(targetUrl, '_blank');
        }
        break;

      case 'scroll':
        if (action.payload) {
          const targetSection = document.getElementById(action.payload);
          targetSection?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'popup': 
        store.setState(prev => ({ ...prev, activePopupId: action.payload }));
        break;

      case 'email': 
        if (action.payload) {
          window.location.href = `mailto:${action.payload}`;
        }
        break;

      default:
        console.log("Unknown action type:", action.type);
    }
  };


  const isSectionSelected = state.selectedSectionId === section.id;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    if (state.isPreviewMode) {
      setTargets([]);
      return;
    }
    if (selectedElementIds && selectedElementIds.length > 0) {
      setTargets(selectedElementIds.map(id => document.getElementById(id)).filter(Boolean));
    } else if (state.selectedSectionId === section.id) {
      setTargets([sectionRef.current].filter(Boolean));
    } else {
      setTargets([]);
    }
  }, [selectedElementIds, state.selectedSectionId, section.id, state.isPreviewMode]);

useEffect(() => {
  if (state.isPreviewMode) {
    setIsFormOpen(false);
    setVisibleLinkedElements({});
  }
}, [state.isPreviewMode]);

  return (
    <div
      ref={sectionRef}
      id={section.id}
className={`section-container section-${section.id} ${isSectionSelected ? 'selected-section' : ''}`}
onMouseDown={(e) => {
        if (section.isGhost || state.isPreviewMode) return;

        if (
          e.target.closest('.canvas-element') || 
          e.target.closest('.trash-button-class') || 
          e.target.closest('.section-toolbar') ||
          e.target.closest('.moveable-control-box')
        ) {
          return;
        }

        if (e.target.classList.contains('selecto-area') || e.target.closest('.selecto-area')) {
          return; 
        }

        if (e.button !== 0) return; 

        store.setState(prev => ({
          ...prev,
          selectedSectionId: section.id,
          selectedElementIds: prev.selectionGroupMode ? prev.selectedElementIds : [],
          selectionGroupMode: prev.selectionGroupMode
        }));
      }}     
      onMouseUp={(e) => {
        if (state.isPreviewMode || !state.isDraggingNow || !state.draggingType) return;

        const sectionTypes = ['hero', 'navbar', 'footer', 'feature-grid'];

        if (sectionTypes.includes(state.draggingType)) {
          let initialItems = [];
          
          if (state.draggingType === 'feature-grid') {
            initialItems = [
              { id: `feat-title-${Date.now()}`, type: 'text', text: 'Our Features', x: 500, y: 30, width: 200, height: 40, styles: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' } },
              { id: `feat-desc-${Date.now()}`, type: 'text', text: 'Feature description text goes here.', x: 450, y: 80, width: 300, height: 60, styles: { fontSize: '14px', textAlign: 'center', color: '#64748b' } }
            ];
          } else if (state.draggingType === 'footer') {
            initialItems = [
              { id: `foot-copy-${Date.now()}`, type: 'text', text: '© 2026 Store Name. All rights reserved.', x: 450, y: 40, width: 300, height: 30, styles: { fontSize: '14px', textAlign: 'center', color: '#94a3b8' } }
            ];
          }

          if (store.addSection) {
            store.addSection(state.draggingType, initialItems);
          }

          store.setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
          return;
        }
        e.stopPropagation();

        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvasScale;
        const y = (e.clientY - rect.top) / canvasScale;

        const defaultWidth = 150;
        const defaultHeight = 45; 

        let shapeStyles = {};
        let detectedShapeType = "square";

        if (state.draggingType === "shape") {
          shapeStyles = {
            backgroundColor: state.draggingShapeData?.styles?.backgroundColor || "#4f46e5",
            background: state.draggingShapeData?.styles?.background || "none",
            clipPath: state.draggingShapeData?.styles?.clipPath || "none",
            borderRadius: state.draggingShapeData?.styles?.borderRadius || "0px",
            borderWidth: state.draggingShapeData?.styles?.borderWidth || "0px",
            borderColor: state.draggingShapeData?.styles?.borderColor || "transparent"
          };
          
          if (state.draggingShapeData?.shapeType) {
            detectedShapeType = state.draggingShapeData.shapeType;
          } else if (shapeStyles.clipPath && shapeStyles.clipPath !== "none") {
            const cleanClip = shapeStyles.clipPath.replace(/\s+/g, '').toLowerCase();
            if (cleanClip.includes("polygon(50%0%") || cleanClip.includes("50%0")) detectedShapeType = "triangle";
            else if (cleanClip.includes("50%100%")) detectedShapeType = "rhombus";
            else detectedShapeType = "custom-shape";
          } else if (shapeStyles.borderRadius === "50%") {
            detectedShapeType = "circle";
          }
        }

        store.addItemAtPosition(
          state.draggingType,
          x,
          y,
          section.id,
          {
            width: state.draggingType === 'input' || state.draggingType === 'button' ? 250 : defaultWidth,
            height: state.draggingType === 'input' || state.draggingType === 'button' ? 45 : defaultHeight,
            shapeType: detectedShapeType,
            styles: shapeStyles
          }
        );
        store.setState(prev => ({
          ...prev,
          isDraggingNow: false,
          draggingType: null,
          draggingShapeData: null
        }));
      }}
style={{
        ...section.styles, 
        position: section.styles?.position ?? "relative",
        pointerEvents: section.isGhost ? "none" : "auto",
        left: section.styles?.left || 0,
        top: section.styles?.top || 0,
        
        width: state.isPreviewMode ? "100%" : (section.styles?.width || "100%"),
        
        height: section.isGhost
          ? "0px"
          : section.height
            ? `${section.height}px`
            : (section.type === 'footer' ? "120px" : section.type === 'feature-grid' ? "400px" : "500px"),
        minHeight: section.isGhost ? "0px" : (section.type === 'footer' ? "80px" : "100px"),
        zIndex: section.isGhost ? 0 : allSections.length - sectionIndex,
        overflow: "hidden",
        background: section.styles?.background || "transparent",
        backgroundColor: section.styles?.backgroundColor || "transparent",
        boxShadow: section.styles?.boxShadow,
        filter: section.styles?.filter,
      }}      
      
      
      > 
        
      {isSectionSelected && !state.isPreviewMode && !section.isGhost && (
        <div style={styles.sectionToolbar}>
          <button 
            onPointerDown={(e) => { 
              e.stopPropagation(); 
              deleteSection(section.id); 
              }} 
            style={{...styles.toolBtn, color: '#ef4444'}}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
<div style={state.isPreviewMode ? {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        height: "100%",
        overflow: "visible"
      } : {
        position: "relative",
        width: "100%",
        height: "100%"
      }}>

        <div 
          style={state.isPreviewMode ? {
            width: "1200px",
            minWidth: "1200px",
            position: "relative",
            height: "100%",
            flexShrink: 0,
          } : {
            display: "contents"
          }}
        >
          
          {(section.data?.items || []).map((item, index) => {
        const isSelected = state.selectedElementIds.includes(item.id);
        const isMobileOrTablet = typeof window !== "undefined" && window.innerWidth < 1024;
        
        const resolvedZIndex = isSelected ? 100000 : (item.styles?.zIndex !== undefined ? parseInt(item.styles.zIndex) : (2000 + index));

        const getCleanFilter = () => {
          if (!item.styles?.filter || item.styles.filter === "none") return "none";
          return item.styles.filter.replace(/NaN%/g, "100%");
        };
        const cleanFilter = getCleanFilter();

        const isTargetElement = allLinkedTargetIds.includes(item.id);
        const isCurrentlyTriggered = !!visibleLinkedElements[item.id];
        
const shouldHideInPreview = state.isPreviewMode && isTargetElement && (!isCurrentlyTriggered || Object.keys(visibleLinkedElements).length === 0);
        const baseStyles = item.styles || {};
        const finalStyles = {
          ...baseStyles,
          display: shouldHideInPreview ? "none" : ((baseStyles.display === "none" ? "block" : baseStyles.display) || "block"),
        };

        const uniqueClassName = `hover-el-${item.id}`;
        const transitionSpeed = baseStyles.transitionSpeed ? `${baseStyles.transitionSpeed}s` : '0.2s';
        
        const dynamicHoverStyles = state.isPreviewMode ? `
          .${uniqueClassName} {
            transition: all ${transitionSpeed} ease !important;
          }
          .${uniqueClassName}:hover {
            ${baseStyles.hoverBg ? `background-color: ${baseStyles.hoverBg} !important;` : ''}
            ${baseStyles.hoverColor ? `color: ${baseStyles.hoverColor} !important;` : ''}
            ${baseStyles.hoverScale && baseStyles.hoverScale !== 'none' ? `transform: scale(${baseStyles.hoverScale}) !important;` : ''}
          }
        ` : '';

        return (
          <React.Fragment key={item.id}>
            {state.isPreviewMode && <style dangerouslySetInnerHTML={{ __html: dynamicHoverStyles }} />}

            <div
              ref={(el) => (itemRefs.current[item.id] = el)}
              id={item.id}
              className={`canvas-element ${isSelected ? 'selected' : ''} ${uniqueClassName}`}
              onMouseDown={(e) => {
                if (state.isPreviewMode) return;
                setInteractionMode("move");
                const isCtrl = e.ctrlKey || e.metaKey;
                if (item.isEditing) return;

                if (isCtrl) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const currentSelected = Array.isArray(state.selectedElementIds) ? state.selectedElementIds.map(String) : [];
                    const targetId = String(item.id);
                    let newSelection;

                    if (currentSelected.includes(targetId)) {
                        newSelection = currentSelected.filter(id => id !== targetId);
                    } else {
                        newSelection = [...currentSelected, targetId];
                    }

                    store.selectItems(newSelection);
                    store.setState(prev => ({ ...prev, selectionGroupMode: newSelection.length > 1 }));
                    return;
                }

                if (!e.ctrlKey && !e.metaKey) {
                  e.stopPropagation();
                }

                store.setState(prev => ({ ...prev, selectedSectionId: null }));
                store.selectItems([String(item.id)]);
              }}
              onMouseUp={() => {
                  if (!state.isPreviewMode) setInteractionMode("select");
              }}
style={{
                position: "absolute", 
                
                left: `${item.x}px`,     
                top: `${item.y}px`,
                width: `${item.width}px`, 
                height: `${item.height}px`,
                
                zIndex: resolvedZIndex,
                margin: isMobileOrTablet ? "15px auto" : "0", 
                
                textAlign: item.type === 'button' ? 'center' : undefined,
                lineHeight: item.type === 'button' ? `${item.height}px` : undefined,
                cursor: state.isPreviewMode ? "default" : (item.isEditing ? "text" : "move"),
                
                overflow: "hidden", 
                
                pointerEvents: "auto",
                willChange: "left, top, width, height",
                backfaceVisibility: 'hidden',
                perspective: 1000,
                WebkitFontSmoothing: 'antialiased',
                boxShadow: "none",
                ...finalStyles,
              }}             
             
             
             >

              {isSelected && !item.isEditing && !state.isPreviewMode && (
                <div
                  className={`trash-button-class`}
                  onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                  onClick={(e) => { e.stopPropagation(); deleteElement(item.id); }}
                  style={{
                    position: "absolute",
                    top: "-40px", 
                    right: "0px",
                    width: "28px",
                    height: "28px",
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2147483647, 
                    pointerEvents: "auto",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    border: "2px solid white",
                  }}
                >
                  <Trash2 size={14} color="white" strokeWidth={3} />
                </div>
              )}

              {item.type === "text" && (
                <TextElement
                  item={item}
                  state={state}
                  store={store}
                  section={section}
                  isMobile={isMobile}
                  cleanFilter={cleanFilter}
                />
              )}

              {item.type === "image" && (
                <ImageElement
                  item={item}
                  state={state}
                  isSelected={isSelected}
                  cleanFilter={cleanFilter}
                  updateItem={updateItem}
                  activePageId={activePageId}
                  section={section}
                />
              )}

              {item.type === "shape" && (
                <ShapeElement
                  item={item}
                  state={state}
                  cleanFilter={cleanFilter}
                />
              )}

              {item.type === "button" && (
                <ButtonElement
                  item={item}
                  state={state}
                  isSelected={isSelected}
                  cleanFilter={cleanFilter}
                  store={store}
                  section={section}
                  isFormVisible={isFormVisible}
                  handleSubmitForm={handleSubmitForm}
                  handleItemAction={handleItemAction}
                />
              )}

              {item.type === "link" && (
                <LinkElement
                  item={item}
                  store={store}
                  state={state}
                  isSelected={isSelected}
                  cleanFilter={cleanFilter}
                  updateItem={updateItem}
                  activePageId={activePageId}
                  section={section}
                  isFormVisible={isFormVisible}
                  handleSubmitForm={handleSubmitForm}
                  handleItemAction={handleItemAction}
                  handleDoubleClick={handleDoubleClick}
                />
              )}

              {item.type === "input" && (
                <InputElement
                  item={item}
                  state={state}
                  cleanFilter={cleanFilter}
                />
              )}
            </div>
          </React.Fragment>
        );
      })}
      {validTargets.length > 0 && !state.isPreviewMode && !isSelecting && (
        <Moveable
          target={validTargets.length === 1 ? validTargets[0] : validTargets}
          draggable={true}
          resizable={true}
          origin={false}
          zoom={1 / canvasScale}
          throttleDrag={0}
          throttleResize={0}
          renderDirections={validTargets.length > 1 ? ["nw", "ne", "sw", "se"] : ["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          keepRatio={false}
          useResizeObserver={true}
          useMutationObserver={true}
          snappable={true}
        bounds={{
  left: 0,
  top: 0,
  right: sectionRef.current?.offsetWidth || 1200,
  bottom: sectionRef.current?.offsetHeight || 9999
}}
          snapThreshold={5}
          snapGap={true}
          snapElement={true}
          snapVertical={true}
          snapHorizontal={true}
          snapCenter={true}
          verticalGuidelines={[(sectionRef.current?.offsetWidth || 0) / 2]}
          horizontalGuidelines={[(sectionRef.current?.offsetHeight || 0) / 2]}
          snapContainer={document.querySelector("#main-canvas")}
          elementGuidelines={[
              document.querySelector("#main-canvas"),
              ...Array.from(document.querySelectorAll(".canvas-element")) 
          ].filter(Boolean)}    
          portalContainer={sectionRef.current}
          isDisplaySnapDigit={false} 
          isDisplayInnerSnapDigit={false}

     onDrag={({ target, left, top }) => {
            if (target.classList.contains('section-container')) {
              target.style.top = `${top}px`;
            } else {
              const sectionEl = target.closest('.section-container');
              const parentHeight = sectionEl ? sectionEl.offsetHeight : (section.height || 500);

              const width = target.offsetWidth;
              const height = target.offsetHeight;

              const boundedLeft = Math.max(0, Math.min(left, 1200 - width));
              const boundedTop = Math.max(0, Math.min(top, parentHeight - height));
              
              target.style.left = `${boundedLeft}px`;
              target.style.top = `${boundedTop}px`;
            }
          }}
         onDragEnd={({ target, lastEvent }) => {
            if (!lastEvent) return;
            if (target.classList.contains('section-container')) {
              updateSection(target.id, { styles: { ...section.styles, top: lastEvent.top } });
            } else {
              const sectionEl = target.closest('.section-container');
              const parentHeight = sectionEl ? sectionEl.offsetHeight : (section.height || 500);
              const boundedX = Math.max(0, Math.min(lastEvent.left, 1200 - target.offsetWidth));
              const boundedY = Math.max(0, Math.min(lastEvent.top, parentHeight - target.offsetHeight));

              updateItem(activePageId, section.id, target.id, { x: boundedX, y: boundedY });
            }
          }}
      onResize={({ target, width, height, drag }) => {
  const left = drag.beforeTranslate[0];
  const top = drag.beforeTranslate[1];

  const parentHeight =
    target.parentElement?.offsetHeight || 9999;

  const maxWidth = 1200 - left;
  const maxHeight = parentHeight - top;

  const boundedWidth = Math.max(
    20,
    Math.min(width, maxWidth)
  );

  const boundedHeight = Math.max(
    20,
    Math.min(height, maxHeight)
  );

  target.style.width = `${boundedWidth}px`;
  target.style.height = `${boundedHeight}px`;
  target.style.left = `${left}px`;
  target.style.top = `${top}px`;
}}

          
          onResizeEnd={({ target, lastEvent }) => {
            if (!lastEvent) return;
            if (target.classList.contains('section-container')) {
              if (store.updateSectionHeight) {
                store.updateSectionHeight(target.id, lastEvent.height);
              } else {
                updateSection(target.id, { height: lastEvent.height });
              }
            } else {
              updateItem(activePageId, section.id, target.id, {
                width: lastEvent.width,
                height: lastEvent.height,
                x: lastEvent.drag.left,
                y: lastEvent.drag.top
              });
            }
          }}
          onDragGroup={({ events }) => {
              events.forEach(({ target, left, top }) => {
                  target.style.left = `${left}px`;
                  target.style.top = `${top}px`;
              });
          }}
          onDragGroupEnd={({ events }) => {
              events.forEach(({ target }) => {
                  store.updateItem(activePageId, section.id, target.id, { 
                      x: parseFloat(target.style.left) || 0, 
                      y: parseFloat(target.style.top) || 0
                  });
              });
          }}
          onResizeGroup={({ events }) => {
              events.forEach(({ target, width, height, drag }) => {
                  target.style.width = `${width}px`;
                  target.style.height = `${height}px`;
                  target.style.left = `${drag.left}px`;
                  target.style.top = `${drag.top}px`;
              });
          }}
          onResizeGroupEnd={({ events }) => {
              events.forEach(({ target }) => {
                  store.updateItem(activePageId, section.id, target.id, {
                      width: parseFloat(target.style.width) || 100,
                      height: parseFloat(target.style.height) || 100,
                      x: parseFloat(target.style.left) || 0,
                      y: parseFloat(target.style.top) || 0
                  });
              });
          }}
        />
      )}  

      {!state.isPreviewMode && (
        <Selecto
          container={document.querySelector("#main-canvas")}
          dragContainer={document.querySelector("#main-canvas")}
          rootContainer={document.querySelector("#main-canvas")}
          portalContainer={document.querySelector("#main-canvas")}
          selectableTargets={[".canvas-element"]}
          hitRate={0}
          selectByClick={false}
          selectFromInside={false}
          preventDragFromInside={true}
          checkInput={false}
          toggleContinueSelect={["shift"]}
          onDragStart={(e) => {
            const t = e.inputEvent.target;
            if (
              t.closest(".moveable-control-box") ||
              t.closest(".section-toolbar") ||
              t.closest(".trash-button-class")
            ) {
              e.stop();
              return;
            }
            if (t.closest(".canvas-element")) {
              return;
            }
            const rect = sectionRef.current?.getBoundingClientRect();
            if (!rect) return;
            e.datas.offset = [
              rect.left + window.scrollX,
              rect.top + window.scrollY
            ];
          }}
          onSelect={(e) => {
            const ids = e.selected.map(el => el.id);
            store.selectItems(ids);
            store.setState(prev => ({
              ...prev,
              selectionGroupMode: ids.length > 1
            }));
          }}
        />
      )}
</div>
</div>
      {showSuccessModal && (
        <div style={modalStyles.overlay} className="modal-content-box">
          <div style={modalStyles.content}>
            <h2 style={{ margin: "10px 0", color: "#1e293b", fontSize: "20px" }}>Registered successfully</h2>
            <button style={modalStyles.btn} onClick={() => setShowSuccessModal(false)}>
              ok
            </button>
          </div>
        </div>
      )}

      {showPopupSuccessModal && (
      <div style={modalStyles.overlay} className="modal-content-box">
        <div style={modalStyles.content}>
          <span style={modalStyles.icon}>🎉</span>
          <h2 style={{ margin: "10px 0", color: "#1e293b", fontSize: "20px" }}>
             Successful!
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
            Your data has been successfully saved. We look forward to your wonderful visit!
          </p>
          <button style={modalStyles.btn} onClick={() => setShowPopupSuccessModal(false)}>
            Awesome
          </button>
        </div>
      </div>
    )}

    
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 999999,
    backdropFilter: 'blur(4px)'
  },
  content: {
    background: '#fff', padding: '30px', borderRadius: '16px',
    textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    maxWidth: '400px', width: '90%', border: '1px solid #e2e8f0'
  },
  icon: { fontSize: '48px', display: 'block', marginBottom: '10px' },
  btn: {
    background: '#4f46e5', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
    marginTop: '5px', fontSize: '15px', fontWeight: 'bold', width: '100%',
    transition: 'background 0.2s'
  }
};

const styles = {
  sectionToolbar: {
    position: 'absolute',
    top: '-35px',
    left: '10px',
    display: 'flex',
    gap: '5px',
    background: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    zIndex: 1000
  },
  toolBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};