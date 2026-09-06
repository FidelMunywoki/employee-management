import { useEffect, useState } from "react"
import Loading from "../components/Loading"
import EmployeeDashboard from "../components/EmployeeDashboard"
import AdminDashboard from "../components/AdminDashboard"
import { useAuth } from "../context/useAuth"
import { api } from "../api/client"

const Dashboard = () => {
  const { user, isAdmin, token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadAdminData = async () => {
      const [employees, attendance, pendingLeaves] = await Promise.all([
        api.get("/employees/", token),
        api.get("/attendance/", token),
        api.get("/leave/?status=PENDING", token),
      ])

      const today = new Date().toISOString().slice(0, 10)
      const todayAttendance = attendance.filter(
        (a) => a.attendance_date === today
      ).length

      const totalDepartments = new Set(employees.map((e) => e.department)).size

      return {
        totalEmployees: employees.length,
        totalDepartments,
        todayAttendance,
        pendingLeaves: pendingLeaves.length,
      }
    }

    const loadEmployeeData = async () => {
      const now = new Date()
      const [attendance, myLeave, myPayslips] = await Promise.all([
        api.get("/attendance/me", token),
        api.get("/leave/me", token),
        api.get("/payslips/me", token),
      ])

      const currentMonthAttendance = attendance.filter((a) => {
        const d = new Date(a.attendance_date)
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          (a.status === "PRESENT" || a.status === "LATE")
        )
      }).length

      const pendingLeaves = myLeave.filter((l) => l.status === "PENDING").length

      const latestPayslip = myPayslips[0]
        ? { netSalary: myPayslips[0].net_salary }
        : null

      return {
        currentMonthAttendance,
        pendingLeaves,
        latestPayslip,
        employee: {
          firstName: user.first_name,
          position: user.position,
          department: user.department,
        },
      }
    }

    const load = async () => {
      try {
        const result = isAdmin ? await loadAdminData() : await loadEmployeeData()
        if (isActive) setData(result)
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
        if (isActive) setData(null)
      } finally {
        if (isActive) setLoading(false)
      }
    }

    if (user) load()

    return () => {
      isActive = false
    }
  }, [user, isAdmin, token])

  if (loading) return <Loading />
  if (!data) return <p className="text-center text-slate-500 py-12">No data available</p>

  return isAdmin ? <AdminDashboard data={data} /> : <EmployeeDashboard data={data} />
}

export default Dashboard