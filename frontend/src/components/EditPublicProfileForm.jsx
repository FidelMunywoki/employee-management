import { useState } from "react"
import { X } from "lucide-react"

const EditPublicProfileForm = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    email: employee.email || "",
    position: employee.position || "",
    bio: employee.bio || "",
  })
  const [error, setError] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("First name, last name, and email are required.")
      return
    }
    onSave({ ...employee, ...formData })
  }

  return (
    <div className="card p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Editing: {employee.firstName} {employee.lastName}
          </h3>
          <p className="text-xs text-slate-400">{employee.department}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {error && (
        <div className="px-4 py-2.5 mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
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
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">Save Profile</button>
        </div>
      </form>
    </div>
  )
}

export default EditPublicProfileForm