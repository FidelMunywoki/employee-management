import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loading from "./Loading"

const ProtectedRoute = () => {
  const { token, loading } = useAuth()

  if (loading) return <Loading />
  if (!token) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute