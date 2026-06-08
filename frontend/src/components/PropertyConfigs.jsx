export const PROPERTY_CONTROLS = {

  common: [

    { section: "Layout", label: "Opacity", field: "opacity", type: "range", min: 0, max: 1, step: 0.1 },

    { section: "Layout", label: "Z-Index (Layers)", field: "zIndex", type: "number", placeholder: "0" },

    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },

    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },

    { section: "Border", label: "Border Color", field: "borderColor", type: "color" },

    { section: "Border", label: "Border Style", field: "borderStyle", type: "select", options: ["none", "solid", "dashed", "dotted", "double"] },

    { section: "Shadow", label: "Shadow Color", field: "shadowColor", type: "color" },

    { section: "Filters", label: "Blur", field: "filterBlur", type: "range", min: 0, max: 20 },

    { section: "Filters", label: "Brightness", field: "filterBrightness", type: "range", min: 0, max: 200 },

    { section: "Filters", label: "Contrast", field: "filterContrast", type: "range", min: 0, max: 200 },

    { section: "Filters", label: "Grayscale", field: "filterGrayscale", type: "range", min: 0, max: 100 },

    { section: "Hover Styles", label: "Hover Background", field: "hoverBg", type: "color" },

    { section: "Hover Styles", label: "Hover Text Color", field: "hoverColor", type: "color" },

    { section: "Hover Styles", label: "Hover Scale Effect", field: "hoverScale", type: "select", options: ["none", "1.02", "1.05", "1.1"] },

    { section: "Hover Styles", label: "Transition Speed", field: "transitionSpeed", type: "number", unit: "s", placeholder: "e.g., 0.2" },

    { section: "Effects", label: "Shadow Mode", field: "shadowMode", type: "select", options: ["none", "Drop", "Glow", "Echo", "Glitch"] },

    { section: "Effects", label: "Shadow Blur", field: "shadowBlur", type: "range", min: 0, max: 20 },

    { section: "Effects", label: "Glitch Effect", field: "glitchStyle", type: "select", options: ["none", "RGB Split", "Cyberpunk", "Vintage"] },

  ],

  input: [

{
  section: "Field Base",
  label: "Field Type",
  field: "inputType",
  type: "select",
  options: [
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "date",
    "time",
    "color"
  ]
},
    { section: "Field Base", label: "Field Key (Name)", field: "name", type: "text", placeholder: "e.g., username, email" },

    { section: "Field Base", label: "Placeholder text", field: "placeholder", type: "text", placeholder: "e.g., Enter your email..." },

    { section: "Label Typography", label: "Label Size", field: "labelFontSize", type: "number", unit: "px" },

    { section: "Label Typography", label: "Label Color", field: "labelColor", type: "color" },

    { section: "Field Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },

    { section: "Field Typography", label: "Font Color", field: "color", type: "color" },
    {
  section: "Validation",
  label: "Expected Data",
  field: "dataType",
  type: "select",
  options: [
    "Any",
    "Email",
    "Phone",
    "Number",
    "URL",
    "Date",
    "Username",
    "Full Name",
    "Password"
  ]
},

  ],

  text: [

    { section: "Typography", label: "Text Content", field: "text", type: "text" },

    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },

    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["100", "300", "400", "500", "700", "900", "normal", "bold"] },

    { section: "Typography", label: "Text Color", field: "color", type: "color" },

    { section: "Typography", label: "Align", field: "textAlign", type: "alignment-toggle" },

    { section: "Typography", label: "Letter Spacing", field: "letterSpacing", type: "number", unit: "px" },

    { section: "Typography", label: "Line Height", field: "lineHeight", type: "number", step: 0.1 },

    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["none", "underline", "line-through", "overline", "underline wavy", "underline dotted", "underline dashed"] },

    { section: "Typography", label: "Transform", field: "textTransform", type: "select", options: ["none", "uppercase", "lowercase", "capitalize"] },

  ],

  button: [

    { section: "Typography", label: "Button Text", field: "text", type: "text" },

    { section: "Style", label: "Background Color", field: "backgroundColor", type: "advanced-color" },

    { section: "Border", label: "Border Width", field: "borderWidth", type: "number", unit: "px" },

    { section: "Border", label: "Radius", field: "borderRadius", type: "number", unit: "px" },

    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px", isTextStyle: true },

    { section: "Typography", label: "Font Color", field: "color", type: "color", isTextStyle: true },

    { section: "Typography", label: "Font Weight", field: "fontWeight", type: "select", options: ["normal", "bold", "500", "700"], isTextStyle: true },

    { section: "Typography", label: "Align", field: "textAlign", type: "alignment-toggle", isTextStyle: true },

  ],

  image: [

    { section: "Image Settings", label: "Image URL", field: "src", type: "text" },

    { section: "Image Settings", label: "Object Fit", field: "objectFit", type: "select", options: ["cover", "contain", "fill"] },

  ],

  shape: [

    { section: "Style", label: "Background Color", field: "backgroundColor", type: "advanced-color" },

  ],

  link: [

    { section: "Action", label: "Link URL", field: "linkUrl", type: "text", placeholder: "https://google.com" },

    { section: "Typography", label: "Link Text", field: "text", type: "text" },

    { section: "Typography", label: "Font Size", field: "fontSize", type: "number", unit: "px" },

    { section: "Typography", label: "Color", field: "color", type: "color" },

    { section: "Typography", label: "Decoration", field: "textDecoration", type: "select", options: ["underline", "none", "line-through"] },

  ],

  section: [

    { field: 'backgroundColor', label: 'Background Color', type: 'color', section: 'Appearance' },

    { field: 'minHeight', label: 'Min Height', type: 'number', unit: 'px', section: 'Layout' },

  ],

  animations: [

    { section: "Animation", label: "Entry Animation", field: "entryAnimation", type: "select", options: ["none", "Rise", "Pan", "Fade", "Zoom In"] },

    { section: "Animation", label: "Direction", field: "panDirection", type: "alignment-toggle", options: ["up", "down", "left", "right"] },

    { section: "Animation", label: "Duration", field: "animationDuration", type: "number", unit: "s", placeholder: "e.g., 0.5" },

    { section: "Animation", label: "Delay", field: "animationDelay", type: "number", unit: "s", placeholder: "0" },

  ],

  positioning: [

    { section: "Position", label: "Arrange (Layering)", field: "zIndex", type: "select", options: ["To Front", "Bring Forward", "Send Backward", "To Back"] },

    { section: "Position", label: "Align to Canvas", field: "canvasAlignment", type: "canvas-align-toggle" },

  ],

};