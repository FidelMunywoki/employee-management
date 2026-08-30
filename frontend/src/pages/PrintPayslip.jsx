import { useParams, useNavigate } from "react-router-dom"
import { Printer, ArrowLeft } from "lucide-react"
import { dummyPayslipData } from "../assets/assets"

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const PrintPayslip = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const payslip = dummyPayslipData.find((p) => p._id === id)

  if (!payslip) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-slate-400">
        <p>Payslip not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 text-sm hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const employee = payslip.employee
  const periodLabel = `${monthNames[payslip.month - 1]} ${payslip.year}`

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">

      {/* Screen-only toolbar, hidden when printing */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Payslip document */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm print:shadow-none print:rounded-none p-10">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide text-slate-900">PAYSLIP</h1>
          <p className="text-sm text-slate-400 mt-1">{periodLabel}</p>
        </div>

        <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-y-6 gap-x-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Employee Name</p>
            <p className="font-semibold text-slate-900 mt-1">
              {employee?.firstName} {employee?.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Position</p>
            <p className="font-semibold text-slate-900 mt-1">{employee?.position}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
            <p className="font-semibold text-slate-900 mt-1">{employee?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Period</p>
            <p className="font-semibold text-slate-900 mt-1">{periodLabel}</p>
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">Basic Salary</td>
                <td className="px-5 py-3 text-right text-slate-800 font-medium">
                  ${payslip.basicSalary?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">Allowances</td>
                <td className="px-5 py-3 text-right text-emerald-600 font-medium">
                  +${payslip.allowances?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">Deductions</td>
                <td className="px-5 py-3 text-right text-red-500 font-medium">
                  -${payslip.deductions?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-5 py-3 font-semibold text-slate-900">Net Salary</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-900">
                  ${payslip.netSalary?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PrintPayslip