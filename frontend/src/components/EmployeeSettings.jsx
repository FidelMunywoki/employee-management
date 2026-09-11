import { useEffect, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import ProfileDetailsForm from "./ProfileDetailsForm"
import ChangePasswordForm from "./ChangePasswordForm"
import Loading from "./Loading"
import toast from "react-hot-toast"

const fromApi = (e) => ({
  _id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  email: e.email,
  phone: e.phone,
  bio: e.bio,
})

const EmployeeSettings = () => {
  const { token } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const fetchProfile = async () => {
      try {
        const data = await api.get("/auth/me", token)
        if (isActive) setEmployee(fromApi(data))
      } catch (err) {
        if (isActive) toast.error(err.message || "Failed to load profile")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchProfile()
    return () => {
      isActive = false
    }
  }, [token])

  const handleSave = async (updated) => {
    try {
      const saved = await api.patch("/employees/me", { bio: updated.bio }, token)
      setEmployee(fromApi(saved))
      toast.success("Bio updated")
    } catch (err) {
      toast.error(err.message || "Failed to update bio")
    }
  }

  if (loading) return <Loading />
  if (!employee) return null

  return (
    <div className="space-y-6">
      <ProfileDetailsForm employee={employee} onSave={handleSave} />
      <ChangePasswordForm />
    </div>
  )
}

export default EmployeeSettings