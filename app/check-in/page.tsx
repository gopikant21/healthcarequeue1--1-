import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientCheckIn } from "@/components/patient-check-in"

export default function CheckInPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Patient Check-In</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check-In Management</CardTitle>
            <CardDescription>Process patient check-ins and manage pre-visit information</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientCheckIn />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
