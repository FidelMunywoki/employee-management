import { useState } from "react"
import { dummyEmployeeData, dummyPayslipData } from "../assets/assets"
import PayslipCard from "./PayslipCard"
import PayslipDetailModal from "./PayslipDetailModal"
import GeneratePayslipModal from "./GeneratePayslipModal"

const AdminPayslips = () => {
  const [payslips, setPayslips] = useState(dummyPayslipData)
  const [viewingPayslip, setViewingPayslip] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const handleGenerate = (newPayslip) => {
    setPayslips((prev) => [newPayslip, ...prev])
    setShowGenerateModal(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Payslips</h1>
          <p className="page-subtitle">Generate and manage employee payslips</p>
        </div>
        <button className="btn-primary" onClick={() => setShowGenerateModal(true)}>
          Generate Payslip
        </button>
      </div>

      <div className="space-y-3">
        {payslips.length ? (
          payslips.map((payslip) => (
            <PayslipCard
              key={payslip._id}
              payslip={payslip}
              showEmployee
              onView={setViewingPayslip}
            />
          ))
        ) : (
          <p className="text-slate-500">No payslips found.</p>
        )}
      </div>

      {viewingPayslip && (
        <PayslipDetailModal payslip={viewingPayslip} onClose={() => setViewingPayslip(null)} />
      )}

      {showGenerateModal && (
        <GeneratePayslipModal
          employees={dummyEmployeeData}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  )
}

export default AdminPayslips