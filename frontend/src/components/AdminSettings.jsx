import { useState } from "react"
import EmployeeProfileSearch from "./EmployeeProfileSearch"
import EditPublicProfileForm from "./EditPublicProfileForm"
import ChangePasswordForm from "./ChangePasswordForm"

const AdminSettings = () => {
  const [editingEmployee, setEditingEmployee] = useState(null)

  const handleSaveProfile = (updatedEmployee) => {
    // TODO: PATCH this to your employees endpoint
    console.log("Saving employee profile:", updatedEmployee)
    setEditingEmployee(null)
  }

  return (
    <div className="space-y-6">
      <EmployeeProfileSearch onSelect={setEditingEmployee} />

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