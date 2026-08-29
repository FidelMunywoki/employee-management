import { LogIn, LogOut } from "lucide-react"

const ClockInButton = ({ isCheckedIn, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-3 pl-4 pr-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg transition"
    >
      {isCheckedIn ? <LogOut size={20} /> : <LogIn size={20} />}
      <div className="text-left leading-tight">
        <p className="font-semibold text-sm">
          {isCheckedIn ? "Clock Out" : "Clock In"}
        </p>
        <p className="text-xs text-indigo-100">
          {isCheckedIn ? "end your work day" : "start your work day"}
        </p>
      </div>
    </button>
  )
}

export default ClockInButton