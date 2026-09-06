import { useState, useEffect, useCallback } from "react"
import { api } from "../api/client"
import { AuthContext } from "./authContext"

const TOKEN_KEY = "ems_token"

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async (activeToken) => {
    try {
      const me = await api.get("/auth/me", activeToken)
      setUser(me)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const initializeAuth = async () => {
      if (!token) {
        if (isActive) setLoading(false)
        return
      }

      try {
        const me = await api.get("/auth/me", token)
        if (isActive) setUser(me)
      } catch {
        if (isActive) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      isActive = false
    }
  }, [token])

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    await fetchMe(data.access_token)
    return data
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === "ADMIN"

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

