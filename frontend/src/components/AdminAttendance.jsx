import { useEffect, useMemo, useState } from "react"
import { Users, AlertCircle, Clock } from "lucide-react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import StatCard from "./StatCard"
import AttendanceTable from "./AttendanceTable"
import Loading from "./Loading"
import toast from "react-hot-toast"

const fromApi = (r) => ({
  _id: r.id,
  date: r.attendance_date,
  checkIn: r.check_in,
  checkOut: r.check_out,
  status: r.status,
  workingHours: r.working_hours,
  dayType: r.day_type,
  employee: r.employee
    ? { firstName: r.employee.first_name, lastName: r.employee.last_name }
    : null,
})

const AdminAttendance = () => {
  const { token } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    api
      .get("/attendance/", token)
      .then((data) => isActive && setRecords(data.map(fromApi)))
      .catch((err) => toast.error(err.message || "Failed to load attendance"))
      .finally(() => isActive && setLoading(false))
    return () => {
      isActive = false
    }
  }, [token])

  const today = new Date().toISOString().slice(0, 10)

  const stats = useMemo(() => {
    const todayRecords = records.filter((r) => r.date === today)
    const presentToday = todayRecords.length
    const lateToday = todayRecords.filter((r) => r.status === "LATE").length
    const completed = todayRecords.filter((r) => r.workingHours != null)
    const avgHours = completed.length
      ? (completed.reduce((sum, r) => sum + r.workingHours, 0) / completed.length).toFixed(1)
      : "0.0"

    return { presentToday, lateToday, avgHours }
  }, [records, today])

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title text-2xl font-semibold text-slate-900">Attendance</h1>
        <p className="page-subtitle text-sm text-slate-500">
          Organization-wide attendance overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} label="Present Today" value={stats.presentToday} />
        <StatCard icon={AlertCircle} label="Late Today" value={stats.lateToday} />
        <StatCard icon={Clock} label="Avg. Work Hrs Today" value={`${stats.avgHours} Hrs`} />
      </div>

      <AttendanceTable records={records} showEmployee />
    </div>
  )
}

export default AdminAttendance