import { Toaster } from "react-hot-toast"
import { Route, Routes, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Employee from "./pages/Employee"
import Attendance from "./pages/Attendance"
import Leave from "./pages/Leave"
import Payslips from "./pages/Payslips"
import LoginLanding from "./pages/LoginLanding"
import Layout from "./pages/Layout"
import PrintPayslip from "./pages/PrintPayslip"
import Settings from "./pages/Settings"
import LoginForm from "./components/LoginForm"


const App = () => {
  return (
    <div>
      {/* // Your app content goes here */}


      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginLanding />} />

        <Route path="/login/admin" element={<LoginForm role="admin" title="Admin Portal" subtitle="Sign in to manage the organization" />} />
        <Route path="/login/employee" element={<LoginForm role="employee" title="Employee Portal" subtitle="Sign in to access your profile" />} />


        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/print/payslip/:id" element={<PrintPayslip />} />
        <Route path="*" element={<Navigate to="/dashboard" replace/>} />
      </Routes>
    </div>
  )
}

export default App