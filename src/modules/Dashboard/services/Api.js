const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle unauthorized
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expiresAtUtc");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response.json();
};