import { useEffect, useState } from "react"
import { Thermometer, Umbrella, Flower2 } from "lucide-react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import StatCard from "./StatCard"
import LeaveTable from "./LeaveTable"
import ReviewLeaveModal from "./ReviewLeaveModal"
import Loading from "./Loading"
import toast from "react-hot-toast"

const fromApi = (l) => ({
  _id: l.id,
  employeeId: l.employee_id,
  type: l.type,
  startDate: l.start_date,
  endDate: l.end_date,
  reason: l.reason,
  status: l.status,
  adminComment: l.admin_comment,
  employee: l.employee
    ? { firstName: l.employee.first_name, lastName: l.employee.last_name }
    : null,
})

const AdminLeave = () => {
  const { token } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [summary, setSummary] = useState({ sick_taken: 0, casual_taken: 0, annual_taken: 0 })
  const [loading, setLoading] = useState(true)
  const [reviewingLeave, setReviewingLeave] = useState(null)

  const loadData = async () => {
    const [requests, orgSummary] = await Promise.all([
      api.get("/leave/", token),
      api.get("/leave/summary", token),
    ])
    setLeaveRequests(requests.map(fromApi))
    setSummary(orgSummary)
  }

  useEffect(() => {
    let isActive = true

    const fetchData = async () => {
      try {
        const [requests, orgSummary] = await Promise.all([
          api.get("/leave/", token),
          api.get("/leave/summary", token),
        ])

        if (!isActive) return

        setLeaveRequests(requests.map(fromApi))
        setSummary(orgSummary)
      } catch (err) {
        if (isActive) {
          toast.error(err.message || "Failed to load leave requests")
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [token])

  const handleReviewSubmit = async ({ leaveId, status, comment }) => {
    try {
      await api.patch(`/leave/${leaveId}/review`, { status, comment: comment || null }, token)
      toast.success(`Leave ${status.toLowerCase()}`)
      setReviewingLeave(null)
      await loadData()
    } catch (err) {
      toast.error(err.message || "Failed to submit review")
    }
  }

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in">

      {/* ----- Header ----- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title text-2xl font-semibold text-slate-900">Leave Management</h1>
          <p className="page-subtitle text-sm text-slate-500">Review and action employee leave requests</p>
        </div>
      </div>

      {/* ----- Stat Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Thermometer} label="Sick Leave" value={`${summary.sick_taken} taken`} />
        <StatCard icon={Umbrella} label="Casual Leave" value={`${summary.casual_taken} taken`} />
        <StatCard icon={Flower2} label="Annual Leave" value={`${summary.annual_taken} taken`} />
      </div>

      {/* ----- Requests Table ----- */}
      <LeaveTable
        records={leaveRequests}
        isAdmin
        onReview={setReviewingLeave}
      />

      {reviewingLeave && (
        <ReviewLeaveModal
          leave={reviewingLeave}
          onClose={() => setReviewingLeave(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}

export default AdminLeave