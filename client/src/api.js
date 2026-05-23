const BASE_URL = import.meta.env.VITE_API_URL || "";

const getToken = () => localStorage.getItem("taskflow_token");
const setToken = (token) => localStorage.setItem("taskflow_token", token);
const clearToken = () => localStorage.removeItem("taskflow_token");

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
};

const login = async (payload) => {
  const response = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const token = response.data?.accessToken;
  if (token) {
    setToken(token);
  }
  return response;
};

const register = async (payload) => {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const getProjects = async () => {
  return request("/api/v1/projects", { method: "GET" });
};

const getProject = async (id) => {
  return request(`/api/v1/projects/${id}`, { method: "GET" });
};

const updateProject = async (id, payload) => {
  return request(`/api/v1/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

const logout = () => {
  clearToken();
};

export { login, register, getProjects, getProject, updateProject, logout, getToken };
