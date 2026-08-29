import { useState } from "react"
import { X } from "lucide-react"

const LEAVE_TYPES = ["ANNUAL", "CASUAL", "SICK"]

const ApplyLeaveModal = ({ employeeId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [error, setError] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError("Start date, end date, and a reason are required.")
      return
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date can't be before the start date.")
      return
    }

    onSubmit({
      _id: `temp-${Date.now()}`,
      employeeId,
      type: formData.type,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      reason: formData.reason.trim(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Apply for Leave</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Leave Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Briefly explain why you're requesting leave..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
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
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyLeaveModal