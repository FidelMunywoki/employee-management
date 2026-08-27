import { useEffect, useState } from "react"
import { dummyEmployeeDashboardData } from "../assets/assets"
import Loading from "../components/Loading"
import EmployeeDashboard from "../components/EmployeeDashboard"

const Dashboard = () => {

  const [data] = useState(dummyEmployeeDashboardData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading)  return <Loading />
  if(!data) return <p className="text-center text-slate-500 py-12">No data available</p>

  if(data.role === "ADMIN") {
    return  <div>Admin Dashboard</div>
  } else {
    return <EmployeeDashboard data={data} />
  }

}

export default Dashboard