import AdminSettings from "../components/AdminSettings"
import EmployeeSettings from "../components/EmployeeSettings"

const Settings = () => {
  const isAdmin = true // This should come from your auth context or API

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          {isAdmin ? "Manage employee profiles and your account" : "Manage your account"}
        </p>
      </div>

      {isAdmin ? <AdminSettings /> : <EmployeeSettings />}
    </div>
  )
}

export default Settings