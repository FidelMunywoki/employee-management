import { getWorkingHoursDisplay, getDayTypeDisplay } from "../assets/assets"

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const formatTime = (dateStr) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusBadge = {
  PRESENT: "badge-success",
  ABSENT: "badge-danger",
  LATE: "badge-warning",
}

const AttendanceTable = ({ records }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-5">
        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Check In</th>
              <th className="px-6 py-3">Check Out</th>
              <th className="px-6 py-3">Working Hours</th>
              <th className="px-6 py-3">Day Type</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const dayType = getDayTypeDisplay(record)
                return (
                  <tr key={record._id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-medium">
                      {getWorkingHoursDisplay(record)}
                    </td>
                    <td className="px-6 py-4">
                      {dayType.label !== "—" && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${dayType.className}`}
                        >
                          {dayType.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusBadge[record.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceTable