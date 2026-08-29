import { useMemo, useState } from "react"
import { Calendar, AlertCircle, Clock } from "lucide-react"
import { dummyAttendanceData } from "../assets/assets"
import StatCard from "../components/StatCard"
import AttendanceTable from "../components/AttendanceTable"
import ClockInButton from "../components/ClockInButton"

const Attendance = () => {
  const [records, setRecords] = useState(dummyAttendanceData)
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  const stats = useMemo(() => {
    const daysPresent = records.filter((r) => r.status === "PRESENT").length
    const lateArrivals = records.filter((r) => r.status === "LATE").length
    const hoursRecorded = records.filter((r) => r.workingHours != null)
    const avgHours = hoursRecorded.length
      ? hoursRecorded.reduce((sum, r) => sum + r.workingHours, 0) / hoursRecorded.length
      : 0

    return {
      daysPresent,
      lateArrivals,
      avgHours: avgHours.toFixed(1),
    }
  }, [records])

  const handleClockToggle = () => {
    if (!isCheckedIn) {
      const newRecord = {
        _id: `temp-${Date.now()}`,
        employeeId: "current-user",
        date: new Date().toISOString(),
        checkIn: new Date().toISOString(),
        checkOut: null,
        status: "PRESENT",
        workingHours: null,
        dayType: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRecords((prev) => [newRecord, ...prev])
      setIsCheckedIn(true)
    } else {
      setRecords((prev) =>
        prev.map((r, i) =>
          i === 0 && r.checkOut === null
            ? { ...r, checkOut: new Date().toISOString() }
            : r
        )
      )
      setIsCheckedIn(false)
    }
  }

  return (
    <div className="animate-fade-in">

      {/* ----- Header ----- */}
      <div className="mb-8">
        <h1 className="page-title text-2xl font-semibold text-slate-900">Attendance</h1>
        <p className="page-subtitle text-sm text-slate-500">
          Track your work hours and daily check-ins
        </p>
      </div>

      {/* ----- Stat Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Calendar} label="Days Present" value={stats.daysPresent} />
        <StatCard icon={AlertCircle} label="Late Arrivals" value={stats.lateArrivals} />
        <StatCard icon={Clock} label="Avg. Work Hrs" value={`${stats.avgHours} Hrs`} />
      </div>

      {/* ----- Recent Activity ----- */}
      <AttendanceTable records={records} />

      {/* ----- Floating Clock In/Out ----- */}
      <ClockInButton isCheckedIn={isCheckedIn} onClick={handleClockToggle} />
    </div>
  )
}

export default Attendance