export function loadContacts() {
  const data = localStorage.getItem("contacts");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse contacts from localStorage", e);
    return null;
  }
}

export function saveContacts(list) {
  localStorage.setItem("contacts", JSON.stringify(list));
}

export function getTypeColor(type) {
  switch (type) {
    case "client":
      return "bg-blue-100 text-blue-700";
    case "vendor":
      return "bg-green-100 text-green-700";
    case "partner":
      return "bg-purple-100 text-purple-700";
    case "lead":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function ensureInitialContacts() {
  const existing = loadContacts();
  if (existing && existing.length > 0) return existing;

  const sampleContacts = [
    {
      id: 1,
      name: "John Smith",
      email: "john@techcorp.com",
      phone: "555-0101",
      company: "Tech Corp",
      position: "CEO",
      type: "client",
      location: "New York, NY",
      website: "techcorp.com",
      linkedin: "linkedin.com/in/johnsmith",
      favorite: true,
      notes: "Key decision maker",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@designco.com",
      phone: "555-0102",
      company: "Design Co",
      position: "Creative Director",
      type: "client",
      location: "Los Angeles, CA",
      website: "designco.com",
      linkedin: "linkedin.com/in/sarahjohnson",
      favorite: false,
      notes: "",
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike@suppliers.com",
      phone: "555-0103",
      company: "Suppliers Inc",
      position: "Sales Manager",
      type: "vendor",
      location: "Chicago, IL",
      website: "suppliers.com",
      linkedin: "",
      favorite: false,
      notes: "Office supplies vendor",
    },
  ];

  saveContacts(sampleContacts);
  return sampleContacts;
}
