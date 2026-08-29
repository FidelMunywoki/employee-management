import { Plus, Search, ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"
import { dummyEmployeeData, DEPARTMENTS } from "../assets/assets"
import EmployeeCard from "../components/EmployeeCard"
import EditEmployeeModal from "../components/EditEmployeeModal"
import AddEmployeeModal from "../components/AddEmployeeModal"

const Employee = () => {
  const [employees, setEmployees] = useState(dummyEmployeeData)
  const [search, setSearch] = useState("");
  const [selectedDeptartment, setSelectedDepartment] = useState("");
  const [showDeptMenu, setShowDeptMenu] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase())
      const matchesDept =
        !selectedDeptartment || emp.department === selectedDeptartment
      return matchesSearch && matchesDept
    })
  }, [employees, search, selectedDeptartment])

  const handleDelete = (employee) => {
    const confirmed = window.confirm(
      `Remove ${employee.firstName} ${employee.lastName}? This can't be undone.`
    )
    if (!confirmed) return
    setEmployees((prev) => prev.filter((e) => e._id !== employee._id))
  }

  const handleSaveEdit = (updatedEmployee) => {
    setEmployees((prev) =>
      prev.map((e) => (e._id === updatedEmployee._id ? updatedEmployee : e))
    )
    setEditingEmployee(null)
  }

  const handleCreate = (newEmployee) => {
    setEmployees((prev) => [newEmployee, ...prev])
    setShowAddModal(false)
  }

  return (
    <div className="animate-fade-in">

      {/* ----- Header ----- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="page-subtitle text-sm text-slate-500">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16}/> Add Employee
        </button>
      </div>

      {/* ----- Search Bar ----- */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDeptMenu((v) => !v)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition whitespace-nowrap"
          >
            {selectedDeptartment || "All Departments"}
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showDeptMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedDepartment("")
                  setShowDeptMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                All Departments
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setSelectedDepartment(dept)
                    setShowDeptMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----- Employee Cards ----- */}
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-16">
          No employees match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp._id}
              employee={emp}
              onEdit={setEditingEmployee}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleSaveEdit}
        />
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

export default Employee