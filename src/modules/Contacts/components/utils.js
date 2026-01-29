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