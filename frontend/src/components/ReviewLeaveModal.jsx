import { useState } from "react"
import { X, Check, Ban } from "lucide-react"

const ReviewLeaveModal = ({ leave, onClose, onSubmit }) => {
  const [decision, setDecision] = useState(null) // "APPROVED" | "REJECTED"
  const [comment, setComment] = useState("")

  const employeeName = Array.isArray(leave.employee)
    ? `${leave.employee[0]?.firstName || ""} ${leave.employee[0]?.lastName || ""}`
    : `${leave.employee?.firstName || ""} ${leave.employee?.lastName || ""}`

  const handleConfirm = () => {
    if (!decision) return
    onSubmit({ leaveId: leave._id, status: decision, comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Review Leave Request</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 text-sm">
            <p className="font-medium text-slate-900">{employeeName}</p>
            <p className="text-slate-500 mt-1">
              {leave.type} · {new Date(leave.startDate).toLocaleDateString()} –{" "}
              {new Date(leave.endDate).toLocaleDateString()}
            </p>
            <p className="text-slate-500 mt-1">"{leave.reason}"</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDecision("APPROVED")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition ${
                decision === "APPROVED"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Check size={16} /> Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("REJECTED")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition ${
                decision === "REJECTED"
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Ban size={16} /> Reject
            </button>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note for the employee..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!decision}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
          >
            Submit Decision
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewLeaveModal