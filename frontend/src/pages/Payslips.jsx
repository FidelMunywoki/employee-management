import { useAuth } from "../context/useAuth"
import AdminPayslips from "../components/AdminPayslips"
import EmployeePayslips from "../components/EmployeePayslips"

const Payslips = () => {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminPayslips /> : <EmployeePayslips />
}

export default Payslips