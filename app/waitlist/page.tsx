import { DashboardHeader } from "@/components/dashboard-header"
import { WaitlistManagement } from "@/components/waitlist-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WaitlistPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Waitlist Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Waitlist</CardTitle>
            <CardDescription>Manage patients waiting for available appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitlistManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
