import { useState } from "react"
import { X } from "lucide-react"
import { DEPARTMENTS } from "../assets/assets"

const SYSTEM_ROLES = ["EMPLOYEE", "ADMIN"]

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  joinDate: "",
  bio: "",
  department: "",
  position: "",
  basicSalary: 0,
  allowances: 0,
  deductions: 0,
  email: "",
  password: "",
  role: "EMPLOYEE",
}

const AddEmployeeModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState(emptyForm)
  const [error, setError] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("First name, last name, work email, and a temporary password are required.")
      return
    }

    const newEmployee = {
      _id: `temp-${Date.now()}`,
      id: `temp-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      joinDate: formData.joinDate ? new Date(formData.joinDate).toISOString() : null,
      bio: formData.bio,
      department: formData.department,
      position: formData.position,
      basicSalary: Number(formData.basicSalary),
      allowances: Number(formData.allowances),
      deductions: Number(formData.deductions),
      employmentStatus: "ACTIVE",
      email: formData.email,
      password: formData.password,
      isDeleted: false,
      user: { email: formData.email, role: formData.role },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      image: null,
    }

    onCreate(newEmployee)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-4 bg-white sticky top-0 border-b border-slate-100 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Employee</h2>
            <p className="text-xs text-slate-400">Create a user account and employee profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange("joinDate", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-600 mb-1.5">Bio (Optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Basic Salary</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleChange("basicSalary", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Allowances</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => handleChange("allowances", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => handleChange("deductions", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
            </div>
          </div>

          {/* Account Setup */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Account Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-600 mb-1.5">Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                >
                  {SYSTEM_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
            >
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeModal