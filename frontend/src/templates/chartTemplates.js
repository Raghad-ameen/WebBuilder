export const chartTemplates = [
  {
    id: "sales",
    name: "Sales Chart",

    chartType: "bar",

    data: [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 700 }
    ],

    styles: {
      chartColor: "#2563eb"
    }
  },

  {
    id: "visitors",
    name: "Visitors",

    chartType: "line",

    data: [
      { name: "Mon", value: 120 },
      { name: "Tue", value: 90 },
      { name: "Wed", value: 200 }
    ],

    styles: {
      chartColor: "#16a34a"
    }
  }
];