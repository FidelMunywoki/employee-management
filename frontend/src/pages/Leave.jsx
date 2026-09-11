import { useAuth } from "../context/useAuth"
import EmployeeLeave from "../components/EmployeeLeave"
import AdminLeave from "../components/AdminLeave"

const Leave = () => {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminLeave /> : <EmployeeLeave />
}

export default Leave