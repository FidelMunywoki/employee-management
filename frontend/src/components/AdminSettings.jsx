import { useEffect, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import EmployeeProfileSearch from "./EmployeeProfileSearch"
import EditPublicProfileForm from "./EditPublicProfileForm"
import ChangePasswordForm from "./ChangePasswordForm"
import toast from "react-hot-toast"

const fromApi = (e) => ({
  _id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  email: e.email,
  position: e.position,
  department: e.department,
  bio: e.bio,
})

const AdminSettings = () => {
  const { token } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState(null)

  useEffect(() => {
    let isActive = true

    const fetchEmployees = async () => {
      try {
        const data = await api.get("/employees/", token)
        if (isActive) setEmployees(data.map(fromApi))
      } catch (err) {
        if (isActive) toast.error(err.message || "Failed to load employees")
      } finally {
        if (isActive) setLoadingEmployees(false)
      }
    }

    fetchEmployees()
    return () => {
      isActive = false
    }
  }, [token])

  const handleSaveProfile = async (updatedEmployee) => {
    try {
      const saved = await api.patch(
        `/employees/${updatedEmployee._id}`,
        {
          first_name: updatedEmployee.firstName,
          last_name: updatedEmployee.lastName,
          email: updatedEmployee.email,
          position: updatedEmployee.position,
          bio: updatedEmployee.bio,
        },
        token
      )
      const mapped = fromApi(saved)
      setEmployees((prev) => prev.map((e) => (e._id === mapped._id ? mapped : e)))
      toast.success("Profile updated")
      setEditingEmployee(null)
    } catch (err) {
      toast.error(err.message || "Failed to update profile")
    }
  }

  return (
    <div className="space-y-6">
      <EmployeeProfileSearch
        employees={employees}
        loading={loadingEmployees}
        onSelect={setEditingEmployee}
      />

      {editingEmployee && (
        <EditPublicProfileForm
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleSaveProfile}
        />
      )}

      <ChangePasswordForm />
    </div>
  )
}

export default AdminSettings