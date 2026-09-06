import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loading from "./Loading"

const AdminRoute = () => {
  const { isAdmin, loading } = useAuth()

  if (loading) return <Loading />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default AdminRoute