const statusStyles = {
  APPROVED: "badge-success",
  REJECTED: "badge-danger",
  PENDING: "badge-warning",
}

const LeaveStatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-slate-100 text-slate-600"}`}>
    {status}
  </span>
)

export default LeaveStatusBadge