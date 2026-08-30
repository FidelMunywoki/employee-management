import { useMemo, useState } from "react"
import { dummyPayslipData } from "../assets/assets"
import PayslipCard from "./PayslipCard"
import PayslipDetailModal from "./PayslipDetailModal"

// Swap this for the logged-in user's real id once auth is wired up
const CURRENT_EMPLOYEE_ID = "69b411e6f8a807df391d7b13"

const EmployeePayslips = () => {
  const [viewingPayslip, setViewingPayslip] = useState(null)

  const myPayslips = useMemo(
    () => dummyPayslipData.filter((p) => p.employeeId === CURRENT_EMPLOYEE_ID),
    []
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Payslips</h1>
        <p className="page-subtitle">Your payslips history</p>
      </div>

      <div className="space-y-3">
        {myPayslips.length ? (
          myPayslips.map((payslip) => (
            <PayslipCard key={payslip._id} payslip={payslip} onView={setViewingPayslip} />
          ))
        ) : (
          <p className="text-slate-500">No payslips found.</p>
        )}
      </div>

      {viewingPayslip && (
        <PayslipDetailModal payslip={viewingPayslip} onClose={() => setViewingPayslip(null)} />
      )}
    </div>
  )
}

export default EmployeePayslips