import { useMemo, useState } from "react"
import { Search, User } from "lucide-react"
import { dummyEmployeeData } from "../assets/assets"

const EmployeeProfileSearch = ({ onSelect }) => {
  const [search, setSearch] = useState("")

  const results = useMemo(() => {
    if (!search.trim()) return dummyEmployeeData
    const q = search.toLowerCase()
    return dummyEmployeeData.filter(
      (emp) =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <User size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">Edit Employee Profile</h3>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
        />
      </div>

      <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-sm text-slate-400 px-4 py-6 text-center">No employees found.</p>
        ) : (
          results.map((emp) => (
            <button
              key={emp._id}
              onClick={() => onSelect(emp)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-xs text-slate-400">{emp.email}</p>
              </div>
              <span className="text-xs text-slate-400">{emp.department}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default EmployeeProfileSearch