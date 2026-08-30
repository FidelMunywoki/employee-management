
import { useState } from "react"
import { Lock } from "lucide-react"

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required.")
      return
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation don't match.")
      return
    }

    // TODO: send { currentPassword, newPassword } to your auth/change-password endpoint
    console.log("Password change requested")
    setSuccess("Password updated successfully.")
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">Change Password</h3>
      </div>

      {error && (
        <div className="px-4 py-2.5 mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-2.5 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary">Update Password</button>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordForm