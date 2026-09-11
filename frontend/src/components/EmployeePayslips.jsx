import { useEffect, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import PayslipCard from "./PayslipCard"
import PayslipDetailModal from "./PayslipDetailModal"
import Loading from "./Loading"
import toast from "react-hot-toast"

const fromApi = (p) => ({
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

const EmployeePayslips = () => {
  const { token } = useAuth()
  const [myPayslips, setMyPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingPayslip, setViewingPayslip] = useState(null)

  useEffect(() => {
    let isActive = true

    const fetchData = async () => {
      try {
        const data = await api.get("/payslips/me", token)
        if (!isActive) return
        setMyPayslips(data.map(fromApi))
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

  if (loading) return <Loading />

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