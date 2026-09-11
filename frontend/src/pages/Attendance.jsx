import { useAuth } from "../context/useAuth"
import EmployeeAttendance from "../components/EmployeeAttendance"
import AdminAttendance from "../components/AdminAttendance"

const Attendance = () => {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminAttendance /> : <EmployeeAttendance />
}

export default Attendance