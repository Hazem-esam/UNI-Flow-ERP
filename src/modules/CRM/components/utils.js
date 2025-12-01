export const loadLeads = () =>
  JSON.parse(localStorage.getItem("leads") || "[]");
export const saveLeads = (data) =>
  localStorage.setItem("leads", JSON.stringify(data));
export const ensureInitialLeads = () => [
  { id: 1, name: "Ahmed Ali", email: "ahmed@example.com", stage: "qualified" },
  {
    id: 2,
    name: "Sara Youssef",
    email: "sara@example.com",
    stage: "converted",
  },
];
