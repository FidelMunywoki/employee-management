import { useEffect, useState } from "react"
import { Calendar, AlertCircle, Clock } from "lucide-react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import StatCard from "./StatCard"
import AttendanceTable from "./AttendanceTable"
import ClockInButton from "./ClockInButton"
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
})

const EmployeeAttendance = () => {
  const { token } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ days_present: 0, late_arrivals: 0, avg_work_hours: 0 })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const isCheckedIn = records.some((r) => r.date === today && !r.checkOut)

  const loadData = async () => {
    try {
      const [history, mySummary] = await Promise.all([
        api.get("/attendance/me", token),
        api.get("/attendance/me/summary", token),
      ])
      setRecords(history.map(fromApi))
      setSummary(mySummary)
    } catch (err) {
      toast.error(err.message || "Failed to load attendance")
    }
  }

  useEffect(() => {
    let isActive = true

    const initializeData = async () => {
      try {
        const [history, mySummary] = await Promise.all([
          api.get("/attendance/me", token),
          api.get("/attendance/me/summary", token),
        ])
        if (isActive) {
          setRecords(history.map(fromApi))
          setSummary(mySummary)
        }
      } catch (err) {
        if (isActive) {
          toast.error(err.message || "Failed to load attendance")
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    initializeData()

    return () => {
      isActive = false
    }
  }, [token])

  const handleClockToggle = async () => {
    setToggling(true)
    try {
      if (!isCheckedIn) {
        await api.post("/attendance/clock-in", {}, token)
        toast.success("Clocked in")
      } else {
        await api.post("/attendance/clock-out", {}, token)
        toast.success("Clocked out")
      }
      await loadData()
    } catch (err) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setToggling(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title text-2xl font-semibold text-slate-900">Attendance</h1>
        <p className="page-subtitle text-sm text-slate-500">
          Track your work hours and daily check-ins
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Calendar} label="Days Present" value={summary.days_present} />
        <StatCard icon={AlertCircle} label="Late Arrivals" value={summary.late_arrivals} />
        <StatCard icon={Clock} label="Avg. Work Hrs" value={`${summary.avg_work_hours} Hrs`} />
      </div>

      <AttendanceTable records={records} />

      <ClockInButton isCheckedIn={isCheckedIn} onClick={handleClockToggle} disabled={toggling} />
    </div>
  )
}

export default EmployeeAttendance