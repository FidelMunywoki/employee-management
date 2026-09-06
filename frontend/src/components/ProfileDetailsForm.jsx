import { useState } from "react"
import { User } from "lucide-react"

const ProfileDetailsForm = ({ employee, onSave }) => {
  const [bio, setBio] = useState(employee.bio || "")
  const [success, setSuccess] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...employee, bio })
    setSuccess("Bio updated.")
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
              value={employee.firstName}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Last Name</label>
            <input
              type="text"
              value={employee.lastName}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
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
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={employee.phone || ""}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 -mt-2">
          Contact an admin to update your name, email, or phone number.
        </p>

        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Brief description..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary">Save Bio</button>
        </div>
      </form>
    </div>
  )
}

export default ProfileDetailsForm