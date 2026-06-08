// src/utils/styleNormalizer.js

export function normalizeStyleValue(field, value) {

  const numberFields = [
    "fontSize",
    "labelFontSize",
    "borderRadius",
    "borderWidth",
    "letterSpacing",
    "zIndex",
    "minHeight",
    "lineHeight",
    "transitionSpeed",
    "filterBlur",
    "filterBrightness",
    "filterContrast",
    "filterGrayscale",
  ];

  // تحويل px → number
  if (
    numberFields.includes(field) &&
    typeof value === "string"
  ) {
    value = parseFloat(value.replace("px", ""));
  }

  // منع NaN
  if (
    numberFields.includes(field) &&
    (isNaN(value) || value === null)
  ) {
    value = 0;
  }

  // إصلاح color picker
  if (
    field === "backgroundColor" &&
    value === "transparent"
  ) {
    return "#ffffff";
  }

  return value;
}