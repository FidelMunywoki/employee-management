import { useEffect, useState } from "react"
import { Plus, Thermometer, Umbrella, Flower2 } from "lucide-react"
import { api } from "../api/client"
import { useAuth } from "../context/useAuth"
import StatCard from "./StatCard"
import LeaveTable from "./LeaveTable"
import ApplyLeaveModal from "./ApplyLeaveModal"
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
})

const EmployeeLeave = () => {
  const { token, user } = useAuth()
  const [myRequests, setMyRequests] = useState([])
  const [summary, setSummary] = useState({ sick_taken: 0, casual_taken: 0, annual_taken: 0 })
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const loadData = async () => {
    const [requests, mySummary] = await Promise.all([
      api.get("/leave/me", token),
      api.get("/leave/me/summary", token),
    ])
    setMyRequests(requests.map(fromApi))
    setSummary(mySummary)
  }

  useEffect(() => {
    let isActive = true

    const fetchData = async () => {
      try {
        const [requests, mySummary] = await Promise.all([
          api.get("/leave/me", token),
          api.get("/leave/me/summary", token),
        ])

        if (!isActive) return

        setMyRequests(requests.map(fromApi))
        setSummary(mySummary)
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

  const handleApply = async (newLeave) => {
    try {
      await api.post(
        "/leave/",
        {
          type: newLeave.type,
          start_date: newLeave.startDate.slice(0, 10),
          end_date: newLeave.endDate.slice(0, 10),
          reason: newLeave.reason,
        },
        token
      )
      toast.success("Leave request submitted")
      setShowApplyModal(false)
      await loadData()
    } catch (err) {
      toast.error(err.message || "Failed to submit leave request")
    }
  }

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in">

      {/* ----- Header ----- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title text-2xl font-semibold text-slate-900">Leave Management</h1>
          <p className="page-subtitle text-sm text-slate-500">Your leave history and requests</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {/* ----- Stat Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Thermometer} label="Sick Leave" value={`${summary.sick_taken} taken`} />
        <StatCard icon={Umbrella} label="Casual Leave" value={`${summary.casual_taken} taken`} />
        <StatCard icon={Flower2} label="Annual Leave" value={`${summary.annual_taken} taken`} />
      </div>

      {/* ----- My Requests Table ----- */}
      <LeaveTable records={myRequests} isAdmin={false} />

      {showApplyModal && (
        <ApplyLeaveModal
          employeeId={user?.id}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
        />
      )}
    </div>
  )
}

export default EmployeeLeave