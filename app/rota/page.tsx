import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffRota } from "@/components/staff-rota"

export default function RotaPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Staff Rota</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Availability Management</CardTitle>
            <CardDescription>Manage staff schedules and service availability</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffRota />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
