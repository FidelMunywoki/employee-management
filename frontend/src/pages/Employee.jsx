import { Plus, Search, ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { DEPARTMENTS } from "../assets/assets"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import EmployeeCard from "../components/EmployeeCard"
import EditEmployeeModal from "../components/EditEmployeeModal"
import AddEmployeeModal from "../components/AddEmployeeModal"
import Loading from "../components/Loading"
import toast from "react-hot-toast"

// Backend (snake_case) -> frontend (camelCase, _id) shape used by
// EmployeeCard / EditEmployeeModal / AddEmployeeModal
const fromApi = (e) => ({
  _id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  email: e.email,
  phone: e.phone,
  department: e.department,
  position: e.position,
  basicSalary: e.basic_salary,
  allowances: e.allowances,
  deductions: e.deductions,
  employmentStatus: e.employment_status,
  bio: e.bio,
  joinDate: e.join_date,
  image: e.image,
  role: e.role,
})

const Employee = () => {
  const { token } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedDeptartment, setSelectedDepartment] = useState("")
  const [showDeptMenu, setShowDeptMenu] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const data = await api.get("/employees/", token)
        if (isActive) setEmployees(data.map(fromApi))
      } catch (err) {
        toast.error(err.message || "Failed to load employees")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()
    return () => {
      isActive = false
    }
  }, [token])

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

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Remove ${employee.firstName} ${employee.lastName}? This can't be undone.`
    )
    if (!confirmed) return

    try {
      await api.delete(`/employees/${employee._id}`, token)
      setEmployees((prev) => prev.filter((e) => e._id !== employee._id))
      toast.success("Employee removed")
    } catch (err) {
      toast.error(err.message || "Failed to delete employee")
    }
  }

  const handleSaveEdit = async (updatedEmployee) => {
    try {
      const payload = {
        first_name: updatedEmployee.firstName,
        last_name: updatedEmployee.lastName,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        department: updatedEmployee.department,
        position: updatedEmployee.position,
        basic_salary: updatedEmployee.basicSalary,
        allowances: updatedEmployee.allowances,
        deductions: updatedEmployee.deductions,
        employment_status: updatedEmployee.employmentStatus,
        role: updatedEmployee.role,
        bio: updatedEmployee.bio,
        join_date: updatedEmployee.joinDate || null,
      }
      const saved = await api.patch(`/employees/${updatedEmployee._id}`, payload, token)
      setEmployees((prev) =>
        prev.map((e) => (e._id === saved.id ? fromApi(saved) : e))
      )
      setEditingEmployee(null)
      toast.success("Employee updated")
    } catch (err) {
      toast.error(err.message || "Failed to update employee")
    }
  }

  const handleCreate = async (newEmployee) => {
    try {
      const payload = {
        first_name: newEmployee.firstName,
        last_name: newEmployee.lastName,
        email: newEmployee.email,
        password: newEmployee.password,
        phone: newEmployee.phone,
        department: newEmployee.department,
        position: newEmployee.position,
        basic_salary: newEmployee.basicSalary,
        allowances: newEmployee.allowances,
        deductions: newEmployee.deductions,
        role: newEmployee.role,
        bio: newEmployee.bio,
        join_date: newEmployee.joinDate || null,
      }
      const created = await api.post("/employees/", payload, token)
      setEmployees((prev) => [fromApi(created), ...prev])
      setShowAddModal(false)
      toast.success("Employee created")
    } catch (err) {
      toast.error(err.message || "Failed to create employee")
    }
  }

  if (loading) return <Loading />

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