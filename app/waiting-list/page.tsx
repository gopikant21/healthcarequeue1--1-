import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WaitingListManagement } from "@/components/waiting-list-management"

export default function WaitingListPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Waiting List</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Waiting List Management</CardTitle>
            <CardDescription>Manage patients waiting for available appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitingListManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
