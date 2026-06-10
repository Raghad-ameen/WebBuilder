
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

  if (
    numberFields.includes(field) &&
    typeof value === "string"
  ) {
    value = parseFloat(value.replace("px", ""));
  }

  if (
    numberFields.includes(field) &&
    (isNaN(value) || value === null)
  ) {
    value = 0;
  }

  if (
    field === "backgroundColor" &&
    value === "transparent"
  ) {
    return "#ffffff";
  }

  return value;
}