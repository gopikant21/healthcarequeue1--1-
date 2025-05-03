import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PharmacistQueueSummary } from "@/components/pharmacist-queue-summary"
import { AppointmentsSummary } from "@/components/appointments-summary"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Clock, Users } from "lucide-react"
import { StaffAvailability } from "@/components/staff-availability"

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="hidden md:flex">
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients in Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Current waiting time: 18 min</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Walk-ins Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 currently waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5/8</div>
              <p className="text-xs text-muted-foreground">Currently on duty</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Live Queue Status</CardTitle>
                <CardDescription>Current queue status for all staff</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Clock className="mr-2 h-4 w-4" />
                Manage Queue
              </Button>
            </CardHeader>
            <CardContent>
              <PharmacistQueueSummary />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Overview of today's schedule</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book
              </Button>
            </CardHeader>
            <CardContent>
              <AppointmentsSummary />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Staff Availability</CardTitle>
                <CardDescription>Today's rota and availability</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Users className="mr-2 h-4 w-4" />
                View Rota
              </Button>
            </CardHeader>
            <CardContent>
              <StaffAvailability />
            </CardContent>
          </Card>
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest patient check-ins and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
