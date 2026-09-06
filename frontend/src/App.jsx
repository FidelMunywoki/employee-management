import { Toaster } from "react-hot-toast"
import { Route, Routes, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Employee from "./pages/Employee"
import Attendance from "./pages/Attendance"
import Leave from "./pages/Leave"
import Payslips from "./pages/Payslips"
import Layout from "./pages/Layout"
import PrintPayslip from "./pages/PrintPayslip"
import Settings from "./pages/Settings"
import LoginForm from "./components/LoginForm"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"


const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={
            <LoginForm
              title="Welcome Back"
              subtitle="Sign in to access your account"
            />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employee" element={<Employee />} />
             <Route element={<AdminRoute />}>
                <Route path="/employee" element={<Employee />} />
             </Route>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="/print/payslip/:id" element={<PrintPayslip />} />
        <Route path="*" element={<Navigate to="/dashboard" replace/>} />
      </Routes>
    </div>
  )
}

export default App