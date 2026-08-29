import LeaveStatusBadge from "./LeaveStatusBadge"

const formatRange = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  const opts = { month: "short", day: "numeric" }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`
}

const getEmployeeName = (leave) => {
  const emp = Array.isArray(leave.employee) ? leave.employee[0] : leave.employee
  return emp ? `${emp.firstName} ${emp.lastName}` : "—"
}

const LeaveTable = ({ records, isAdmin = false, onReview }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {isAdmin && <th className="px-6 py-3">Employee</th>}
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Dates</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Status</th>
              {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 4} className="px-6 py-10 text-center text-slate-400">
                  No leave requests found.
                </td>
              </tr>
            ) : (
              records.map((leave) => (
                <tr key={leave._id} className="border-t border-slate-100">
                  {isAdmin && (
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {getEmployeeName(leave)}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatRange(leave.startDate, leave.endDate)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4">
                    <LeaveStatusBadge status={leave.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      {leave.status === "PENDING" ? (
                        <button
                          onClick={() => onReview(leave)}
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveTable