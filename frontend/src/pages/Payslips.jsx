import { useEffect, useState } from "react"
import Loading from "../components/Loading"
import AdminPayslips from "../components/AdminPayslips"
import EmployeePayslips from "../components/EmployeePayslips"

const Payslips = () => {
  const [loading, setLoading] = useState(true)
  const isAdmin = true // This should come from your auth context or API

  useEffect(() => {
    // placeholder for when this fetches from a real API instead of dummy data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Loading />

  return <div className="animate-fade-in">{isAdmin ? <AdminPayslips /> : <EmployeePayslips />}</div>
}

export default Payslips