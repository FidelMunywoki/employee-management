import { useMemo, useState } from "react"
import { Plus, Thermometer, Umbrella, Flower2 } from "lucide-react"
import { dummyLeaveData } from "../assets/assets"
import StatCard from "../components/StatCard"
import LeaveTable from "../components/LeaveTable"
import ApplyLeaveModal from "../components/ApplyLeaveModal"

// Swap this for the logged-in user's real id once auth is wired up
const CURRENT_EMPLOYEE_ID = "69b411e6f8a807df391d7b13"

const Leave = () => {
  const [leaveRequests, setLeaveRequests] = useState(dummyLeaveData)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const myRequests = useMemo(
    () => leaveRequests.filter((l) => l.employeeId === CURRENT_EMPLOYEE_ID),
    [leaveRequests]
  )

  const stats = useMemo(() => {
    const countTaken = (type) =>
      myRequests.filter((l) => l.type === type && l.status === "APPROVED").length

    return {
      sick: countTaken("SICK"),
      casual: countTaken("CASUAL"),
      annual: countTaken("ANNUAL"),
    }
  }, [myRequests])

  const handleApply = (newLeave) => {
    setLeaveRequests((prev) => [newLeave, ...prev])
    setShowApplyModal(false)
  }

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
        <StatCard icon={Thermometer} label="Sick Leave" value={`${stats.sick} taken`} />
        <StatCard icon={Umbrella} label="Casual Leave" value={`${stats.casual} taken`} />
        <StatCard icon={Flower2} label="Annual Leave" value={`${stats.annual} taken`} />
      </div>

      {/* ----- My Requests Table ----- */}
      <LeaveTable records={myRequests} isAdmin={false} />

      {showApplyModal && (
        <ApplyLeaveModal
          employeeId={CURRENT_EMPLOYEE_ID}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
        />
      )}
    </div>
  )
}

export default Leave