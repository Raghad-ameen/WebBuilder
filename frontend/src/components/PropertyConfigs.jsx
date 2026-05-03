export const PROPERTY_CONTROLS = {
  common: [
    { section: "Layout", label: "Opacity", field: "opacity", type: "range", min: 0, max: 1, step: 0.1 },
    { section: "Layout", label: "Z-Index", field: "zIndex", type: "number" },
    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },
    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },
    { section: "Border", label: "Border Color", field: "borderColor", type: "color" },
    { section: "Border", label: "Style", field: "borderStyle", type: "select", options: ["none", "solid", "dashed", "dotted", "double"] },
    { section: "Shadow", label: "Shadow Color", field: "shadowColor", type: "color" },
    { section: "Shadow", label: "Blur", field: "shadowBlur", type: "number", unit: "px" },
    { section: "Shadow", label: "X Offset", field: "shadowX", type: "number", unit: "px" },
    { section: "Shadow", label: "Y Offset", field: "shadowY", type: "number", unit: "px" },
    { section: "Filters", label: "Blur", field: "filterBlur", type: "range", min: 0, max: 20 },
    { section: "Filters", label: "Brightness", field: "filterBrightness", type: "range", min: 0, max: 200 },
    { section: "Filters", label: "Contrast", field: "filterContrast", type: "range", min: 0, max: 200 },
    { section: "Filters", label: "Grayscale", field: "filterGrayscale", type: "range", min: 0, max: 100 },
  ],
  text: [
    { section: "Typography", label: "Text Content", field: "text", type: "text" },
    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },
    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["normal", "bold", "100", "200", "300", "500", "800"] },
    { section: "Typography", label: "Color", field: "color", type: "color" },
    { section: "Typography", label: "Align", field: "textAlign", type: "select", options: ["left", "center", "right", "justify"] },
    { section: "Typography", label: "Letter Spacing", field: "letterSpacing", type: "number", unit: "px" },
    { section: "Typography", label: "Line Height", field: "lineHeight", type: "number" },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["none", "underline", "line-through"] },
    { section: "Typography", label: "Transform", field: "textTransform", type: "select", options: ["none", "uppercase", "lowercase", "capitalize"] },
  ],
  image: [
    { section: "Image Settings", label: "Image URL", field: "src", type: "text" },
    { section: "Image Settings", label: "Object Fit", field: "objectFit", type: "select", options: ["cover", "contain", "fill"] },
  ],
  shape: [
    { section: "Style", label: "Background Color", field: "backgroundColor", type: "color" },
  ],
  link: [
    { section: "Action", label: "Link URL", field: "linkUrl", type: "text", placeholder: "https://google.com" },
    { section: "Typography", label: "Link Text", field: "text", type: "text" },
    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },
    { section: "Typography", label: "Color", field: "color", type: "color" },
    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["underline", "none"] },
  ]
};