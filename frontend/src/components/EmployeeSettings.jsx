import { useState } from "react"
import { dummyEmployeeData } from "../assets/assets"
import ProfileDetailsForm from "./ProfileDetailsForm"
import ChangePasswordForm from "./ChangePasswordForm"

// Swap for the logged-in user's real record once auth is wired up
const CURRENT_EMPLOYEE_ID = "69b411e6f8a807df391d7b13"

const EmployeeSettings = () => {
  const [employee, setEmployee] = useState(
    dummyEmployeeData.find((e) => e._id === CURRENT_EMPLOYEE_ID)
  )

  const handleSave = (updated) => {
    // TODO: PATCH this to your own-profile endpoint
    console.log("Saving own profile:", updated)
    setEmployee(updated)
  }

  return (
    <div className="space-y-6">
      <ProfileDetailsForm employee={employee} onSave={handleSave} />
      <ChangePasswordForm />
    </div>
  )
}

export default EmployeeSettings