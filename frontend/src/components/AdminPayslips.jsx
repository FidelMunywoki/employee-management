import { useEffect, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import PayslipCard from "./PayslipCard"
import PayslipDetailModal from "./PayslipDetailModal"
import GeneratePayslipModal from "./GeneratePayslipModal"
import Loading from "./Loading"
import toast from "react-hot-toast"

const fromPayslipApi = (p) => ({
  _id: p.id,
  employeeId: p.employee_id,
  month: p.month,
  year: p.year,
  basicSalary: p.basic_salary,
  allowances: p.allowances,
  deductions: p.deductions,
  netSalary: p.net_salary,
  employee: p.employee
    ? {
        firstName: p.employee.first_name,
        lastName: p.employee.last_name,
        position: p.employee.position,
        department: p.employee.department,
      }
    : null,
})

const fromEmployeeApi = (e) => ({
  _id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  basicSalary: e.basic_salary,
})

const AdminPayslips = () => {
  const { token } = useAuth()
  const [payslips, setPayslips] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingPayslip, setViewingPayslip] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const loadPayslips = async () => {
    const data = await api.get("/payslips/", token)
    setPayslips(data.map(fromPayslipApi))
  }

  useEffect(() => {
    let isActive = true

    const fetchData = async () => {
      try {
        const [payslipData, employeeData] = await Promise.all([
          api.get("/payslips/", token),
          api.get("/employees/", token),
        ])
        if (!isActive) return
        setPayslips(payslipData.map(fromPayslipApi))
        setEmployees(employeeData.map(fromEmployeeApi))
      } catch (err) {
        if (isActive) toast.error(err.message || "Failed to load payslips")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isActive = false
    }
  }, [token])

  const handleGenerate = async (newPayslip) => {
    try {
      await api.post(
        "/payslips/",
        {
          employee_id: newPayslip.employeeId,
          month: newPayslip.month,
          year: newPayslip.year,
          allowances: newPayslip.allowances,
          deductions: newPayslip.deductions,
        },
        token
      )
      toast.success("Payslip generated")
      setShowGenerateModal(false)
      await loadPayslips()
    } catch (err) {
      toast.error(err.message || "Failed to generate payslip")
    }
  }

  if (loading) return <Loading />

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
          employees={employees}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  )
}

export default AdminPayslips