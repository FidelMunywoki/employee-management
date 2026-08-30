import { useState } from "react"
import { User } from "lucide-react"

const ProfileDetailsForm = ({ employee, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    phone: employee.phone || "",
    bio: employee.bio || "",
  })
  const [success, setSuccess] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccess("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...employee, ...formData })
    setSuccess("Profile updated.")
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <User size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">My Details</h3>
      </div>

      {success && (
        <div className="px-4 py-2.5 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl">
          {success}
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
              value={employee.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Contact an admin to change your work email.</p>
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
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            placeholder="Brief description..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

export default ProfileDetailsForm