import { Pencil, Trash2 } from "lucide-react"

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Photo panel */}
      <div className="relative bg-slate-50 h-40 flex items-center justify-center">
        <span className="absolute top-3 left-3 px-3 py-1 bg-white text-xs font-medium text-slate-600 rounded-full shadow-sm">
          {employee.department}
        </span>

        {employee.image ? (
          <img
            src={employee.image}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "flex"
            }}
          />
        ) : null}
        <div
          className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 items-center justify-center text-lg font-semibold"
          style={{ display: employee.image ? "none" : "flex" }}
        >
          {employee.firstName?.[0]}
          {employee.lastName?.[0]}
        </div>

        {/* Hover overlay with Edit / Delete */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(employee)
            }}
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-indigo-50 transition"
            title="Edit employee"
          >
            <Pencil size={16} className="text-indigo-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(employee)
            }}
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition"
            title="Delete employee"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-4 py-3">
        <p className="font-semibold text-slate-900 text-sm">
          {employee.firstName} {employee.lastName}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{employee.position}</p>
      </div>
    </div>
  )
}

export default EmployeeCard