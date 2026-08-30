const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const PayslipCard = ({ payslip, showEmployee = false, onView }) => {
  return (
    <div
      onClick={() => onView(payslip)}
      className="card p-4 sm:p-5 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          {showEmployee && (
            <p className="font-semibold text-slate-900">
              {payslip.employee?.firstName || "Employee"} {payslip.employee?.lastName || ""}
            </p>
          )}
          <p className={showEmployee ? "text-sm text-slate-500" : "font-semibold text-slate-900"}>
            {monthNames[payslip.month - 1] || payslip.month} {payslip.year}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">${payslip.netSalary?.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Net Salary</p>
        </div>
      </div>
    </div>
  )
}

export default PayslipCard