import { useMemo, useState } from "react"
import { X } from "lucide-react"

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const GeneratePayslipModal = ({ employees, onClose, onGenerate }) => {
  const [employeeId, setEmployeeId] = useState("")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [allowances, setAllowances] = useState(0)
  const [deductions, setDeductions] = useState(0)
  const [error, setError] = useState("")

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === employeeId),
    [employees, employeeId]
  )

  const basicSalary = selectedEmployee?.basicSalary ?? 0
  const netSalary = basicSalary + Number(allowances || 0) - Number(deductions || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!employeeId) {
      setError("Select an employee to generate a payslip for.")
      return
    }

    onGenerate({
      _id: `temp-${Date.now()}`,
      employeeId,
      employee: selectedEmployee,
      month: Number(month),
      year: Number(year),
      basicSalary,
      allowances: Number(allowances),
      deductions: Number(deductions),
      netSalary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Generate Payslip</h2>
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
            <label className="block text-sm text-slate-600 mb-1.5">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              >
                {monthNames.map((name, i) => (
                  <option key={name} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm flex justify-between">
              <span className="text-slate-500">Basic Salary (from profile)</span>
              <span className="font-medium text-slate-800">${basicSalary.toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Allowances</label>
              <input
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Deductions</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-indigo-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-indigo-700">Net Salary</span>
            <span className="text-lg font-semibold text-indigo-700">${netSalary.toLocaleString()}</span>
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
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GeneratePayslipModal