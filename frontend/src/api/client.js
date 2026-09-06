const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.detail || response.statusText || "Request failed"
    throw new Error(typeof message === "string" ? message : JSON.stringify(message))
  }

  return data
}

export const api = {
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: "POST", body, token }),
  patch: (path, body, token) => request(path, { method: "PATCH", body, token }),
  delete: (path, token) => request(path, { method: "DELETE", token }),
}