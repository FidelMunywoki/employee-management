import { X, Printer } from "lucide-react"
import { useNavigate } from "react-router-dom"

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const PayslipDetailModal = ({ payslip, onClose }) => {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payslip</h2>
            <p className="text-xs text-slate-400">
              {monthNames[payslip.month - 1] || payslip.month} {payslip.year}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {payslip.employee && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-medium text-slate-900">
                {payslip.employee.firstName} {payslip.employee.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {payslip.employee.position} · {payslip.employee.department}
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Basic Salary</span>
              <span className="text-slate-800 font-medium">${payslip.basicSalary?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Allowances</span>
              <span className="text-emerald-600 font-medium">+${payslip.allowances?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deductions</span>
              <span className="text-red-500 font-medium">-${payslip.deductions?.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="font-semibold text-slate-900">Net Salary</span>
              <span className="font-semibold text-slate-900">${payslip.netSalary?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            onClick={() => navigate(`/print-payslip/${payslip._id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  )
}

export default PayslipDetailModal