const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex-1 bg-white border-l-4 border-l-slate-300 border-y border-r border-slate-100 rounded-xl px-5 py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-slate-500" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default StatCard